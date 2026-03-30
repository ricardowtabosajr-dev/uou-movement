-- =====================================================
-- ADICIONAR THUMBNAIL PARA MISSÕES
-- Execute este SQL no Editor do Supabase
-- =====================================================

-- 1. Adicionar coluna thumbnail_url na tabela de missões
ALTER TABLE missions ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- 2. Criar bucket para as thumbnails (público)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'missions_thumbs',
  'missions_thumbs',
  true,
  2097152, -- 2MB limite
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 3. Políticas de acesso para o bucket de thumbnails
CREATE POLICY "Public read access for mission thumbs" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'missions_thumbs');

CREATE POLICY "Admin upload access for mission thumbs" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'missions_thumbs'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

CREATE POLICY "Admin update access for mission thumbs" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'missions_thumbs'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

CREATE POLICY "Admin delete access for mission thumbs" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'missions_thumbs'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );
