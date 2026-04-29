-- Add seller and buyer information columns to artworks table
ALTER TABLE public.artworks
ADD COLUMN IF NOT EXISTS seller_name TEXT,
ADD COLUMN IF NOT EXISTS seller_contact TEXT,
ADD COLUMN IF NOT EXISTS seller_document_type TEXT,
ADD COLUMN IF NOT EXISTS buyer_name TEXT,
ADD COLUMN IF NOT EXISTS buyer_contact TEXT,
ADD COLUMN IF NOT EXISTS buyer_document_type TEXT,
ADD COLUMN IF NOT EXISTS purchase_price NUMERIC,
ADD COLUMN IF NOT EXISTS purchase_date DATE,
ADD COLUMN IF NOT EXISTS payment_received_date DATE,
ADD COLUMN IF NOT EXISTS sale_date DATE,
ADD COLUMN IF NOT EXISTS on_consignment BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS commission_rate NUMERIC DEFAULT 30;