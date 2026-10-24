-- Migration: 20261024_realtime_publication.sql
-- Description: Enable Supabase Realtime replication on catalog and merchandising tables

-- Ensure tables have full replica identity so updates emit complete row data
ALTER TABLE IF EXISTS public.products REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.product_inventory REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.banners REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.limited_offers REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.categories REPLICA IDENTITY FULL;

-- Add tables to the supabase_realtime publication
DO $$
BEGIN
    -- Check if publication exists (standard in Supabase)
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        -- Add products
        IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'products'
        ) THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
        END IF;

        -- Add product_inventory
        IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'product_inventory'
        ) THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.product_inventory;
        END IF;

        -- Add banners
        IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'banners'
        ) THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.banners;
        END IF;

        -- Add limited_offers
        IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'limited_offers'
        ) THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.limited_offers;
        END IF;

        -- Add categories
        IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'categories'
        ) THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
        END IF;
    END IF;
END $$;
