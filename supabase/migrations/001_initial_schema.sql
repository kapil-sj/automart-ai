BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE public.app_role AS ENUM ('customer', 'admin', 'operations', 'finance', 'procurement');
CREATE TYPE public.product_status AS ENUM ('draft', 'active', 'inactive', 'discontinued');
CREATE TYPE public.supplier_status AS ENUM ('pending', 'active', 'suspended', 'inactive');
CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
CREATE TYPE public.payment_status AS ENUM ('pending', 'authorized', 'paid', 'failed', 'refunded', 'partially_refunded');
CREATE TYPE public.shipment_status AS ENUM ('pending', 'label_created', 'in_transit', 'delivered', 'returned', 'cancelled');
CREATE TYPE public.financial_transaction_type AS ENUM ('sale', 'refund', 'supplier_payout', 'fee', 'adjustment');
CREATE TYPE public.payout_status AS ENUM ('pending', 'approved', 'paid', 'failed', 'cancelled');
CREATE TYPE public.procurement_decision_status AS ENUM ('proposed', 'approved', 'rejected', 'fulfilled', 'cancelled');
CREATE TYPE public.ai_activity_type AS ENUM ('recommendation', 'forecast', 'procurement_decision', 'fraud_check', 'classification', 'other');

CREATE TABLE public.app_profiles (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name text,
    role public.app_role NOT NULL DEFAULT 'customer',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.product_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    description text,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id uuid REFERENCES public.product_categories(id) ON DELETE RESTRICT,
    sku text NOT NULL UNIQUE,
    name text NOT NULL,
    description text,
    price numeric(12, 2) NOT NULL CHECK (price >= 0),
    currency char(3) NOT NULL DEFAULT 'USD',
    status public.product_status NOT NULL DEFAULT 'draft',
    image_url text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.suppliers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    contact_email text,
    status public.supplier_status NOT NULL DEFAULT 'pending',
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.supplier_offers (
    supplier_id uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE RESTRICT,
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    supplier_sku text,
    unit_cost numeric(12, 2) NOT NULL CHECK (unit_cost >= 0),
    currency char(3) NOT NULL DEFAULT 'USD',
    available_quantity integer NOT NULL DEFAULT 0 CHECK (available_quantity >= 0),
    lead_time_days integer NOT NULL DEFAULT 0 CHECK (lead_time_days >= 0),
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (supplier_id, product_id)
);

CREATE TABLE public.product_inventory (
    product_id uuid PRIMARY KEY REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity_on_hand integer NOT NULL DEFAULT 0 CHECK (quantity_on_hand >= 0),
    quantity_reserved integer NOT NULL DEFAULT 0 CHECK (quantity_reserved >= 0),
    reorder_point integer NOT NULL DEFAULT 0 CHECK (reorder_point >= 0),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CHECK (quantity_reserved <= quantity_on_hand)
);

CREATE TABLE public.orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    status public.order_status NOT NULL DEFAULT 'pending',
    currency char(3) NOT NULL DEFAULT 'USD',
    subtotal numeric(12, 2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
    shipping_amount numeric(12, 2) NOT NULL DEFAULT 0 CHECK (shipping_amount >= 0),
    tax_amount numeric(12, 2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
    total_amount numeric(12, 2) GENERATED ALWAYS AS (subtotal + shipping_amount + tax_amount) STORED,
    shipping_address jsonb NOT NULL,
    placed_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT,
    line_number integer NOT NULL CHECK (line_number > 0),
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    supplier_id uuid,
    quantity integer NOT NULL CHECK (quantity > 0),
    unit_price numeric(12, 2) NOT NULL CHECK (unit_price >= 0),
    line_total numeric(12, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (order_id, line_number),
    FOREIGN KEY (supplier_id, product_id)
        REFERENCES public.supplier_offers (supplier_id, product_id)
        ON DELETE RESTRICT
);

CREATE TABLE public.shipments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT,
    carrier text,
    tracking_number text,
    status public.shipment_status NOT NULL DEFAULT 'pending',
    shipped_at timestamptz,
    delivered_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (carrier, tracking_number)
);

CREATE TABLE public.payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT,
    provider text NOT NULL,
    provider_payment_id text NOT NULL,
    status public.payment_status NOT NULL DEFAULT 'pending',
    amount numeric(12, 2) NOT NULL CHECK (amount >= 0),
    currency char(3) NOT NULL DEFAULT 'USD',
    paid_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (provider, provider_payment_id)
);

CREATE TABLE public.financial_transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid REFERENCES public.orders(id) ON DELETE RESTRICT,
    payment_id uuid REFERENCES public.payments(id) ON DELETE RESTRICT,
    transaction_type public.financial_transaction_type NOT NULL,
    amount numeric(12, 2) NOT NULL CHECK (amount >= 0),
    currency char(3) NOT NULL DEFAULT 'USD',
    description text,
    occurred_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now(),
    CHECK (order_id IS NOT NULL OR payment_id IS NOT NULL)
);

CREATE TABLE public.supplier_payouts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE RESTRICT,
    order_id uuid REFERENCES public.orders(id) ON DELETE RESTRICT,
    financial_transaction_id uuid REFERENCES public.financial_transactions(id) ON DELETE RESTRICT,
    amount numeric(12, 2) NOT NULL CHECK (amount >= 0),
    currency char(3) NOT NULL DEFAULT 'USD',
    status public.payout_status NOT NULL DEFAULT 'pending',
    paid_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.procurement_decisions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_item_id uuid REFERENCES public.order_items(id) ON DELETE RESTRICT,
    supplier_id uuid NOT NULL,
    product_id uuid NOT NULL,
    status public.procurement_decision_status NOT NULL DEFAULT 'proposed',
    requested_quantity integer NOT NULL CHECK (requested_quantity > 0),
    unit_cost numeric(12, 2) NOT NULL CHECK (unit_cost >= 0),
    rationale text,
    decided_by uuid REFERENCES auth.users(id) ON DELETE RESTRICT,
    decided_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    FOREIGN KEY (supplier_id, product_id)
        REFERENCES public.supplier_offers (supplier_id, product_id)
        ON DELETE RESTRICT
);

CREATE TABLE public.ai_activity_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_type public.ai_activity_type NOT NULL,
    actor_user_id uuid REFERENCES auth.users(id) ON DELETE RESTRICT,
    entity_type text,
    entity_id uuid,
    model_name text,
    input_hash text,
    input_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    output_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX product_categories_active_idx ON public.product_categories (is_active);
CREATE INDEX products_category_status_idx ON public.products (category_id, status);
CREATE INDEX orders_customer_created_idx ON public.orders (customer_id, created_at DESC);
CREATE INDEX order_items_product_idx ON public.order_items (product_id);
CREATE INDEX shipments_order_idx ON public.shipments (order_id);
CREATE INDEX payments_order_idx ON public.payments (order_id);
CREATE INDEX financial_transactions_order_idx ON public.financial_transactions (order_id, occurred_at DESC);
CREATE INDEX supplier_payouts_supplier_status_idx ON public.supplier_payouts (supplier_id, status);
CREATE INDEX procurement_decisions_order_item_idx ON public.procurement_decisions (order_item_id);
CREATE INDEX ai_activity_log_entity_idx ON public.ai_activity_log (entity_type, entity_id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.protect_profile_privileges()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF coalesce(auth.role(), '') = 'service_role' THEN
        RETURN NEW;
    END IF;

    IF TG_OP = 'INSERT' THEN
        IF NEW.user_id IS DISTINCT FROM auth.uid() OR NEW.role <> 'customer' THEN
            RAISE EXCEPTION 'Customers may only create their own customer profile';
        END IF;
    ELSIF NEW.user_id IS DISTINCT FROM OLD.user_id
       OR NEW.role IS DISTINCT FROM OLD.role
       OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
        RAISE EXCEPTION 'Profile identity, role, and creation time are immutable';
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_procurement_decision()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    offer public.supplier_offers%ROWTYPE;
BEGIN
    SELECT * INTO offer
    FROM public.supplier_offers
    WHERE supplier_id = NEW.supplier_id AND product_id = NEW.product_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Procurement decision must reference an existing supplier offer';
    END IF;

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

CREATE TRIGGER app_profiles_updated_at
BEFORE UPDATE ON public.app_profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER product_categories_updated_at
BEFORE UPDATE ON public.product_categories
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER suppliers_updated_at
BEFORE UPDATE ON public.suppliers
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER supplier_offers_updated_at
BEFORE UPDATE ON public.supplier_offers
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER product_inventory_updated_at
BEFORE UPDATE ON public.product_inventory
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER order_items_updated_at
BEFORE UPDATE ON public.order_items
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER shipments_updated_at
BEFORE UPDATE ON public.shipments
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER supplier_payouts_updated_at
BEFORE UPDATE ON public.supplier_payouts
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER procurement_decisions_updated_at
BEFORE UPDATE ON public.procurement_decisions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER app_profiles_privilege_protection
BEFORE INSERT OR UPDATE ON public.app_profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_profile_privileges();

CREATE TRIGGER procurement_decision_integrity
BEFORE INSERT OR UPDATE ON public.procurement_decisions
FOR EACH ROW EXECUTE FUNCTION public.validate_procurement_decision();

ALTER TABLE public.app_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurement_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY app_profiles_select_own
ON public.app_profiles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY app_profiles_insert_own
ON public.app_profiles FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() AND role = 'customer');

CREATE POLICY app_profiles_update_own
ON public.app_profiles FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY product_categories_select_active
ON public.product_categories FOR SELECT
TO anon, authenticated
USING (is_active);

CREATE POLICY products_select_active
ON public.products FOR SELECT
TO anon, authenticated
USING (status = 'active');

CREATE POLICY orders_select_own
ON public.orders FOR SELECT
TO authenticated
USING (customer_id = auth.uid());

CREATE POLICY orders_insert_own
ON public.orders FOR INSERT
TO authenticated
WITH CHECK (customer_id = auth.uid());

CREATE POLICY orders_update_own_pending
ON public.orders FOR UPDATE
TO authenticated
USING (customer_id = auth.uid() AND status = 'pending')
WITH CHECK (customer_id = auth.uid() AND status = 'pending');

CREATE POLICY order_items_select_own
ON public.order_items FOR SELECT
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid()
));

CREATE POLICY order_items_insert_own
ON public.order_items FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
      AND orders.customer_id = auth.uid()
      AND orders.status = 'pending'
));

CREATE POLICY order_items_update_own_pending
ON public.order_items FOR UPDATE
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
      AND orders.customer_id = auth.uid()
      AND orders.status = 'pending'
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
      AND orders.customer_id = auth.uid()
      AND orders.status = 'pending'
));

CREATE POLICY shipments_select_own
ON public.shipments FOR SELECT
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = shipments.order_id AND orders.customer_id = auth.uid()
));

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

REVOKE ALL ON FUNCTION public.protect_profile_privileges() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.validate_procurement_decision() FROM PUBLIC;

COMMIT;
