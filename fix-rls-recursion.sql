-- =====================================================
-- FIX: Corrigir recursão infinita nas políticas RLS da tabela profiles
-- O problema: A política "Admins can view all profiles" faz SELECT na
-- própria tabela profiles para verificar se o usuário é admin, o que
-- dispara a mesma política recursivamente, causando loop infinito.
-- 
-- Solução: Usar uma função SECURITY DEFINER que bypassa RLS
-- para verificar se o usuário é admin.
-- =====================================================

-- 1. Criar função auxiliar que verifica se o usuário é admin (bypassa RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 2. Remover TODAS as políticas antigas da tabela profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- 3. Recriar políticas SEM recursão
-- Usuários podem ver seu próprio perfil
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Admins podem ver TODOS os perfis (usa função auxiliar, sem recursão)
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (public.is_admin());

-- Usuários podem inserir seu próprio perfil
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Usuários podem atualizar seu próprio perfil
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins podem atualizar qualquer perfil (usa função auxiliar, sem recursão)
CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (public.is_admin());

-- 4. Corrigir políticas de enrollments e payments que também usam subquery recursiva
DROP POLICY IF EXISTS "Admins can view all enrollments" ON enrollments;
CREATE POLICY "Admins can view all enrollments" ON enrollments
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage payments" ON payments;
CREATE POLICY "Admins can manage payments" ON payments
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage missions" ON missions;
CREATE POLICY "Admins can manage missions" ON missions
  FOR ALL USING (public.is_admin());
