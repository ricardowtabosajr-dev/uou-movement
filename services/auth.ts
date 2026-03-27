import { supabase } from './supabase';
import { UserProfile, UserRole, EnrollmentStatus, PaymentStatus } from '../types';

/**
 * Registra um novo usuário com email e senha.
 * Após criação no Auth, cria o perfil na tabela `profiles`.
 */
export const signUp = async (
  email: string,
  password: string,
  name: string
): Promise<{ user: UserProfile | null; error: string | null }> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (error) {
      return { user: null, error: translateAuthError(error.message) };
    }

    if (!data.user) {
      return { user: null, error: 'Erro ao criar usuário.' };
    }

    // Determinar role baseado no email
    const role = email.toLowerCase().includes('admin')
      ? UserRole.ADMIN
      : UserRole.USER;

    // Criar perfil na tabela profiles
    const profile: UserProfile = {
      id: data.user.id,
      name,
      email,
      role,
      enrollmentStatus: EnrollmentStatus.PENDING,
      paymentStatus: PaymentStatus.UNPAID,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=991b1b`,
      briefingCompleted: false,
    };

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(profile, { onConflict: 'id' });

    if (profileError) {
      console.error('Erro ao criar perfil:', profileError);
      // Não retornamos erro aqui pois o usuário já foi criado no auth.
      // O perfil pode ser criado depois pelo trigger ou manualmente.
    }

    return { user: profile, error: null };
  } catch (err: any) {
    return { user: null, error: err.message || 'Erro desconhecido.' };
  }
};

/**
 * Faz login com email e senha.
 * Busca o perfil da tabela `profiles`.
 */
export const signIn = async (
  email: string,
  password: string
): Promise<{ user: UserProfile | null; error: string | null }> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, error: translateAuthError(error.message) };
    }

    if (!data.user) {
      return { user: null, error: 'Credenciais inválidas.' };
    }

    // Buscar perfil
    const profile = await getProfile(data.user.id);

    if (!profile) {
      // Se o perfil não existe, criar um básico
      const newProfile: UserProfile = {
        id: data.user.id,
        name: data.user.user_metadata?.name || email.split('@')[0],
        email,
        role: email.toLowerCase().includes('admin')
          ? UserRole.ADMIN
          : UserRole.USER,
        enrollmentStatus: EnrollmentStatus.PENDING,
        paymentStatus: PaymentStatus.UNPAID,
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email)}&backgroundColor=991b1b`,
        briefingCompleted: false,
      };

      await supabase.from('profiles').upsert(newProfile, { onConflict: 'id' });
      return { user: newProfile, error: null };
    }

    return { user: profile, error: null };
  } catch (err: any) {
    return { user: null, error: err.message || 'Erro desconhecido.' };
  }
};

/**
 * Faz logout do usuário atual.
 */
export const signOut = async (): Promise<void> => {
  await supabase.auth.signOut();
};

/**
 * Busca o perfil de um usuário pelo ID.
 */
export const getProfile = async (userId: string, retryCount = 0): Promise<UserProfile | null> => {
  console.log(`[AUTH SERVICE] getProfile(${userId}) - Tentativa: ${retryCount + 1}`);
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.warn(`[AUTH SERVICE] Erro ao buscar perfil:`, error.message);
      
      // Se não encontrar o perfil (PGRST116), criamos um perfil básico emergencial
      if (error.code === 'PGRST116') {
        console.log('[AUTH SERVICE] Perfil não encontrado no banco. Criando perfil emergencial...');
        const email = (await supabase.auth.getUser()).data.user?.email || 'desconhecido@uou.com';
        const newProfile: UserProfile = {
          id: userId,
          name: email.split('@')[0].toUpperCase(),
          email: email,
          role: email.includes('admin') ? UserRole.ADMIN : UserRole.USER,
          enrollmentStatus: EnrollmentStatus.PENDING,
          paymentStatus: PaymentStatus.UNPAID,
          avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userId)}&backgroundColor=991b1b`,
          briefingCompleted: false,
        };
        
        // Tenta salvar o perfil emergencial (opcional, pode falhar mas queremos o objeto pro App)
        supabase.from('profiles').upsert(newProfile).then(({error}) => {
          if (error) console.error('[AUTH SERVICE] Falha ao persistir perfil emergencial:', error.message);
          else console.log('[AUTH SERVICE] Perfil emergencial persistido.');
        });
        
        return newProfile;
      }
      return null;
    }

    if (!data) {
      console.warn('[AUTH SERVICE] getProfile retornou data null sem erro.');
      return null;
    }

    console.log('[AUTH SERVICE] Perfil carregado com sucesso.');
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role as UserRole,
      enrollmentStatus: data.enrollment_status as EnrollmentStatus,
      paymentStatus: data.payment_status as PaymentStatus,
      avatarUrl: data.avatar_url,
      briefingCompleted: data.briefing_completed,
      missionId: data.mission_id,
    };
  } catch (err) {
    console.error('[AUTH SERVICE] Exceção em getProfile:', err);
    return null;
  }
};

/**
 * Atualiza o perfil de um usuário.
 */
export const updateProfile = async (
  userId: string,
  updates: Partial<{
    name: string;
    role: UserRole;
    enrollmentStatus: EnrollmentStatus;
    paymentStatus: PaymentStatus;
    avatarUrl: string;
    briefingCompleted: boolean;
    missionId: string;
  }>
): Promise<{ success: boolean; error: string | null }> => {
  // Converter camelCase para snake_case para o Supabase
  const dbUpdates: Record<string, any> = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.role !== undefined) dbUpdates.role = updates.role;
  if (updates.enrollmentStatus !== undefined) dbUpdates.enrollment_status = updates.enrollmentStatus;
  if (updates.paymentStatus !== undefined) dbUpdates.payment_status = updates.paymentStatus;
  if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
  if (updates.briefingCompleted !== undefined) dbUpdates.briefing_completed = updates.briefingCompleted;
  if (updates.missionId !== undefined) dbUpdates.mission_id = updates.missionId;

  const { error } = await supabase
    .from('profiles')
    .update(dbUpdates)
    .eq('id', userId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
};

/**
 * Busca todos os perfis (para admin).
 */
export const getAllProfiles = async (): Promise<UserProfile[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((d: any) => ({
    id: d.id,
    name: d.name,
    email: d.email,
    role: d.role as UserRole,
    enrollmentStatus: d.enrollment_status as EnrollmentStatus,
    paymentStatus: d.payment_status as PaymentStatus,
    avatarUrl: d.avatar_url,
    briefingCompleted: d.briefing_completed,
    missionId: d.mission_id,
  }));
};

/**
 * Obtém a sessão atual do usuário.
 */
export const getCurrentSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

/**
 * Escuta mudanças no estado de autenticação.
 */
export const onAuthStateChange = (
  callback: (event: string, session: any) => void
) => {
  return supabase.auth.onAuthStateChange(callback);
};

/**
 * Traduz mensagens de erro do Supabase Auth.
 */
const translateAuthError = (message: string): string => {
  const errors: Record<string, string> = {
    'Invalid login credentials': 'Email ou senha incorretos.',
    'User already registered': 'Este email já está cadastrado.',
    'Email not confirmed': 'Confirme seu email antes de acessar.',
    'Signup requires a valid password': 'A senha deve ter pelo menos 6 caracteres.',
    'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres.',
    'Unable to validate email address: invalid format': 'Formato de email inválido.',
    'Email rate limit exceeded': 'Muitas tentativas. Aguarde alguns minutos.',
  };

  return errors[message] || `Erro de autenticação: ${message}`;
};
