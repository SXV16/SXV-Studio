-- Run this directly in your Supabase Dashboard -> SQL Editor!

-- 1. Create the bucket and ensure it is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio-tracks', 'audio-tracks', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Allow anyone to download tracks
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'audio-tracks');

-- 3. Allow anonymous (unauthenticated) uploads from the browser
CREATE POLICY "Anon Uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'audio-tracks');
