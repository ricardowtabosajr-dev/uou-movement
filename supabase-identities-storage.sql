-- =====================================================
-- SUPABASE STORAGE - Bucket para vídeos de identificação
-- Execute no SQL Editor do Supabase
-- =====================================================

-- 1. Criar bucket privado para identidades (mais seguro)
-- Nota: 'public: false' significa que requer URL assinada ou política explícita
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'identities',
  'identities',
  false,
  52428800, -- 50MB limite
  ARRAY['video/mp4', 'video/webm', 'video/quicktime']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Política: Usuários podem fazer upload apenas do seu próprio vídeo
-- O nome do arquivo será o ID do usuário
CREATE POLICY "Users can upload own identity video" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'identities'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 3. Política: Usuários podem ver seu próprio vídeo
CREATE POLICY "Users can view own identity video" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'identities'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 4. Política: Admins podem ver todos os vídeos de identidade
CREATE POLICY "Admins can view all identity videos" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'identities'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- 5. Política: Admins podem deletar vídeos
CREATE POLICY "Admins can delete identity videos" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'identities'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );
