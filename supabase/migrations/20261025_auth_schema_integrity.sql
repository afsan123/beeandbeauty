-- Migration: 20261025_auth_schema_integrity.sql
-- Description: Customer profiles, admin roles, order access tokens, coupon limits,
--              foreign keys + indexes, transactional order RPC, review rating trigger,
--              RLS ownership policies, and the public products storage bucket.

CREATE SCHEMA IF NOT EXISTS private;

-- ---------------------------------------------------------------------------
-- 1. Customer profiles (linked to auth.users)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customer_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    phone TEXT,
    full_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS customer_profiles_email_idx
    ON public.customer_profiles (lower(email));
CREATE INDEX IF NOT EXISTS customer_profiles_phone_idx
    ON public.customer_profiles (phone);

-- ---------------------------------------------------------------------------
-- 2. Admin roles (authorization lives in a table, never in user_metadata)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('superadmin', 'manager')),
    display_name TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS admin_roles_email_idx
    ON public.admin_roles (lower(email));

-- ---------------------------------------------------------------------------
-- 3. Orders: customer link + unguessable access token
-- ---------------------------------------------------------------------------
ALTER TABLE public.orders
    ADD COLUMN IF NOT EXISTS customer_id UUID,
    ADD COLUMN IF NOT EXISTS access_token TEXT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'orders_customer_id_fkey'
          AND conrelid = 'public.orders'::regclass
    ) THEN
        ALTER TABLE public.orders
            ADD CONSTRAINT orders_customer_id_fkey
            FOREIGN KEY (customer_id)
            REFERENCES public.customer_profiles(id)
            ON DELETE SET NULL;
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS orders_access_token_uidx
    ON public.orders (access_token)
    WHERE access_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS orders_customer_id_idx
    ON public.orders (customer_id);
CREATE INDEX IF NOT EXISTS orders_customer_email_idx
    ON public.orders (lower(customer_email));

-- ---------------------------------------------------------------------------
-- 4. Coupon usage limits
-- ---------------------------------------------------------------------------
ALTER TABLE public.coupons
    ADD COLUMN IF NOT EXISTS usage_limit INTEGER,
    ADD COLUMN IF NOT EXISTS used_count INTEGER NOT NULL DEFAULT 0;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'coupons_usage_limit_positive'
          AND conrelid = 'public.coupons'::regclass
    ) THEN
        ALTER TABLE public.coupons
            ADD CONSTRAINT coupons_usage_limit_positive
            CHECK (usage_limit IS NULL OR usage_limit > 0);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'coupons_used_count_nonnegative'
          AND conrelid = 'public.coupons'::regclass
    ) THEN
        ALTER TABLE public.coupons
            ADD CONSTRAINT coupons_used_count_nonnegative
            CHECK (used_count >= 0);
    END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 5. Foreign keys (NOT VALID so existing orphan rows do not block migrate)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'products_category_slug_fkey'
          AND conrelid = 'public.products'::regclass
    ) THEN
        ALTER TABLE public.products
            ADD CONSTRAINT products_category_slug_fkey
            FOREIGN KEY (category_slug)
            REFERENCES public.categories(slug)
            ON UPDATE CASCADE
            ON DELETE RESTRICT
            NOT VALID;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'order_items_product_id_fkey'
          AND conrelid = 'public.order_items'::regclass
    ) THEN
        ALTER TABLE public.order_items
            ADD CONSTRAINT order_items_product_id_fkey
            FOREIGN KEY (product_id)
            REFERENCES public.products(id)
            ON DELETE RESTRICT
            NOT VALID;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'product_reviews_product_id_fkey'
          AND conrelid = 'public.product_reviews'::regclass
    ) THEN
        ALTER TABLE public.product_reviews
            ADD CONSTRAINT product_reviews_product_id_fkey
            FOREIGN KEY (product_id)
            REFERENCES public.products(id)
            ON DELETE CASCADE
            NOT VALID;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'product_inventory_product_id_fkey'
          AND conrelid = 'public.product_inventory'::regclass
    ) THEN
        ALTER TABLE public.product_inventory
            ADD CONSTRAINT product_inventory_product_id_fkey
            FOREIGN KEY (product_id)
            REFERENCES public.products(id)
            ON DELETE CASCADE
            NOT VALID;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS products_category_slug_fk_idx
    ON public.products (category_slug);
CREATE INDEX IF NOT EXISTS order_items_product_id_idx
    ON public.order_items (product_id);
CREATE INDEX IF NOT EXISTS product_reviews_product_id_fk_idx
    ON public.product_reviews (product_id);
CREATE INDEX IF NOT EXISTS product_inventory_product_id_idx
    ON public.product_inventory (product_id);

-- ---------------------------------------------------------------------------
-- 6. Review columns for purchase verification
-- ---------------------------------------------------------------------------
ALTER TABLE public.product_reviews
    ADD COLUMN IF NOT EXISTS author_email TEXT,
    ADD COLUMN IF NOT EXISTS author_phone TEXT,
    ADD COLUMN IF NOT EXISTS is_approved BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS product_reviews_author_email_idx
    ON public.product_reviews (lower(author_email));

-- ---------------------------------------------------------------------------
-- 7. Product rating / review_count trigger
-- ---------------------------------------------------------------------------
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
        ), 5.0),
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

DROP TRIGGER IF EXISTS trg_refresh_product_rating ON public.product_reviews;
CREATE TRIGGER trg_refresh_product_rating
    AFTER INSERT OR UPDATE OR DELETE ON public.product_reviews
    FOR EACH ROW
    EXECUTE FUNCTION private.refresh_product_rating();

REVOKE ALL ON FUNCTION private.refresh_product_rating() FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 8. Atomic order placement (service_role only)
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
    v_access_token := COALESCE(payload ->> 'access_token', encode(gen_random_bytes(24), 'hex'));
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

CREATE OR REPLACE FUNCTION public.create_order_atomic(payload jsonb)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT private.create_order_atomic(payload);
$$;

REVOKE ALL ON FUNCTION private.create_order_atomic(jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.create_order_atomic(jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_order_atomic(jsonb) TO service_role;

-- ---------------------------------------------------------------------------
-- 9. RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Customers can read own profile" ON public.customer_profiles;
CREATE POLICY "Customers can read own profile"
    ON public.customer_profiles
    FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Customers can update own profile" ON public.customer_profiles;
CREATE POLICY "Customers can update own profile"
    ON public.customer_profiles
    FOR UPDATE
    TO authenticated
    USING ((select auth.uid()) = id)
    WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Customers can insert own profile" ON public.customer_profiles;
CREATE POLICY "Customers can insert own profile"
    ON public.customer_profiles
    FOR INSERT
    TO authenticated
    WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Customers can read own orders" ON public.orders;
CREATE POLICY "Customers can read own orders"
    ON public.orders
    FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = customer_id);

DROP POLICY IF EXISTS "Customers can read own order items" ON public.order_items;
CREATE POLICY "Customers can read own order items"
    ON public.order_items
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.orders o
            WHERE o.id = order_items.order_id
              AND o.customer_id = (select auth.uid())
        )
    );

-- Public review insert stays, but verified-buyer is never trusted from the client.
DROP POLICY IF EXISTS "Public can insert reviews" ON public.product_reviews;
CREATE POLICY "Public can insert reviews"
    ON public.product_reviews
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (
        is_verified_buyer = false
        AND rating BETWEEN 1 AND 5
        AND char_length(comment) >= 5
    );

DROP POLICY IF EXISTS "Public can read approved reviews" ON public.product_reviews;
DROP POLICY IF EXISTS "Public can read product reviews" ON public.product_reviews;
CREATE POLICY "Public can read approved reviews"
    ON public.product_reviews
    FOR SELECT
    TO anon, authenticated
    USING (is_approved = true);

-- Lock down admin_roles from Data API roles
REVOKE ALL ON TABLE public.admin_roles FROM PUBLIC, anon, authenticated;

GRANT SELECT, INSERT, UPDATE ON TABLE public.customer_profiles TO authenticated;
GRANT SELECT ON TABLE public.orders TO authenticated;
GRANT SELECT ON TABLE public.order_items TO authenticated;

-- ---------------------------------------------------------------------------
-- 10. Storage bucket for product images
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'products',
    'products',
    true,
    10485760,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public can read product images" ON storage.objects;
CREATE POLICY "Public can read product images"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'products');

-- Uploads go through the service role from the admin API (bypasses RLS).
-- No anon/authenticated INSERT so the public cannot overwrite catalog images.
