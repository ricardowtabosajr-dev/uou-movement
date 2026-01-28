
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, EnrollmentStatus, PaymentStatus } from '../types';
import {
  Calendar,
  MapPin,
  FileText,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  XCircle,
  Loader2,
  Play,
  ShieldAlert,
  Lock,
  Eye
} from 'lucide-react';

interface UserDashboardProps {
  user: UserProfile;
  onStartEnrollment: () => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user, onStartEnrollment }) => {
  const [showBriefing, setShowBriefing] = useState(false);
  const [briefingCompleted, setBriefingCompleted] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastTimeRef = useRef(0);

  const isPending = user.enrollmentStatus === EnrollmentStatus.PENDING;
  const isReviewing = user.enrollmentStatus === EnrollmentStatus.REVIEWING;
  const isApproved = user.enrollmentStatus === EnrollmentStatus.APPROVED;
  const isRejected = user.enrollmentStatus === EnrollmentStatus.REJECTED;
  const hasPaid = user.paymentStatus === PaymentStatus.PAID;

  const handleStartClick = () => {
    if (briefingCompleted) {
      onStartEnrollment();
    } else {
      setShowBriefing(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    // Protocolo de segurança: impede saltos para frente
    if (video.currentTime > lastTimeRef.current + 2) {
      video.currentTime = lastTimeRef.current;
    } else {
      lastTimeRef.current = video.currentTime;
    }

    // Cálculo de progresso com validação de duração
    if (video.duration) {
      const progress = (video.currentTime / video.duration) * 100;
      setVideoProgress(progress);

      // Fallback: libera o briefing quando atinge 95% do vídeo
      // Isso resolve problemas com vídeos do WhatsApp que nem sempre disparam onEnded
      if (progress >= 95 && !briefingCompleted) {
        setBriefingCompleted(true);
      }
    }
  };

  const handleVideoEnd = () => {
    setBriefingCompleted(true);
    setVideoProgress(100);
  };

  const getStatusDisplay = () => {
    if (isApproved) return {
      icon: <CheckCircle2 size={20} />,
      text: 'Inscrição Aprovada',
      subtext: 'Prepare-se para o embarque.',
      class: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
    };
    if (isReviewing) return {
      icon: <Loader2 size={20} className="animate-spin" />,
      text: 'Em Análise Logística',
      subtext: 'Aguarde a validação do comando.',
      class: 'bg-amber-500/10 text-amber-500 border-amber-500/20'
    };
    if (isRejected) return {
      icon: <XCircle size={20} />,
      text: 'Acesso Negado',
      subtext: 'Revise suas informações.',
      class: 'bg-red-500/10 text-red-500 border-red-500/20'
    };
    return null;
  };

  const statusInfo = getStatusDisplay();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {showBriefing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300 flex flex-col">
            <div className="p-6 md:p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-700 rounded-xl text-white animate-pulse">
                  <ShieldAlert size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tighter">Briefing Obrigatório</h3>
                  <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Protocolo: Realidade da Igreja Perseguida</p>
                </div>
              </div>
              {!briefingCompleted && (
                <div className="flex items-center gap-2 text-slate-500 font-mono text-xs uppercase tracking-widest">
                  <Lock size={14} /> Bloqueio de Avanço Ativo
                </div>
              )}
            </div>

            <div className="relative aspect-video bg-black flex items-center justify-center group">
              <video
                ref={videoRef}
                className="w-full h-full object-contain"
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleVideoEnd}
                autoPlay
                playsInline
                controls={false}
                disablePictureInPicture
              >
                {/* VÍDEO LOCAL DE BRIEFING */}
                <source src="/assets/videos/briefing.mp4" type="video/mp4" />
                Seu navegador não suporta vídeos.
              </video>
              <div className="absolute inset-0 z-10 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-full h-2 bg-slate-800/50">
                <div className="h-full bg-red-600 transition-all duration-300 shadow-[0_0_10px_rgba(220,38,38,0.5)]" style={{ width: `${videoProgress}%` }}></div>
              </div>
            </div>

            <div className="p-8 bg-slate-900 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="max-w-md">
                <h4 className="font-bold text-slate-200 mb-2 flex items-center gap-2 uppercase tracking-tight">
                  {briefingCompleted ? <CheckCircle2 className="text-emerald-500" /> : <Eye className="text-red-500" />}
                  {briefingCompleted ? 'Briefing Concluído' : 'Visualização Obrigatória'}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Este vídeo apresenta a realidade daqueles que servimos. Adoração, Oração e Perdão são os pilares da nossa missão. Entenda o custo antes de responder ao Chamado.
                </p>
              </div>

              {briefingCompleted ? (
                <button onClick={() => { setShowBriefing(false); onStartEnrollment(); }} className="w-full md:w-auto px-10 py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl animate-bounce">
                  Iniciar Inscrição <ArrowRight className="inline ml-2" />
                </button>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-3 px-6 py-4 bg-slate-800 rounded-xl text-slate-400 font-black uppercase text-xs">
                    <Loader2 className="animate-spin" size={18} /> Assistindo...
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="relative overflow-hidden bg-slate-900 rounded-2xl border border-slate-800 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-900/10 blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">
              Bem-vindo ao Campo, <span className="text-red-500">{user.name.split(' ')[0]}</span>.
            </h2>
            <p className="text-slate-400 mb-6 leading-relaxed">
              {isApproved
                ? "Sua convocação foi confirmada. Prepare-se para o embarque."
                : "A jornada no UOU MOVEMENT exige prontidão. Complete os protocolos abaixo."
              }
            </p>
            {isPending ? (
              <button onClick={handleStartClick} className="flex items-center gap-2 bg-red-700 hover:bg-red-600 px-8 py-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-xl shadow-red-900/20 relative group">
                {!briefingCompleted && (
                  <div className="absolute -top-3 -right-3 bg-amber-500 text-slate-950 px-2 py-1 rounded-md font-black text-[8px] uppercase tracking-tighter">
                    Briefing Pendente
                  </div>
                )}
                {briefingCompleted ? 'Continuar Inscrição' : 'Responder ao Chamado'} <ArrowRight size={20} />
              </button>
            ) : statusInfo ? (
              <div className="flex items-center gap-3 px-5 py-3 rounded-xl border font-bold shadow-lg bg-slate-900">
                {statusInfo.icon}
                <div>
                  <p className="leading-tight">{statusInfo.text}</p>
                  <p className="text-[10px] uppercase tracking-widest opacity-70">{statusInfo.subtext}</p>
                </div>
              </div>
            ) : null}
          </div>
          <div className="hidden lg:block">
            <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80" className="rounded-xl shadow-2xl border border-slate-700 h-64 w-full object-cover grayscale" alt="Mission" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="font-black uppercase tracking-widest text-sm flex items-center gap-2 mb-8">
              <Clock size={18} className="text-red-500" /> Timeline Operacional
            </h3>
            <div className="relative space-y-10 before:absolute before:inset-0 before:ml-5 before:w-0.5 before:bg-slate-800">
              <TimelineItem title="Acesso Criado" desc="Identidade tática ativada." date="Status: OK" completed />
              <TimelineItem title="Briefing e Inscrição" desc="Coleta de dados e verificação selfie." date={isPending ? "Pendente" : "Enviado"} active={isPending} completed={!isPending} />
              <TimelineItem title="Logística e Jurídico" desc="Pagamento e aceite do termo." date={hasPaid ? "Confirmado" : "Aguardando"} active={!isPending && !hasPaid} completed={hasPaid} />
              <TimelineItem title="Embarque Final" desc="Treinamento presencial." date="Out/2024" active={isApproved} completed={false} />
            </div>
          </section>
        </div>
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="font-black uppercase tracking-widest text-sm mb-6">Info Missão</h3>
            <div className="space-y-5 text-sm">
              <div className="flex gap-4">
                <Calendar size={18} className="text-red-500" />
                <div><p className="text-[10px] text-slate-500 font-black">INÍCIO</p><p className="font-bold">12 Out, 2024</p></div>
              </div>
              <div className="flex gap-4">
                <MapPin size={18} className="text-red-500" />
                <div><p className="text-[10px] text-slate-500 font-black">BASE</p><p className="font-bold">Alpha (Sigilo)</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TimelineItem = ({ title, desc, date, completed, active }: any) => (
  <div className="relative pl-12">
    <div className={`absolute left-0 w-10 h-10 rounded-full border-4 border-slate-950 flex items-center justify-center z-10 ${completed ? 'bg-emerald-500' : active ? 'bg-red-700 animate-pulse' : 'bg-slate-800'}`}>
      {completed ? <CheckCircle2 size={18} className="text-white" /> : active ? <Loader2 size={18} className="text-white animate-spin" /> : <div className="w-2 h-2 rounded-full bg-slate-600"></div>}
    </div>
    <div>
      <h4 className={`text-sm font-bold uppercase tracking-tight ${completed ? 'text-emerald-500' : active ? 'text-red-500' : 'text-slate-500'}`}>{title}</h4>
      <p className="text-xs text-slate-400 mb-1 leading-tight">{desc}</p>
      <span className="text-[10px] uppercase font-black tracking-widest text-slate-600">{date}</span>
    </div>
  </div>
);

export default UserDashboard;
