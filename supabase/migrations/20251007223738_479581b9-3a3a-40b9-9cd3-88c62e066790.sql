-- Add support for multiple images per artwork
ALTER TABLE public.artworks 
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

COMMENT ON COLUMN public.artworks.images IS 'Array of additional image URLs for the artwork';