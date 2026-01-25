
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export enum EnrollmentStatus {
  PENDING = 'PENDING',
  REVIEWING = 'REVIEWING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum PaymentStatus {
  UNPAID = 'UNPAID',
  PENDING = 'PENDING',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED'
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  enrollmentStatus?: EnrollmentStatus;
  paymentStatus?: PaymentStatus;
  missionId?: string;
  avatarUrl?: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  capacity: number;
  enrolled: number;
  status: 'OPEN' | 'CLOSED' | 'IN_PROGRESS';
}

export interface EnrollmentData {
  // Identidade & Pessoal
  fullName: string;
  nickname: string;
  birthDate: string;
  gender: string;
  maritalStatus: string;
  spouseName?: string;
  cpf: string;
  rg: string;
  shirtSize: string;
  
  // Dados do Responsável (para menores de 18)
  guardianName?: string;
  guardianPhone?: string;
  
  // Base de Contato
  phone: string;
  instagram: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
  
  // Perfil Espiritual & Ministerial
  churchName: string;
  pastorName: string;
  pastorPhone: string;
  conversionTime: string;
  baptized: boolean;
  baptizedInHolySpirit: boolean;
  spiritualGifts: string;
  languages: string;
  currentMinistry: string;
  pastoralRecommendation: boolean;
  innerHealingProcess: string;
  missionaryInterestAreas: string[];
  missionaryExperience: string;
  motivation: string;
  skills: string[];
  socialProjects: string;
  financialPlan: string;
  
  // Prontidão de Saúde
  emergencyContact: string;
  emergencyPhone: string;
  bloodType: string;
  specificConditions: string[];
  healthConditions: string;
  allergies: string;
  medications: string;
  foodRestrictions: string;
  hasPhysicalConstraint: boolean;
  
  // Termos
  agreedToTerms: boolean;
}
