
import React, { useEffect, useState } from 'react';
import { UserProfile, EnrollmentStatus, PaymentStatus } from '../types';
import { getEnrollment, getIdentityVideoUrl } from '../services/database';
import {
  X, User, MapPin, Church, Activity, ShieldCheck,
  Phone, Mail, Instagram, Download, FileText,
  Video, Loader2, AlertCircle, CheckCircle, XCircle,
  Heart, Shirt, Globe, Droplet, Printer
} from 'lucide-react';

interface EnrollmentDetailPanelProps {
  user: UserProfile;
  onClose: () => void;
  onApprove: (userId: string) => void;
  onReject: (userId: string) => void;
}

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, icon, children }) => (
  <div className="border border-slate-800 rounded-2xl overflow-hidden print:border-slate-300 print:rounded-none break-inside-avoid mb-4">
    <div className="flex items-center gap-2 px-5 py-3 bg-slate-800/40 border-b border-slate-800 print:bg-slate-100 print:border-slate-300">
      <span className="print:hidden">{icon}</span>
      <h4 className="text-xs font-black uppercase tracking-widest text-slate-300 print:text-slate-900">{title}</h4>
    </div>
    <div className="p-5 space-y-3 print:p-4">{children}</div>
  </div>
);

const Field: React.FC<{ label: string; value?: string | boolean | string[] | null }> = ({ label, value }) => {
  if (value === null || value === undefined || value === '') return null;

  let displayValue: string;
  if (typeof value === 'boolean') {
    displayValue = value ? 'Sim' : 'Não';
  } else if (Array.isArray(value)) {
    displayValue = value.length > 0 ? value.join(', ') : '—';
  } else {
    displayValue = value;
  }

  return (
    <div className="break-inside-avoid">
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5 print:text-slate-600">{label}</p>
      <p className="text-sm text-slate-200 font-medium print:text-slate-900">{displayValue}</p>
    </div>
  );
};

const EnrollmentDetailPanel: React.FC<EnrollmentDetailPanelProps> = ({ user, onClose, onApprove, onReject }) => {
  const [enrollment, setEnrollment] = useState<any>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dados' | 'termo' | 'video'>('dados');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [enrollData, vidUrl] = await Promise.all([
          getEnrollment(user.id),
          getIdentityVideoUrl(user.id),
        ]);
        setEnrollment(enrollData);
        setVideoUrl(vidUrl);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user.id]);

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status?: EnrollmentStatus) => {
    const map: Record<string, { bg: string; text: string }> = {
      APPROVED: { bg: 'bg-emerald-500/10 border-emerald-500/30', text: 'text-emerald-400' },
      REVIEWING: { bg: 'bg-amber-500/10 border-amber-500/30', text: 'text-amber-400' },
      REJECTED: { bg: 'bg-red-500/10 border-red-500/30', text: 'text-red-400' },
      PENDING: { bg: 'bg-slate-500/10 border-slate-500/30', text: 'text-slate-400' },
    };
    const s = map[status || 'PENDING'] || map.PENDING;
    return `${s.bg} ${s.text} border`;
  };

  const tabs = [
    { id: 'dados' as const, label: 'Dados Completos', icon: <User size={14} /> },
    { id: 'termo' as const, label: 'Termo de Responsabilidade', icon: <FileText size={14} /> },
    { id: 'video' as const, label: 'Vídeo Selfie', icon: <Video size={14} /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm print:bg-white print:static print:inset-auto" onClick={onClose}>
      <style>{`
        @media print {
          @page { margin: 1cm; }
          body { background: white !important; }
          .no-print { display: none !important; }
          .print-content { 
            position: absolute !important; 
            left: 0 !important; 
            top: 0 !important; 
            width: 100% !important; 
            height: auto !important;
            overflow: visible !important;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
          }
          .fixed { position: static !important; }
          .overflow-y-auto { overflow: visible !important; }
        }
      `}</style>
      <div
        className="w-full max-w-2xl h-full bg-slate-900 border-l border-slate-800 shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-right duration-300 print-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 p-6 border-b border-slate-800 bg-slate-900 print:bg-white print:border-slate-300">
          <div className="flex justify-between items-start mb-5 no-print">
            <h3 className="text-lg font-black uppercase tracking-tight">Dossiê do Participante</h3>
            <div className="flex gap-2">
              <button 
                onClick={handlePrint}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all border border-slate-700 flex items-center gap-2"
              >
                <Printer size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Imprimir</span>
              </button>
              <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 transition-colors">
                <X size={20} />
              </button>
            </div>
          </div>
          
          <div className="hidden print:block mb-8 text-center border-b-2 border-slate-900 pb-6">
            <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900">UOU MOVEMENT</h1>
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-600 mt-1">Dossiê Oficial de Recrutamento</h2>
          </div>

          <div className="flex items-center gap-4">
            <img src={user.avatarUrl} className="w-16 h-16 rounded-2xl border-2 border-red-700/30 shadow-lg print:border-slate-300 print:shadow-none" alt="" />
            <div>
              <h4 className="text-xl font-black print:text-slate-900">{user.name}</h4>
              <p className="text-slate-500 text-sm print:text-slate-600">{user.email}</p>
              <div className="flex gap-2 mt-2 no-print">
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${getStatusBadge(user.enrollmentStatus)}`}>
                  {user.enrollmentStatus}
                </span>
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${
                  user.paymentStatus === PaymentStatus.PAID
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-red-500/10 text-red-400 border border-red-500/30'
                }`}>
                  {user.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-5 bg-slate-950 rounded-xl p-1 no-print">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                  activeTab === tab.id
                    ? 'bg-red-700 text-white shadow-lg shadow-red-900/30'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-500">
              <Loader2 className="animate-spin" size={32} />
              <p className="text-xs font-black uppercase tracking-widest">Carregando dossiê...</p>
            </div>
          ) : !enrollment && activeTab === 'dados' ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-500">
              <AlertCircle size={32} />
              <p className="text-sm font-bold">Nenhuma inscrição encontrada para este participante.</p>
            </div>
          ) : (
            <>
              {/* TAB: DADOS */}
              {activeTab === 'dados' && enrollment && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <Section title="Identidade" icon={<User size={14} className="text-red-500" />}>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Nome Completo" value={enrollment.full_name} />
                      <Field label="Apelido" value={enrollment.nickname} />
                      <Field label="Data de Nascimento" value={enrollment.birth_date} />
                      <Field label="Gênero" value={enrollment.gender} />
                      <Field label="Estado Civil" value={enrollment.marital_status} />
                      <Field label="Nome do Cônjuge" value={enrollment.spouse_name} />
                      <Field label="CPF" value={enrollment.cpf} />
                      <Field label="RG" value={enrollment.rg} />
                      <Field label="Tamanho Camisa" value={enrollment.shirt_size} />
                    </div>
                    {enrollment.guardian_name && (
                      <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-2 gap-3">
                        <Field label="Responsável" value={enrollment.guardian_name} />
                        <Field label="Telefone Responsável" value={enrollment.guardian_phone} />
                      </div>
                    )}
                  </Section>

                  <Section title="Contato & Localização" icon={<MapPin size={14} className="text-blue-500" />}>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Telefone" value={enrollment.phone} />
                      <Field label="Instagram" value={enrollment.instagram} />
                      <Field label="Endereço" value={enrollment.address} />
                      <Field label="Bairro" value={enrollment.neighborhood} />
                      <Field label="Cidade" value={enrollment.city} />
                      <Field label="Estado" value={enrollment.state} />
                      <Field label="CEP" value={enrollment.cep} />
                    </div>
                  </Section>

                  <Section title="Perfil Espiritual & Ministerial" icon={<Church size={14} className="text-amber-500" />}>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Igreja" value={enrollment.church_name} />
                      <Field label="Pastor" value={enrollment.pastor_name} />
                      <Field label="Telefone Pastor" value={enrollment.pastor_phone} />
                      <Field label="Tempo de Conversão" value={enrollment.conversion_time} />
                      <Field label="Batizado" value={enrollment.baptized} />
                      <Field label="Batizado no Espírito Santo" value={enrollment.baptized_in_holy_spirit} />
                      <Field label="Dons Espirituais" value={enrollment.spiritual_gifts} />
                      <Field label="Idiomas" value={enrollment.languages} />
                      <Field label="Ministério Atual" value={enrollment.current_ministry} />
                      <Field label="Recomendação Pastoral" value={enrollment.pastoral_recommendation} />
                      <Field label="Processo de Cura Interior" value={enrollment.inner_healing_process} />
                    </div>
                    <Field label="Áreas de Interesse Missionário" value={enrollment.missionary_interest_areas} />
                    <Field label="Experiência Missionária" value={enrollment.missionary_experience} />
                    <Field label="Motivação" value={enrollment.motivation} />
                    <Field label="Habilidades" value={enrollment.skills} />
                    <Field label="Projetos Sociais" value={enrollment.social_projects} />
                    <Field label="Plano Financeiro" value={enrollment.financial_plan} />
                  </Section>

                  <Section title="Prontidão de Saúde" icon={<Activity size={14} className="text-emerald-500" />}>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Contato de Emergência" value={enrollment.emergency_contact} />
                      <Field label="Telefone Emergência" value={enrollment.emergency_phone} />
                      <Field label="Tipo Sanguíneo" value={enrollment.blood_type} />
                      <Field label="Restrição Física" value={enrollment.has_physical_constraint} />
                    </div>
                    <Field label="Condições Específicas" value={enrollment.specific_conditions} />
                    <Field label="Condições de Saúde" value={enrollment.health_conditions} />
                    <Field label="Alergias" value={enrollment.allergies} />
                    <Field label="Medicamentos" value={enrollment.medications} />
                    <Field label="Restrições Alimentares" value={enrollment.food_restrictions} />
                  </Section>

                  <Section title="Protocolo" icon={<ShieldCheck size={14} className="text-red-500" />}>
                    <Field label="Aceitou os Termos" value={enrollment.agreed_to_terms} />
                    <Field label="Data da Inscrição" value={enrollment.created_at ? new Date(enrollment.created_at).toLocaleString('pt-BR') : null} />
                  </Section>
                </div>
              )}

              {/* TAB: TERMO */}
              {activeTab === 'termo' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  {enrollment?.consent_term ? (
                    <>
                      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 max-h-[60vh] overflow-y-auto print:bg-white print:border-none print:max-h-none print:p-0">
                        <div className="font-mono text-[13px] leading-relaxed text-slate-400 whitespace-pre-wrap print:text-black print:text-sm">
                          {enrollment.consent_term}
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-600 text-center uppercase tracking-widest">
                        Termo gerado em {enrollment.created_at ? new Date(enrollment.created_at).toLocaleString('pt-BR') : 'data não disponível'}
                      </p>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-500">
                      <FileText size={40} className="text-slate-700" />
                      <p className="text-sm font-bold text-center">Termo de responsabilidade não disponível.</p>
                      <p className="text-xs text-slate-600 text-center max-w-xs">
                        Este participante pode ter se inscrito antes da funcionalidade de salvar o termo ser implementada.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: VÍDEO */}
              {activeTab === 'video' && (
                <div className="space-y-4 animate-in fade-in duration-300 no-print">
                  {videoUrl ? (
                    <div className="space-y-4">
                      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center">
                        <Video size={40} className="text-red-500 mx-auto mb-4" />
                        <p className="text-sm font-bold text-slate-300 mb-2">Vídeo de Identidade Disponível</p>
                        <p className="text-xs text-slate-500 mb-6">Clique abaixo para baixar o vídeo selfie de verificação do participante.</p>
                        <a
                          href={videoUrl}
                          download={`video_${user.name.replace(/\s+/g, '_')}.mp4`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-3 px-8 py-4 bg-red-700 hover:bg-red-600 text-white rounded-2xl font-black uppercase tracking-wider text-sm transition-all shadow-lg shadow-red-900/30 hover:scale-[1.02]"
                        >
                          <Download size={20} /> Baixar Vídeo
                        </a>
                      </div>
                      <p className="text-[10px] text-slate-600 text-center uppercase tracking-widest">
                        Link válido por 1 hora. Reabra o painel para gerar novo link.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-500">
                      <Video size={40} className="text-slate-700" />
                      <p className="text-sm font-bold text-center">Vídeo não disponível.</p>
                      <p className="text-xs text-slate-600 text-center max-w-xs">
                        O participante pode não ter conseguido enviar o vídeo de identidade durante a inscrição.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex-shrink-0 p-5 bg-slate-950 border-t border-slate-800 flex gap-3 no-print">
          <button
            onClick={() => { onApprove(user.id); onClose(); }}
            disabled={user.enrollmentStatus === EnrollmentStatus.APPROVED}
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-900/20 text-sm"
          >
            <CheckCircle size={18} /> Aprovar
          </button>
          <button
            onClick={() => { onReject(user.id); onClose(); }}
            disabled={user.enrollmentStatus === EnrollmentStatus.REJECTED}
            className="flex-1 flex items-center justify-center gap-2 bg-red-700 hover:bg-red-600 disabled:opacity-30 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-red-900/20 text-sm"
          >
            <XCircle size={18} /> Rejeitar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentDetailPanel;
