-- =====================================================
-- SUPABASE STORAGE - Bucket para vídeos
-- Execute no SQL Editor do Supabase
-- =====================================================

-- 1. Criar bucket público para vídeos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos',
  'videos',
  true,
  157286400, -- 150MB limite
  ARRAY['video/mp4', 'video/webm', 'video/ogg']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Política de acesso: qualquer pessoa pode ler (público)
CREATE POLICY "Public read access for videos" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'videos');

-- 3. Política: somente usuários autenticados com role ADMIN podem fazer upload
CREATE POLICY "Admin upload access for videos" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'videos'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- 4. Política: somente admins podem deletar
CREATE POLICY "Admin delete access for videos" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'videos'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );
