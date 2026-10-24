-- PR #1 follow-ups. Apply AFTER 20261025_auth_schema_integrity.sql.
-- Idempotent: safe to re-run.

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. create_order_atomic: schema-qualify gen_random_bytes.
--    The function runs with search_path = '' and pgcrypto lives in the
--    `extensions` schema, so the unqualified call fails whenever the caller
--    does not pass an access_token. Body is otherwise identical to the
--    version applied by 20261025_auth_schema_integrity.sql.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.create_order_atomic(payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_order_id uuid;
    v_order_number text;
    v_access_token text;
    v_item jsonb;
    v_product record;
    v_inventory record;
    v_qty integer;
    v_unit numeric(10, 2);
    v_subtotal numeric(10, 2) := 0;
    v_discount numeric(10, 2) := 0;
    v_shipping numeric(10, 2);
    v_total numeric(10, 2);
    v_coupon record;
    v_free_shipping boolean := false;
    v_now timestamptz := NOW();
    v_items jsonb := '[]'::jsonb;
    v_line jsonb;
BEGIN
    IF payload IS NULL OR jsonb_typeof(payload -> 'items') <> 'array' OR jsonb_array_length(payload -> 'items') = 0 THEN
        RAISE EXCEPTION 'Cart must contain at least one product.';
    END IF;

    v_order_id := COALESCE((payload ->> 'id')::uuid, gen_random_uuid());
    v_order_number := COALESCE(payload ->> 'order_number', 'BB-2026-' || floor(10000 + random() * 90000)::int::text);
    v_access_token := COALESCE(payload ->> 'access_token', encode(extensions.gen_random_bytes(24), 'hex'));
    v_shipping := COALESCE((payload ->> 'shipping_fee')::numeric, 0);

    FOR v_item IN SELECT * FROM jsonb_array_elements(payload -> 'items')
    LOOP
        v_qty := GREATEST(1, FLOOR(COALESCE((v_item ->> 'quantity')::numeric, 1)));

        SELECT id, title, price, in_stock
        INTO v_product
        FROM public.products
        WHERE id = v_item ->> 'product_id'
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Product "%" was not found.', v_item ->> 'product_id';
        END IF;

        SELECT stock_quantity, in_stock, price
        INTO v_inventory
        FROM public.product_inventory
        WHERE product_id = v_product.id
        FOR UPDATE;

        IF (v_inventory.in_stock IS FALSE) OR (v_product.in_stock IS FALSE) THEN
            RAISE EXCEPTION 'Product "%" is out of stock.', v_product.title;
        END IF;

        IF v_inventory.stock_quantity IS NOT NULL AND v_inventory.stock_quantity < v_qty THEN
            RAISE EXCEPTION 'Insufficient stock for "%".', v_product.title;
        END IF;

        v_unit := COALESCE(v_inventory.price, v_product.price);
        v_subtotal := v_subtotal + (v_unit * v_qty);

        IF v_inventory.stock_quantity IS NOT NULL THEN
            UPDATE public.product_inventory
            SET
                stock_quantity = stock_quantity - v_qty,
                in_stock = (stock_quantity - v_qty) > 0,
                updated_at = v_now
            WHERE product_id = v_product.id;
        END IF;

        v_line := jsonb_build_object(
            'product_id', v_product.id,
            'product_title', COALESCE(v_item ->> 'product_title', v_product.title),
            'shade_name', v_item ->> 'shade_name',
            'shade_code', v_item ->> 'shade_code',
            'unit_price', v_unit,
            'quantity', v_qty,
            'line_total', v_unit * v_qty
        );
        v_items := v_items || jsonb_build_array(v_line);
    END LOOP;

    IF payload ? 'coupon_code' AND length(trim(payload ->> 'coupon_code')) > 0 THEN
        SELECT *
        INTO v_coupon
        FROM public.coupons
        WHERE upper(code) = upper(trim(payload ->> 'coupon_code'))
        FOR UPDATE;

        IF FOUND THEN
            IF v_coupon.is_active IS NOT TRUE THEN
                RAISE EXCEPTION 'Coupon is inactive.';
            END IF;
            IF v_coupon.expires_at IS NOT NULL AND v_coupon.expires_at < v_now THEN
                RAISE EXCEPTION 'Coupon has expired.';
            END IF;
            IF v_coupon.usage_limit IS NOT NULL AND v_coupon.used_count >= v_coupon.usage_limit THEN
                RAISE EXCEPTION 'Coupon usage limit reached.';
            END IF;
            IF COALESCE(v_coupon.min_spend, 0) > v_subtotal THEN
                RAISE EXCEPTION 'Coupon minimum spend not met.';
            END IF;

            IF v_coupon.discount_type = 'percentage' THEN
                v_discount := ROUND((v_subtotal * v_coupon.discount_value) / 100, 2);
                IF v_coupon.max_discount IS NOT NULL AND v_discount > v_coupon.max_discount THEN
                    v_discount := v_coupon.max_discount;
                END IF;
            ELSIF v_coupon.discount_type = 'fixed' THEN
                v_discount := LEAST(v_coupon.discount_value, v_subtotal);
            ELSIF v_coupon.discount_type = 'free_shipping' THEN
                v_shipping := 0;
                v_discount := 0;
                v_free_shipping := true;
            END IF;

            UPDATE public.coupons
            SET used_count = used_count + 1
            WHERE id = v_coupon.id;
        END IF;
    END IF;

    IF payload ? 'discount_amount' THEN
        v_discount := GREATEST(v_discount, COALESCE((payload ->> 'discount_amount')::numeric, 0));
    END IF;
    IF payload ? 'shipping_fee' AND NOT v_free_shipping THEN
        v_shipping := COALESCE((payload ->> 'shipping_fee')::numeric, v_shipping);
    END IF;

    v_total := GREATEST(0, v_subtotal - v_discount + v_shipping);

    INSERT INTO public.orders (
        id, order_number, access_token, customer_id,
        customer_name, customer_email, customer_phone,
        street_address, district, postal_code, delivery_zone,
        subtotal, discount_amount, shipping_fee, total_amount, coupon_code,
        payment_method, payment_status, order_status, target_delivery,
        courier_tracking_code, notes, created_at, updated_at
    ) VALUES (
        v_order_id,
        v_order_number,
        v_access_token,
        NULLIF(payload ->> 'customer_id', '')::uuid,
        payload ->> 'customer_name',
        lower(payload ->> 'customer_email'),
        payload ->> 'customer_phone',
        payload ->> 'street_address',
        payload ->> 'district',
        payload ->> 'postal_code',
        payload ->> 'delivery_zone',
        v_subtotal,
        v_discount,
        v_shipping,
        v_total,
        NULLIF(upper(trim(payload ->> 'coupon_code')), ''),
        payload ->> 'payment_method',
        COALESCE(payload ->> 'payment_status', 'pending'),
        COALESCE(payload ->> 'order_status', 'confirmed'),
        payload ->> 'target_delivery',
        payload ->> 'courier_tracking_code',
        payload ->> 'notes',
        v_now,
        v_now
    );

    INSERT INTO public.order_items (
        order_id, product_id, product_title, shade_name, shade_code,
        unit_price, quantity, line_total
    )
    SELECT
        v_order_id,
        rec ->> 'product_id',
        rec ->> 'product_title',
        rec ->> 'shade_name',
        rec ->> 'shade_code',
        (rec ->> 'unit_price')::numeric,
        (rec ->> 'quantity')::integer,
        (rec ->> 'line_total')::numeric
    FROM jsonb_array_elements(v_items) AS rec;

    RETURN jsonb_build_object(
        'id', v_order_id,
        'order_number', v_order_number,
        'access_token', v_access_token,
        'subtotal', v_subtotal,
        'discount_amount', v_discount,
        'shipping_fee', v_shipping,
        'total_amount', v_total,
        'items', v_items
    );
END;
$$;

REVOKE ALL ON FUNCTION private.create_order_atomic(jsonb) FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. Ratings come only from real, approved reviews.
--    No reviews => rating 0 / review_count 0 (the storefront hides stars).
-- ---------------------------------------------------------------------------
ALTER TABLE public.products ALTER COLUMN rating SET DEFAULT 0;
ALTER TABLE public.products ALTER COLUMN review_count SET DEFAULT 0;

CREATE OR REPLACE FUNCTION private.refresh_product_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    target_id text;
BEGIN
    target_id := COALESCE(NEW.product_id, OLD.product_id);
    UPDATE public.products AS p
    SET
        rating = COALESCE((
            SELECT ROUND(AVG(r.rating)::numeric, 2)
            FROM public.product_reviews AS r
            WHERE r.product_id = target_id
              AND r.is_approved = true
        ), 0),
        review_count = (
            SELECT COUNT(*)
            FROM public.product_reviews AS r
            WHERE r.product_id = target_id
              AND r.is_approved = true
        ),
        updated_at = NOW()
    WHERE p.id = target_id;
    RETURN COALESCE(NEW, OLD);
END;
$$;

REVOKE ALL ON FUNCTION private.refresh_product_rating() FROM PUBLIC, anon, authenticated;

-- Remove seeded/fake ratings: recompute every product from approved reviews.
UPDATE public.products AS p
SET
    rating = COALESCE(agg.avg_rating, 0),
    review_count = COALESCE(agg.review_count, 0)
FROM (
    SELECT pr.id AS product_id,
           ROUND(AVG(r.rating) FILTER (WHERE r.is_approved)::numeric, 2) AS avg_rating,
           COUNT(r.id) FILTER (WHERE r.is_approved) AS review_count
    FROM public.products AS pr
    LEFT JOIN public.product_reviews AS r ON r.product_id = pr.id
    GROUP BY pr.id
) AS agg
WHERE agg.product_id = p.id
  AND (p.rating IS DISTINCT FROM COALESCE(agg.avg_rating, 0)
       OR p.review_count IS DISTINCT FROM COALESCE(agg.review_count, 0));

-- ---------------------------------------------------------------------------
-- 3. Server-side admin session revocation (admin logout).
--    Only the service role (server) reads/writes this table.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_session_revocations (
    session_id text PRIMARY KEY,
    revoked_at timestamptz NOT NULL DEFAULT NOW(),
    expires_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS admin_session_revocations_expires_at_idx
    ON public.admin_session_revocations (expires_at);

ALTER TABLE public.admin_session_revocations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.admin_session_revocations FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.admin_session_revocations TO service_role;

COMMENT ON TABLE public.admin_session_revocations IS
    'Revoked admin HMAC session ids (bb_admin_session sid). Rows past expires_at can be deleted.';

-- ---------------------------------------------------------------------------
-- 4. Advisor clean-up
-- ---------------------------------------------------------------------------
-- Duplicate indexes (idx_reviews_product / idx_products_category cover the same columns).
DROP INDEX IF EXISTS public.product_reviews_product_id_fk_idx;
DROP INDEX IF EXISTS public.products_category_slug_fk_idx;

-- SECURITY DEFINER helper must not be callable through the API.
DO $$
BEGIN
    IF to_regprocedure('public.rls_auto_enable()') IS NOT NULL THEN
        REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
    END IF;
END;
$$;

COMMIT;
