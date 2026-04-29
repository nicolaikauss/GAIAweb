-- Create artworks table
CREATE TABLE public.artworks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  year INTEGER,
  medium TEXT,
  dimensions TEXT,
  price DECIMAL(10, 2),
  location TEXT,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'sold', 'consigned', 'reserved')),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own artworks"
ON public.artworks
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own artworks"
ON public.artworks
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own artworks"
ON public.artworks
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own artworks"
ON public.artworks
FOR DELETE
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_artworks_updated_at
BEFORE UPDATE ON public.artworks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster searches
CREATE INDEX idx_artworks_user_id ON public.artworks(user_id);
CREATE INDEX idx_artworks_tags ON public.artworks USING GIN(tags);
CREATE INDEX idx_artworks_title ON public.artworks(title);
CREATE INDEX idx_artworks_artist ON public.artworks(artist);

-- Create storage bucket for artwork images
INSERT INTO storage.buckets (id, name, public)
VALUES ('artwork-images', 'artwork-images', true);

-- Create storage policies for artwork images
CREATE POLICY "Artwork images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'artwork-images');

CREATE POLICY "Users can upload their own artwork images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'artwork-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own artwork images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'artwork-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own artwork images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'artwork-images' AND auth.uid()::text = (storage.foldername(name))[1]);