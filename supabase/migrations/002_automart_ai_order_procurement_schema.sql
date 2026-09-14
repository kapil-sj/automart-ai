-- Migration: 002_automart_ai_order_procurement_schema.sql
-- Description: Deterministic evolution of 001_initial_schema.sql to production AutoMart AI economics & autonomous procurement model.
-- Safe, deterministic, non-destructive migration preserving all existing catalog, categories, users, and historical records.

BEGIN;

-- ============================================================================
-- 1. EXTENSIONS, ENUMS & SEQUENCES
-- ============================================================================

-- Add 'commission' to financial transaction types if not present
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumtypid = 'public.financial_transaction_type'::regtype 
          AND enumlabel = 'commission'
    ) THEN
        ALTER TYPE public.financial_transaction_type ADD VALUE 'commission';
    END IF;
END $$;

-- Create order_item_status enum if not present
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'order_item_status'
    ) THEN
        CREATE TYPE public.order_item_status AS ENUM (
            'pending',
            'sourced',
            'procured',
            'shipped',
            'delivered',
            'cancelled',
            'refunded'
        );
    END IF;
END $$;

-- Sequence for human-readable external order reference (AM-YYYY-XXXXXX)
CREATE SEQUENCE IF NOT EXISTS public.order_ref_seq START WITH 1001 INCREMENT BY 1;

-- ============================================================================
-- 2. CURRENCY ALIGNMENT (INDIA-FIRST INR DEFAULTS)
-- ============================================================================

ALTER TABLE public.products ALTER COLUMN currency SET DEFAULT 'INR';
UPDATE public.products SET currency = 'INR' WHERE currency = 'USD';

ALTER TABLE public.orders ALTER COLUMN currency SET DEFAULT 'INR';
ALTER TABLE public.payments ALTER COLUMN currency SET DEFAULT 'INR';
ALTER TABLE public.financial_transactions ALTER COLUMN currency SET DEFAULT 'INR';
ALTER TABLE public.supplier_offers ALTER COLUMN currency SET DEFAULT 'INR';
ALTER TABLE public.supplier_payouts ALTER COLUMN currency SET DEFAULT 'INR';

-- ============================================================================
-- 3. EVOLVE SUPPLIER OFFERS
-- ============================================================================

-- Add surrogate UUID unique key to supplier_offers while retaining existing composite primary key (supplier_id, product_id)
ALTER TABLE public.supplier_offers 
    ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid();

-- Populate existing rows with an ID if any were null
UPDATE public.supplier_offers SET id = gen_random_uuid() WHERE id IS NULL;

ALTER TABLE public.supplier_offers 
    ALTER COLUMN id SET NOT NULL;

-- Ensure unique constraint on id so it can be referenced as a foreign key by supplier_offer_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'supplier_offers_id_key'
    ) THEN
        ALTER TABLE public.supplier_offers ADD CONSTRAINT supplier_offers_id_key UNIQUE (id);
    END IF;
END $$;

-- Add granular cost breakdown, MOQ, landed cost, and auditing metadata
ALTER TABLE public.supplier_offers 
    ADD COLUMN IF NOT EXISTS shipping_cost numeric(12, 2) NOT NULL DEFAULT 0 CHECK (shipping_cost >= 0),
    ADD COLUMN IF NOT EXISTS other_costs numeric(12, 2) NOT NULL DEFAULT 0 CHECK (other_costs >= 0),
    ADD COLUMN IF NOT EXISTS min_order_quantity integer NOT NULL DEFAULT 1 CHECK (min_order_quantity >= 1),
    ADD COLUMN IF NOT EXISTS last_checked_at timestamptz NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Add landed_cost generated stored column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'supplier_offers' AND column_name = 'landed_cost'
    ) THEN
        ALTER TABLE public.supplier_offers 
            ADD COLUMN landed_cost numeric(12, 2) 
            GENERATED ALWAYS AS (unit_cost + shipping_cost + other_costs) STORED;
    END IF;
END $$;

-- ============================================================================
-- 4. EVOLVE ORDERS TABLE
-- ============================================================================

-- Drop all old client write/read policies on orders, order_items, shipments
DROP POLICY IF EXISTS orders_select_own ON public.orders;
DROP POLICY IF EXISTS orders_insert_own ON public.orders;
DROP POLICY IF EXISTS orders_update_own_pending ON public.orders;
DROP POLICY IF EXISTS order_items_select_own ON public.order_items;
DROP POLICY IF EXISTS order_items_insert_own ON public.order_items;
DROP POLICY IF EXISTS order_items_update_own_pending ON public.order_items;
DROP POLICY IF EXISTS shipments_select_own ON public.shipments;

-- Drop old index on customer_id to avoid redundant index post-rename
DROP INDEX IF EXISTS public.orders_customer_created_idx;

-- Drop existing total_amount generated column
ALTER TABLE public.orders DROP COLUMN IF EXISTS total_amount;

-- Rename columns safely with data preservation
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'customer_id'
    ) THEN
        ALTER TABLE public.orders RENAME COLUMN customer_id TO user_id;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'subtotal'
    ) THEN
        ALTER TABLE public.orders RENAME COLUMN subtotal TO subtotal_inr;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'shipping_amount'
    ) THEN
        ALTER TABLE public.orders RENAME COLUMN shipping_amount TO shipping_inr;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'tax_amount'
    ) THEN
        ALTER TABLE public.orders RENAME COLUMN tax_amount TO other_fees_inr;
    END IF;
END $$;

-- Add new AutoMart AI economics & order tracking columns
--
-- ============================================================================
-- COMMISSION & PRICING MODEL:
-- AutoMart commission is INCLUDED within the customer selling price (subtotal_inr).
-- orders.total_inr = subtotal_inr + shipping_inr + other_fees_inr
-- Commission is NOT added on top of subtotal; orders.automart_commission_inr represents
-- the AutoMart commission/revenue component included in the customer selling price.
-- Actual platform profit will be calculated later from the financial ledger after
-- supplier costs, payment fees, refunds, advertising costs, etc.
-- ============================================================================
ALTER TABLE public.orders
    ADD COLUMN IF NOT EXISTS external_order_ref text UNIQUE,
    ADD COLUMN IF NOT EXISTS automart_commission_inr numeric(12, 2) NOT NULL DEFAULT 0 CHECK (automart_commission_inr >= 0),
    ADD COLUMN IF NOT EXISTS billing_address jsonb,
    ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Recreate authoritative total_inr as generated stored column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'total_inr'
    ) THEN
        ALTER TABLE public.orders 
            ADD COLUMN total_inr numeric(12, 2) 
            GENERATED ALWAYS AS (subtotal_inr + shipping_inr + other_fees_inr) STORED;
    END IF;
END $$;

-- Function & Trigger to automatically generate external_order_ref if omitted
CREATE OR REPLACE FUNCTION public.set_external_order_ref()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.external_order_ref IS NULL OR trim(NEW.external_order_ref) = '' THEN
        NEW.external_order_ref := 'AM-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.order_ref_seq')::text, 6, '0');
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_external_ref_trigger ON public.orders;
CREATE TRIGGER orders_external_ref_trigger
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.set_external_order_ref();

-- ============================================================================
-- 5. EVOLVE ORDER ITEMS TABLE
-- ============================================================================

-- Drop existing line_total generated column
ALTER TABLE public.order_items DROP COLUMN IF EXISTS line_total;

-- Rename unit_price to unit_price_inr
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'order_items' AND column_name = 'unit_price'
    ) THEN
        ALTER TABLE public.order_items RENAME COLUMN unit_price TO unit_price_inr;
    END IF;
END $$;

-- Add AutoMart AI landed cost breakdown and historical offer snapshot
--
-- ============================================================================
-- ITEM PRICING MODEL:
-- customer selling price (unit_price_inr) = landed_cost_inr + automart_commission_inr
-- where automart_commission_inr is the AutoMart commission/revenue component included in the customer selling price.
-- total_price_inr = quantity * unit_price_inr
-- supplier_offer_snapshot is a historical snapshot intended to be frozen by
-- trusted server-side order/procurement logic at the time of order/procurement.
-- ============================================================================
ALTER TABLE public.order_items
    ADD COLUMN IF NOT EXISTS shipping_inr numeric(12, 2) NOT NULL DEFAULT 0 CHECK (shipping_inr >= 0),
    ADD COLUMN IF NOT EXISTS other_costs_inr numeric(12, 2) NOT NULL DEFAULT 0 CHECK (other_costs_inr >= 0),
    ADD COLUMN IF NOT EXISTS landed_cost_inr numeric(12, 2) NOT NULL DEFAULT 0 CHECK (landed_cost_inr >= 0),
    ADD COLUMN IF NOT EXISTS automart_commission_inr numeric(12, 2) NOT NULL DEFAULT 0 CHECK (automart_commission_inr >= 0),
    ADD COLUMN IF NOT EXISTS supplier_offer_id uuid REFERENCES public.supplier_offers(id) ON DELETE RESTRICT,
    ADD COLUMN IF NOT EXISTS supplier_offer_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS status public.order_item_status NOT NULL DEFAULT 'pending';

-- Recreate authoritative total_price_inr as generated stored column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'order_items' AND column_name = 'total_price_inr'
    ) THEN
        ALTER TABLE public.order_items 
            ADD COLUMN total_price_inr numeric(12, 2) 
            GENERATED ALWAYS AS (quantity * unit_price_inr) STORED;
    END IF;
END $$;

-- Backfill historical order_items supplier_offer_id if matching supplier_offers exist
UPDATE public.order_items oi
SET supplier_offer_id = so.id
FROM public.supplier_offers so
WHERE oi.supplier_id = so.supplier_id 
  AND oi.product_id = so.product_id 
  AND oi.supplier_offer_id IS NULL;

-- ============================================================================
-- 6. EVOLVE PROCUREMENT DECISIONS
-- ============================================================================

ALTER TABLE public.procurement_decisions
    ADD COLUMN IF NOT EXISTS supplier_offer_id uuid REFERENCES public.supplier_offers(id) ON DELETE RESTRICT,
    ADD COLUMN IF NOT EXISTS confidence_score numeric(5, 4) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    ADD COLUMN IF NOT EXISTS decision_payload jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Backfill historical procurement_decisions supplier_offer_id if matching supplier_offers exist
UPDATE public.procurement_decisions pd
SET supplier_offer_id = so.id
FROM public.supplier_offers so
WHERE pd.supplier_id = so.supplier_id 
  AND pd.product_id = so.product_id 
  AND pd.supplier_offer_id IS NULL;

-- Update procurement decision validator function to support surrogate supplier_offer_id
CREATE OR REPLACE FUNCTION public.validate_procurement_decision()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    offer public.supplier_offers%ROWTYPE;
BEGIN
    IF NEW.supplier_offer_id IS NOT NULL THEN
        SELECT * INTO offer
        FROM public.supplier_offers
        WHERE id = NEW.supplier_offer_id;
    ELSE
        SELECT * INTO offer
        FROM public.supplier_offers
        WHERE supplier_id = NEW.supplier_id AND product_id = NEW.product_id;
    END IF;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Procurement decision must reference an existing supplier offer';
    END IF;

    -- Sync keys if one was provided
    NEW.supplier_id := offer.supplier_id;
    NEW.product_id := offer.product_id;
    NEW.supplier_offer_id := offer.id;

    IF NEW.status = 'approved' AND NOT offer.is_active THEN
        RAISE EXCEPTION 'Only active supplier offers can be approved';
    END IF;

    IF NEW.requested_quantity > offer.available_quantity AND NEW.status IN ('approved', 'fulfilled') THEN
        RAISE EXCEPTION 'Procurement quantity exceeds supplier offer availability';
    END IF;

    IF NEW.order_item_id IS NOT NULL AND NOT EXISTS (
        SELECT 1
        FROM public.order_items
        WHERE id = NEW.order_item_id
          AND product_id = NEW.product_id
          AND (supplier_id IS NULL OR supplier_id = NEW.supplier_id)
    ) THEN
        RAISE EXCEPTION 'Procurement decision does not match its order item';
    END IF;

    RETURN NEW;
END;
$$;

-- ============================================================================
-- 7. EVOLVE PAYMENTS TABLE
-- ============================================================================

ALTER TABLE public.payments
    ADD COLUMN IF NOT EXISTS idempotency_key text UNIQUE,
    ADD COLUMN IF NOT EXISTS refund_amount numeric(12, 2) NOT NULL DEFAULT 0 CHECK (refund_amount >= 0),
    ADD COLUMN IF NOT EXISTS refunded_at timestamptz,
    ADD COLUMN IF NOT EXISTS refund_reason text,
    ADD COLUMN IF NOT EXISTS error_message text,
    ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

-- ============================================================================
-- 8. EVOLVE FINANCIAL TRANSACTIONS
-- ============================================================================

ALTER TABLE public.financial_transactions
    ADD COLUMN IF NOT EXISTS supplier_id uuid REFERENCES public.suppliers(id) ON DELETE RESTRICT,
    ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

-- ============================================================================
-- 9. EVOLVE PRODUCT INVENTORY
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'product_inventory' AND column_name = 'available_quantity'
    ) THEN
        ALTER TABLE public.product_inventory
            ADD COLUMN available_quantity integer 
            GENERATED ALWAYS AS (quantity_on_hand - quantity_reserved) STORED;
    END IF;
END $$;

-- ============================================================================
-- 10. EVOLVE SHIPMENTS TABLE
-- ============================================================================

ALTER TABLE public.shipments
    ADD COLUMN IF NOT EXISTS order_item_id uuid REFERENCES public.order_items(id) ON DELETE RESTRICT,
    ADD COLUMN IF NOT EXISTS supplier_id uuid REFERENCES public.suppliers(id) ON DELETE RESTRICT,
    ADD COLUMN IF NOT EXISTS tracking_url text,
    ADD COLUMN IF NOT EXISTS shipping_label_url text,
    ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

-- ============================================================================
-- 11. EVOLVE SUPPLIER PAYOUTS TABLE
-- ============================================================================

ALTER TABLE public.supplier_payouts
    ADD COLUMN IF NOT EXISTS payout_reference text,
    ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

-- ============================================================================
-- 12. EVOLVE AI ACTIVITY LOG TABLE
-- ============================================================================

ALTER TABLE public.ai_activity_log
    ADD COLUMN IF NOT EXISTS confidence_score numeric(5, 4) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    ADD COLUMN IF NOT EXISTS reasoning text,
    ADD COLUMN IF NOT EXISTS decision_payload jsonb NOT NULL DEFAULT '{}'::jsonb;

-- ============================================================================
-- 13. AUTOMATED USER PROFILE CREATION HOOK
-- ============================================================================

-- Ensures every customer signup in auth.users automatically gets a customer profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.app_profiles (user_id, display_name, role)
    VALUES (
        NEW.id,
        coalesce(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        'customer'
    )
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 14. ROW-LEVEL SECURITY & PERMISSION HARDENING
-- ============================================================================
-- CRITICAL SECURITY RULE:
-- Customers may ONLY SELECT their own orders, order_items, shipments, and profile.
-- Customers CANNOT INSERT, UPDATE, or DELETE orders or order_items directly.
-- All writes to orders, order_items, payments, transactions, procurement,
-- inventory, supplier offers, supplier payouts, and AI logs MUST be performed
-- by trusted server-side operations (service_role).
-- ============================================================================

-- Table-level write privilege revocation (defense in depth)
REVOKE INSERT, UPDATE, DELETE ON public.orders FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.order_items FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.shipments FROM anon, authenticated;

-- Ensure authenticated role has SELECT only
GRANT SELECT ON public.orders TO authenticated;
GRANT SELECT ON public.order_items TO authenticated;
GRANT SELECT ON public.shipments TO authenticated;

-- Explicitly enable RLS on customer-visible tables before policy attachment
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

-- Customers can only read their own orders
CREATE POLICY orders_select_own
ON public.orders FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Customers can only read items from their own orders
CREATE POLICY order_items_select_own
ON public.order_items FOR SELECT
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
));

-- Customers can only read shipments from their own orders
CREATE POLICY shipments_select_own
ON public.shipments FOR SELECT
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = shipments.order_id AND orders.user_id = auth.uid()
));

-- Operational tables remain completely closed to client roles (both anon and authenticated)
REVOKE ALL ON TABLE
    public.suppliers,
    public.supplier_offers,
    public.product_inventory,
    public.payments,
    public.financial_transactions,
    public.supplier_payouts,
    public.procurement_decisions,
    public.ai_activity_log
FROM anon, authenticated;

-- ============================================================================
-- 15. PERFORMANCE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS orders_user_id_idx ON public.orders (user_id, created_at DESC);
-- Note: orders_external_ref_idx omitted because external_order_ref has a UNIQUE constraint/index.
CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON public.order_items (order_id);
CREATE INDEX IF NOT EXISTS order_items_supplier_offer_idx ON public.order_items (supplier_offer_id);
CREATE INDEX IF NOT EXISTS supplier_offers_product_active_idx ON public.supplier_offers (product_id, is_active, unit_cost ASC);
CREATE INDEX IF NOT EXISTS payments_idempotency_idx ON public.payments (idempotency_key);
CREATE INDEX IF NOT EXISTS financial_transactions_supplier_idx ON public.financial_transactions (supplier_id);
CREATE INDEX IF NOT EXISTS shipments_tracking_idx ON public.shipments (carrier, tracking_number);

COMMIT;
