-- Migration: 003_server_order_creation.sql
-- Description: Transaction-safe, idempotent server-side order creation function for AutoMart AI.
-- Executes within a single PostgreSQL transaction to guarantee atomic creation of orders and order_items.

BEGIN;

-- 1. Partial unique index to enforce idempotency per user
CREATE UNIQUE INDEX IF NOT EXISTS orders_user_idempotency_idx
ON public.orders (user_id, (metadata->>'idempotency_key'))
WHERE (metadata->>'idempotency_key') IS NOT NULL;

-- 2. Transactional order and order_items creation stored procedure
CREATE OR REPLACE FUNCTION public.create_order_with_items(
    p_user_id uuid,
    p_subtotal_inr numeric,
    p_shipping_inr numeric,
    p_other_fees_inr numeric,
    p_automart_commission_inr numeric,
    p_shipping_address jsonb,
    p_billing_address jsonb,
    p_metadata jsonb,
    p_items jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_idempotency_key text;
    v_existing_order record;
    v_order record;
    v_item jsonb;
BEGIN
    v_idempotency_key := p_metadata->>'idempotency_key';

    -- Check idempotency: If an order with this idempotency key already exists for this user, return it
    IF v_idempotency_key IS NOT NULL AND trim(v_idempotency_key) <> '' THEN
        SELECT id, external_order_ref, status, total_inr, created_at
        INTO v_existing_order
        FROM public.orders
        WHERE user_id = p_user_id
          AND metadata->>'idempotency_key' = v_idempotency_key;

        IF FOUND THEN
            RETURN jsonb_build_object(
                'success', true,
                'order_id', v_existing_order.id,
                'external_order_ref', v_existing_order.external_order_ref,
                'status', v_existing_order.status,
                'total_inr', v_existing_order.total_inr,
                'is_duplicate_replay', true
            );
        END IF;
    END IF;

    -- Insert into orders table
    INSERT INTO public.orders (
        user_id,
        status,
        currency,
        subtotal_inr,
        shipping_inr,
        other_fees_inr,
        automart_commission_inr,
        shipping_address,
        billing_address,
        metadata,
        placed_at
    ) VALUES (
        p_user_id,
        'pending',
        'INR',
        p_subtotal_inr,
        p_shipping_inr,
        p_other_fees_inr,
        p_automart_commission_inr,
        p_shipping_address,
        p_billing_address,
        COALESCE(p_metadata, '{}'::jsonb),
        now()
    )
    RETURNING id, external_order_ref, status, total_inr, created_at
    INTO v_order;

    -- Insert line items atomically
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        INSERT INTO public.order_items (
            order_id,
            line_number,
            product_id,
            quantity,
            unit_price_inr,
            shipping_inr,
            other_costs_inr,
            landed_cost_inr,
            automart_commission_inr,
            supplier_offer_snapshot,
            status
        ) VALUES (
            v_order.id,
            (v_item->>'line_number')::integer,
            (v_item->>'product_id')::uuid,
            (v_item->>'quantity')::integer,
            (v_item->>'unit_price_inr')::numeric,
            COALESCE((v_item->>'shipping_inr')::numeric, 0),
            COALESCE((v_item->>'other_costs_inr')::numeric, 0),
            COALESCE((v_item->>'landed_cost_inr')::numeric, 0),
            COALESCE((v_item->>'automart_commission_inr')::numeric, 0),
            COALESCE(v_item->'supplier_offer_snapshot', '{}'::jsonb),
            'pending'
        );
    END LOOP;

    RETURN jsonb_build_object(
        'success', true,
        'order_id', v_order.id,
        'external_order_ref', v_order.external_order_ref,
        'status', v_order.status,
        'total_inr', v_order.total_inr,
        'is_duplicate_replay', false
    );
END;
$$;

-- Security hardening: Only service_role can execute this transactional procedure
REVOKE ALL ON FUNCTION public.create_order_with_items(uuid, numeric, numeric, numeric, numeric, jsonb, jsonb, jsonb, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_order_with_items(uuid, numeric, numeric, numeric, numeric, jsonb, jsonb, jsonb, jsonb) TO service_role;

COMMIT;
