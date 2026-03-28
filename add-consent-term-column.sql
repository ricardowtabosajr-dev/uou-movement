-- =====================================================
-- Adicionar coluna consent_term na tabela enrollments
-- Para salvar o termo de responsabilidade gerado pela IA
-- =====================================================

ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS consent_term TEXT;
