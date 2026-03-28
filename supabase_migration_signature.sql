-- Migração: Adicionar campos de assinatura digital e CPF do responsável
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- Coluna para imagem da assinatura (base64 PNG)
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS signature_data TEXT;

-- Coluna para hash SHA-256 da assinatura
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS signature_hash TEXT;

-- Coluna para CPF do responsável legal
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS guardian_cpf TEXT;
