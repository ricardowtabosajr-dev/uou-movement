import { supabase } from './supabase';
import { EnrollmentData } from '../types';

// ===== ENROLLMENTS (INSCRIÇÕES) =====

/**
 * Salva os dados de inscrição de um usuário.
 */
export const saveEnrollment = async (
  userId: string,
  enrollmentData: EnrollmentData
): Promise<{ success: boolean; error: string | null }> => {
  // Converter camelCase para snake_case
  const dbData = {
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
