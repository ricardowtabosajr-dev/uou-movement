import { supabase } from './supabase';
import { EnrollmentData } from '../types';

// ===== ENROLLMENTS (INSCRIÇÕES) =====

/**
 * Salva os dados de inscrição de um usuário.
 * Aceita opcionalmente o termo de consentimento gerado.
 */
export const saveEnrollment = async (
  userId: string,
  enrollmentData: EnrollmentData,
  consentTerm?: string,
  signatureData?: string,
  signatureHash?: string,
  signatureIp?: string,
  signatureUA?: string,
  signatureTime?: string
): Promise<{ success: boolean; error: string | null }> => {
  const dbData: Record<string, any> = {
    user_id: userId,
    full_name: enrollmentData.fullName,
    nickname: enrollmentData.nickname,
    birth_date: enrollmentData.birthDate,
    gender: enrollmentData.gender,
    marital_status: enrollmentData.maritalStatus,
    spouse_name: enrollmentData.spouseName || null,
    cpf: enrollmentData.cpf,
    rg: enrollmentData.rg,
    shirt_size: enrollmentData.shirtSize,
    guardian_name: enrollmentData.guardianName || null,
    guardian_phone: enrollmentData.guardianPhone || null,
    guardian_cpf: enrollmentData.guardianCpf || null,
    phone: enrollmentData.phone,
    instagram: enrollmentData.instagram,
    address: enrollmentData.address,
    neighborhood: enrollmentData.neighborhood,
    city: enrollmentData.city,
    state: enrollmentData.state,
    cep: enrollmentData.cep,
    church_name: enrollmentData.churchName,
    pastor_name: enrollmentData.pastorName,
    pastor_phone: enrollmentData.pastorPhone,
    conversion_time: enrollmentData.conversionTime,
    baptized: enrollmentData.baptized,
    baptized_in_holy_spirit: enrollmentData.baptizedInHolySpirit,
    spiritual_gifts: enrollmentData.spiritualGifts,
    languages: enrollmentData.languages,
    current_ministry: enrollmentData.currentMinistry,
    pastoral_recommendation: enrollmentData.pastoralRecommendation,
    inner_healing_process: enrollmentData.innerHealingProcess,
    missionary_interest_areas: enrollmentData.missionaryInterestAreas,
    missionary_experience: enrollmentData.missionaryExperience,
    motivation: enrollmentData.motivation,
    skills: enrollmentData.skills,
    social_projects: enrollmentData.socialProjects,
    financial_plan: enrollmentData.financialPlan,
    emergency_contact: enrollmentData.emergencyContact,
    emergency_phone: enrollmentData.emergencyPhone,
    blood_type: enrollmentData.bloodType,
    specific_conditions: enrollmentData.specificConditions,
    health_conditions: enrollmentData.healthConditions,
    allergies: enrollmentData.allergies,
    medications: enrollmentData.medications,
    food_restrictions: enrollmentData.foodRestrictions,
    has_physical_constraint: enrollmentData.hasPhysicalConstraint,
    agreed_to_terms: enrollmentData.agreedToTerms,
  };

  if (consentTerm) dbData.consent_term = consentTerm;
  if (signatureData) dbData.signature_data = signatureData;
  if (signatureHash) dbData.signature_hash = signatureHash;
  if (signatureIp) dbData.signature_ip = signatureIp;
  if (signatureUA) dbData.signature_user_agent = signatureUA;
  if (signatureTime) dbData.signature_timestamp = signatureTime;

  const { error } = await supabase
    .from('enrollments')
    .upsert(dbData, { onConflict: 'user_id' });

  if (error) {
    console.error('Erro ao salvar inscrição:', error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
};

/**
 * Busca a inscrição de um usuário.
 */
export const getEnrollment = async (userId: string) => {
  const { data, error } = await supabase
    .from('enrollments')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;
  return data;
};

/**
 * Busca a URL assinada do vídeo de identidade de um usuário.
 * Retorna null se o vídeo não existir.
 */
export const getIdentityVideoUrl = async (userId: string): Promise<string | null> => {
  const fileName = `${userId}/identity_v1.mp4`;

  const { data, error } = await supabase.storage
    .from('identities')
    .createSignedUrl(fileName, 3600); // URL válida por 1 hora

  if (error || !data?.signedUrl) {
    console.warn('Vídeo não encontrado:', error?.message);
    return null;
  }

  return data.signedUrl;
};

// ===== MISSIONS =====

export interface MissionDB {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  capacity: number;
  enrolled: number;
  status: 'OPEN' | 'CLOSED' | 'IN_PROGRESS';
}

/**
 * Busca todas as missões.
 */
export const getMissions = async (): Promise<MissionDB[]> => {
  const { data, error } = await supabase
    .from('missions')
    .select('*')
    .order('start_date', { ascending: true });

  if (error || !data) return [];
  return data;
};

/**
 * Cria uma nova missão.
 */
export const createMission = async (
  mission: Omit<MissionDB, 'id'>
): Promise<{ success: boolean; error: string | null }> => {
  const { error } = await supabase.from('missions').insert(mission);

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true, error: null };
};

/**
 * Atualiza uma missão.
 */
export const updateMission = async (
  id: string,
  updates: Partial<MissionDB>
): Promise<{ success: boolean; error: string | null }> => {
  const { error } = await supabase
    .from('missions')
    .update(updates)
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true, error: null };
};

// ===== PAYMENTS =====

export interface PaymentDB {
  id?: string;
  user_id: string;
  amount: number;
  method: string;
  status: 'PENDING' | 'PAID' | 'REFUNDED';
  pix_code?: string;
  created_at?: string;
}

/**
 * Registra um pagamento.
 */
export const createPayment = async (
  payment: Omit<PaymentDB, 'id' | 'created_at'>
): Promise<{ success: boolean; error: string | null }> => {
  const { error } = await supabase.from('payments').insert(payment);

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true, error: null };
};

/**
 * Busca pagamentos de um usuário.
 */
export const getUserPayments = async (userId: string): Promise<PaymentDB[]> => {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data;
};

/**
 * Busca todos os pagamentos (admin).
 */
export const getAllPayments = async (): Promise<PaymentDB[]> => {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data;
};

/**
 * Faz upload do vídeo de identificação para o storage.
 */
export const uploadIdentityVideo = async (
  userId: string,
  videoBlob: Blob
): Promise<{ success: boolean; error: string | null }> => {
  const fileName = `${userId}/identity_v1.mp4`;
  
  const { error } = await supabase.storage
    .from('identities')
    .upload(fileName, videoBlob, {
      contentType: 'video/mp4',
      cacheControl: '3600',
      upsert: true
    });

  if (error) {
    console.error('Erro no upload do vídeo:', error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
};

/**
 * Exclui todos os dados de um usuário (Inscrição, Perfil e Arquivos).
 * Útil para limpeza de dados pelo administrador.
 */
export const deleteUserData = async (userId: string): Promise<{ success: boolean; error: string | null }> => {
  try {
    // 1. Excluir inscrição
    const { error: enrollErr } = await supabase
      .from('enrollments')
      .delete()
      .eq('user_id', userId);
    
    if (enrollErr) throw enrollErr;

    // 2. Excluir perfil
    const { error: profileErr } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileErr) throw profileErr;

    // 3. Excluir vídeo do storage se existir
    const fileName = `${userId}/identity_v1.mp4`;
    await supabase.storage.from('identities').remove([fileName]);

    return { success: true, error: null };
  } catch (err: any) {
    console.error('Erro ao excluir dados do usuário:', err);
    return { success: false, error: err.message };
  }
};
