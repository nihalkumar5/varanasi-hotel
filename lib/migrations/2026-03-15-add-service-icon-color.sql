ALTER TABLE public.hotels
ADD COLUMN IF NOT EXISTS service_icon_color TEXT DEFAULT '#2f2f2f';
