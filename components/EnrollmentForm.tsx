
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, EnrollmentData, PaymentStatus } from '../types';
import { generateConsentTerm } from '../services/gemini';
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Heart,
  Info,
  CreditCard,
  CheckCircle,
  FileText,
  FileDown,
  Loader2,
  MapPin,
  Church,
  Activity,
  UserCheck,
  Instagram,
  Shirt,
  Smartphone,
  Wrench,
  Stethoscope,
  Sparkles,
  Flame,
  Globe,
  HandHeart,
  Wallet,
  Languages,
  Video,
  Camera,
  Trash2,
  AlertCircle,
  ShieldHalf,
  QrCode
} from 'lucide-react';
import { jsPDF } from 'jspdf';

const getDefaultConsentTerm = (data: EnrollmentData): string => {
  return `TERMO DE CONSENTIMENTO E RESPONSABILIDADE - UOU MOVEMENT

Eu, ${data.fullName || '[Nome do Participante]'}, portador(a) do CPF ${data.cpf || '[CPF]'}, Tipo Sanguíneo ${data.bloodType || '[Tipo Sanguíneo]'}, declaro para os devidos fins que:

1. NATUREZA DA ATIVIDADE
Estou ciente de que o programa "Chamado UOU MOVEMENT" consiste em um treinamento intensivo de simulação e preparo missionário para contextos de risco. As atividades podem incluir desafios físicos extremos, privação de sono, estresse emocional e exercícios de prontidão espiritual.

2. DECLARAÇÃO DE APTIDÃO FÍSICA
Declaro estar apto(a) fisicamente para participar das atividades propostas, assumindo integralmente os riscos inerentes, incluindo possibilidade de lesões, cansaço extremo e desconforto físico.
${data.healthConditions ? `\nCondições de saúde declaradas: ${data.healthConditions}` : ''}
${data.allergies ? `Alergias declaradas: ${data.allergies}` : ''}

3. TRATAMENTO DE DADOS (LGPD)
Autorizo o tratamento dos meus dados pessoais e sensíveis para fins exclusivos de segurança médica, logística operacional e comunicação do programa, conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018).

4. AUTORIZAÇÃO DE IMAGEM E VOZ
Autorizo o uso da minha imagem e voz para fins de registro ministerial e institucional do UOU MOVEMENT.

5. CONFIDENCIALIDADE
Comprometo-me a manter sigilo absoluto sobre locais, protocolos de segurança e estratégias ensinadas durante o treinamento.

6. EMERGÊNCIAS MÉDICAS
Autorizo a equipe do UOU MOVEMENT a tomar providências médicas de emergência em meu nome, incluindo transporte e atendimento hospitalar.

Contato de Emergência: ${data.emergencyContact || '[Não informado]'} - ${data.emergencyPhone || '[Não informado]'}

Ao aceitar este termo, declaro ter lido e compreendido todas as cláusulas acima, aceitando integralmente as condições estabelecidas.

Data: ${new Date().toLocaleDateString('pt-BR')}
Local: ${data.city || '[Cidade]'} - ${data.state || '[Estado]'}`;
};

interface EnrollmentFormProps {
  user: UserProfile;
  onComplete: (data: EnrollmentData, paymentMethod: string, videoBlob: Blob) => void;
}

const EnrollmentForm: React.FC<EnrollmentFormProps> = ({ user, onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [consentTerm, setConsentTerm] = useState<string | null>(null);

  // Estados para o Vídeo de Verificação
  const [recording, setRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);

  const [formData, setFormData] = useState<EnrollmentData>({
    fullName: user.name,
    nickname: '',
    birthDate: '',
    gender: '',
    maritalStatus: '',
    spouseName: '',
    cpf: '',
    rg: '',
    shirtSize: '',
    guardianName: '',
    guardianPhone: '',
    phone: '',
    instagram: '',
    address: '',
    neighborhood: '',
    city: '',
    state: '',
    cep: '',
    churchName: '',
    pastorName: '',
    pastorPhone: '',
    conversionTime: '',
    baptized: false,
    baptizedInHolySpirit: false,
    spiritualGifts: '',
    languages: '',
    currentMinistry: '',
    pastoralRecommendation: false,
    innerHealingProcess: '',
    missionaryInterestAreas: [],
    missionaryExperience: '',
    motivation: '',
    skills: [],
    socialProjects: '',
    financialPlan: '',
    emergencyContact: '',
    emergencyPhone: '',
    bloodType: '',
    specificConditions: [],
    healthConditions: '',
    allergies: '',
    medications: '',
    foodRestrictions: '',
    hasPhysicalConstraint: false,
    agreedToTerms: false,
  });

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const month = today.getMonth() - birthDateObj.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    return age;
  };

  const isMinor = formData.birthDate !== '' && calculateAge(formData.birthDate) < 18;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const startCamera = async () => {
    try {
      // Verifica se mediaDevices está disponível (requer HTTPS ou localhost)
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn("Câmera não disponível: contexto não seguro (requer HTTPS)");
        alert("Acesso à câmera requer conexão segura (HTTPS). Em localhost, tente acessar via 127.0.0.1:3000");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: true
      });
      setCameraStream(stream);
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Erro ao acessar câmera:", err);
      alert("Não foi possível acessar a câmera. Verifique as permissões do navegador.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const startRecording = () => {
    if (!cameraStream) return;

    const mediaRecorder = new MediaRecorder(cameraStream);
    mediaRecorderRef.current = mediaRecorder;
    const chunks: BlobPart[] = [];

    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/mp4' });
      setVideoBlob(blob);
      setVideoUrl(URL.createObjectURL(blob));
      stopCamera();
    };

    mediaRecorder.start();
    setRecording(true);
    setRecordingTime(0);
    timerRef.current = window.setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= 29) {
          stopRecording();
          return 30;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const resetVideo = () => {
    setVideoBlob(null);
    setVideoUrl(null);
    setRecordingTime(0);
    startCamera();
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!videoBlob) {
        alert("Para prosseguir, realize o vídeo de identificação.");
        return;
      }
      if (isMinor && (!formData.guardianName || !formData.guardianPhone)) {
        alert("Recrutas menores de 18 anos devem preencher os dados do responsável e um telefone válido.");
        return;
      }
    }

    if (step === 4) {
      setLoading(true);
      try {
        const term = await generateConsentTerm(formData);
        // generateConsentTerm retorna string de erro em vez de lançar exceção
        if (term && !term.startsWith('Erro') && !term.startsWith('Configuração')) {
          setConsentTerm(term);
        } else {
          console.warn('Gemini retornou mensagem de erro:', term);
          setConsentTerm(getDefaultConsentTerm(formData));
        }
      } catch (err) {
        console.error('Erro na geração do termo:', err);
        setConsentTerm(getDefaultConsentTerm(formData));
      } finally {
        setLoading(false);
      }
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => setStep(prev => prev - 1);

  const [hasPaid, setHasPaid] = useState<boolean | null>(null);

  const downloadPDF = () => {
    if (!consentTerm) return;
    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxLineWidth = pageWidth - margin * 2;

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("TERMO DE RESPONSABILIDADE - UOU MOVEMENT", margin, 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const cleanText = consentTerm.replace(/[#*]/g, '');
    const lines = doc.splitTextToSize(cleanText, maxLineWidth);
    doc.text(lines, margin, 35);

    doc.save(`Inscricao_UOU_${formData.fullName.replace(/\s+/g, '_')}.pdf`);
  };

  useEffect(() => {
    if (step === 1 && !videoBlob) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [step]);

  const steps = [
    { icon: UserCheck, title: "Identidade" },
    { icon: MapPin, title: "Base" },
    { icon: Church, title: "Perfil" },
    { icon: Activity, title: "Saúde" },
    { icon: ShieldCheck, title: "Protocolo" },
    { icon: CreditCard, title: "Logística" }
  ];

  return (
    <div className="max-w-4xl mx-auto py-4">
      <div className="flex items-center justify-between mb-12 px-4 overflow-x-auto pb-4 scrollbar-hide">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center group min-w-fit">
            <div className={`flex flex-col items-center gap-2 transition-all duration-300 ${step > i + 1 ? 'text-emerald-500' : step === i + 1 ? 'text-red-500' : 'text-slate-600'}`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all shadow-lg ${step > i + 1 ? 'bg-emerald-500/10 border-emerald-500' :
                step === i + 1 ? 'bg-red-700 border-red-700 text-white animate-pulse' : 'border-slate-800 bg-slate-900'
                }`}>
                {step > i + 1 ? <CheckCircle size={24} /> : <s.icon size={22} />}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">{s.title}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-[2px] w-8 md:w-12 mx-2 md:mx-4 rounded-full ${step > i + 1 ? 'bg-emerald-500' : 'bg-slate-800'}`}></div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-700 via-amber-600 to-red-700"></div>

        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <header>
              <h2 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
                <div className="p-2 bg-red-700 rounded-lg"><UserCheck size={24} /></div>
                Identidade do Recruta
              </h2>
              <p className="text-slate-500 text-sm mt-2 font-medium">Dados essenciais para emissão de certificados e seguros.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup label="Nome Completo" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Conforme documento" />
              <InputGroup label="Nome de Tratamento" name="nickname" value={formData.nickname} onChange={handleChange} placeholder="Como gosta de ser chamado" />

              <div className="md:col-span-2 bg-slate-950/50 p-6 md:p-8 rounded-[2rem] border-2 border-dashed border-slate-800 space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-widest text-red-500 flex items-center gap-2">
                    <Video size={18} /> Verificação de Identidade (Selfie Vídeo)
                  </h4>
                  {videoBlob && (
                    <button onClick={resetVideo} className="text-[10px] font-black uppercase text-slate-500 hover:text-red-500 flex items-center gap-1 transition-colors">
                      <Trash2 size={12} /> Refazer Vídeo
                    </button>
                  )}
                </div>

                <div className="bg-red-950/20 p-4 rounded-xl border border-red-900/30">
                  <p className="text-[11px] text-red-400 leading-relaxed font-bold uppercase tracking-tight">
                    Instrução: Grave um vídeo de até 30 segundos dizendo seu nome e a frase: "Eu estou me inscrevendo para o Chamado UOU Movement".
                  </p>
                </div>

                <div className="relative aspect-video max-w-sm mx-auto bg-slate-900 rounded-3xl overflow-hidden border-4 border-slate-800 shadow-2xl">
                  {videoUrl ? (
                    <video src={videoUrl} controls className="w-full h-full object-cover" />
                  ) : (
                    <video ref={videoPreviewRef} autoPlay muted playsInline className="w-full h-full object-cover grayscale brightness-75" />
                  )}
                  {recording && (
                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-700 text-white px-3 py-1.5 rounded-full text-[10px] font-black animate-pulse shadow-xl">
                      <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                      REC {recordingTime}s / 30s
                    </div>
                  )}
                  {!videoUrl && !recording && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <div className="flex flex-col items-center gap-3">
                        <Camera size={48} className="text-slate-600" />
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Aguardando Captura</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-center">
                  {!videoUrl ? (
                    recording ? (
                      <button onClick={stopRecording} className="px-12 py-4 bg-red-700 hover:bg-red-600 rounded-2xl font-black uppercase text-xs transition-all shadow-xl shadow-red-900/40 flex items-center gap-2">
                        Interromper Gravação
                      </button>
                    ) : (
                      <button onClick={startRecording} className="px-12 py-4 bg-red-700 hover:bg-red-600 rounded-2xl font-black uppercase text-xs transition-all shadow-xl shadow-red-900/40 flex items-center gap-2 hover:scale-105 active:scale-95">
                        <Camera size={18} /> Iniciar Gravação
                      </button>
                    )
                  ) : (
                    <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 px-8 py-4 rounded-2xl text-emerald-500 font-black uppercase text-xs tracking-widest">
                      <CheckCircle size={20} /> Identidade Capturada
                    </div>
                  )}
                </div>
              </div>

              <InputGroup label="Data de Nascimento" name="birthDate" value={formData.birthDate} onChange={handleChange} type="date" />

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Sexo</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 outline-none focus:ring-2 ring-red-500/50 appearance-none text-slate-300">
                  <option value="">Selecione...</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                </select>
              </div>

              {isMinor && (
                <div className="md:col-span-2 bg-amber-950/10 border border-amber-900/30 p-6 rounded-[2rem] space-y-6 animate-in slide-in-from-top-4 duration-500">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-amber-600 rounded-lg text-white"><ShieldHalf size={20} /></div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-widest text-amber-500">Dados do Responsável Legal</h4>
                      <p className="text-[10px] font-medium text-slate-500 uppercase">Obrigatório para recrutas com menos de 18 anos</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputGroup label="Nome do Responsável" name="guardianName" value={formData.guardianName} onChange={handleChange} placeholder="Nome completo do pai, mãe ou tutor" />
                    <InputGroup label="Telefone do Responsável" name="guardianPhone" value={formData.guardianPhone} onChange={handleChange} placeholder="(00) 00000-0000" icon={<Smartphone size={14} />} />
                  </div>
                </div>
              )}

              <InputGroup label="CPF" name="cpf" value={formData.cpf} onChange={handleChange} placeholder="000.000.000-00" />
              <InputGroup label="RG" name="rg" value={formData.rg} onChange={handleChange} placeholder="Registro Geral" />

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 text-slate-500">Estado Civil</label>
                <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 outline-none focus:ring-2 ring-red-500/50 appearance-none text-slate-300">
                  <option value="">Selecione...</option>
                  <option value="Solteiro">Solteiro(a)</option>
                  <option value="Casado">Casado(a)</option>
                  <option value="Divorciado">Divorciado(a)</option>
                  <option value="Viúvo">Viúvo(a)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tamanho Camiseta</label>
                <div className="flex flex-wrap gap-2">
                  {['P', 'M', 'G', 'GG', 'EXG'].map(size => (
                    <button key={size} type="button" onClick={() => setFormData({ ...formData, shirtSize: size })} className={`px-4 py-3 rounded-xl border-2 font-black transition-all text-xs ${formData.shirtSize === size ? 'bg-red-700 border-red-700 text-white shadow-lg' : 'bg-slate-950 border-slate-800 text-slate-600'}`}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <header>
              <h2 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
                <div className="p-2 bg-red-700 rounded-lg"><MapPin size={24} /></div>
                Localização e Base
              </h2>
              <p className="text-slate-500 text-sm mt-2 font-medium">Onde você está operando atualmente?</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup label="Telefone Operacional" name="phone" value={formData.phone} onChange={handleChange} placeholder="(00) 00000-0000" icon={<Smartphone size={14} />} />
              <InputGroup label="Instagram" name="instagram" value={formData.instagram} onChange={handleChange} placeholder="@seuusuario" icon={<Instagram size={14} />} />
              
              <div className="md:col-span-2">
                <InputGroup label="Endereço Residencial" name="address" value={formData.address} onChange={handleChange} placeholder="Rua, número, complemento" />
              </div>
              
              <InputGroup label="Bairro" name="neighborhood" value={formData.neighborhood} onChange={handleChange} placeholder="Seu bairro" />
              <InputGroup label="CEP" name="cep" value={formData.cep} onChange={handleChange} placeholder="00000-000" />
              <InputGroup label="Cidade" name="city" value={formData.city} onChange={handleChange} placeholder="Sua cidade" />
              <InputGroup label="Estado" name="state" value={formData.state} onChange={handleChange} placeholder="UF" />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <header>
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
                <div className="p-2 bg-red-700 rounded-lg"><Church size={24} /></div>
                Perfil Eclesiástico
              </h2>
              <p className="text-slate-500 text-sm mt-2 font-medium">Sua caminhada e compromisso ministerial.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup label="Nome da Igreja" name="churchName" value={formData.churchName} onChange={handleChange} placeholder="Onde você congrega" />
              <InputGroup label="Nome do Pastor" name="pastorName" value={formData.pastorName} onChange={handleChange} placeholder="Líder direto" />
              <InputGroup label="Telefone do Pastor" name="pastorPhone" value={formData.pastorPhone} onChange={handleChange} placeholder="(00) 00000-0000" />
              <InputGroup label="Tempo de Conversão" name="conversionTime" value={formData.conversionTime} onChange={handleChange} placeholder="Ex: 5 anos" />
              
              <div className="flex items-center gap-6 p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <input type="checkbox" name="baptized" checked={formData.baptized} onChange={handleChange} className="w-5 h-5 accent-red-600" />
                  <label className="text-xs font-bold uppercase text-slate-400">Batizado(a)</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" name="baptizedInHolySpirit" checked={formData.baptizedInHolySpirit} onChange={handleChange} className="w-5 h-5 accent-red-600" />
                  <label className="text-xs font-bold uppercase text-slate-400">Batismo no ES</label>
                </div>
              </div>

              <div className="flex items-center gap-2 p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                <input type="checkbox" name="pastoralRecommendation" checked={formData.pastoralRecommendation} onChange={handleChange} className="w-5 h-5 accent-red-600" />
                <label className="text-xs font-bold uppercase text-slate-400">Tenho recomendação pastoral</label>
              </div>

              <div className="md:col-span-2">
                <InputGroup label="Ministério Atual" name="currentMinistry" value={formData.currentMinistry} onChange={handleChange} placeholder="O que você faz hoje na igreja?" isTextArea />
              </div>
              <div className="md:col-span-2">
                <InputGroup label="Gaps e Dons Espirituais" name="spiritualGifts" value={formData.spiritualGifts} onChange={handleChange} placeholder="Como Deus costuma te usar?" isTextArea />
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <header>
              <h2 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
                <div className="p-2 bg-red-700 rounded-lg"><Activity size={24} /></div>
                Ficha de Saúde
              </h2>
              <p className="text-slate-500 text-sm mt-2 font-medium">Dados médicos cruciais para sua segurança em campo.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup label="Contato de Emergência" name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} placeholder="Nome de um familiar/amigo" />
              <InputGroup label="Telefone de Emergência" name="emergencyPhone" value={formData.emergencyPhone} onChange={handleChange} placeholder="(00) 00000-0000" icon={<Smartphone size={14} />} />
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tipo Sanguíneo</label>
                <select name="bloodType" value={formData.bloodType} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 outline-none focus:ring-2 ring-red-500/50 appearance-none text-slate-300">
                  <option value="">Selecione...</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-2 p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                <input type="checkbox" name="hasPhysicalConstraint" checked={formData.hasPhysicalConstraint} onChange={handleChange} className="w-5 h-5 accent-red-600" />
                <label className="text-xs font-bold uppercase text-slate-400">Tenho restrição física/limitação</label>
              </div>

              <div className="md:col-span-2">
                <InputGroup label="Alergias Conocidas" name="allergies" value={formData.allergies} onChange={handleChange} placeholder="Medicamentos, alimentos, etc." isTextArea />
              </div>
              <div className="md:col-span-2">
                <InputGroup label="Condições ou Patologias" name="healthConditions" value={formData.healthConditions} onChange={handleChange} placeholder="Asma, diabetes, pressão alta, etc." isTextArea />
              </div>
              <div className="md:col-span-2">
                <InputGroup label="Medicamentos de Uso Contínuo" name="medications" value={formData.medications} onChange={handleChange} placeholder="Quais remédios você traz consigo?" isTextArea />
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <header>
              <h2 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
                <div className="p-2 bg-red-700 rounded-lg"><ShieldCheck size={24} /></div>
                Termo de Protocolo
              </h2>
              <p className="text-slate-500 text-sm mt-2 font-medium">Leia atentamente e valide via contrato inteligente de IA.</p>
            </header>

            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-inner max-h-[400px] overflow-y-auto custom-scrollbar prose prose-invert prose-sm">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-500">
                  <Loader2 className="animate-spin" size={40} />
                  <p className="font-mono text-[10px] uppercase tracking-widest text-center">IA Jurídica analisando seus dados e gerando termo personalizado...</p>
                </div>
              ) : (
                <div className="font-mono text-[13px] leading-relaxed text-slate-400 whitespace-pre-wrap">
                  {consentTerm || "Ocorreu um erro ao gerar o termo. Por favor, volte e verifique seus dados médicos."}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <button 
                onClick={downloadPDF} 
                disabled={!consentTerm}
                className="flex items-center justify-center gap-3 p-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
              >
                <FileDown size={20} /> Baixar Cópia em PDF
              </button>

              <div className="p-6 bg-red-900/10 border border-red-900/40 rounded-3xl flex items-start gap-4">
                <input 
                  type="checkbox" 
                  name="agreedToTerms" 
                  id="agreed"
                  checked={formData.agreedToTerms} 
                  onChange={handleChange} 
                  className="w-6 h-6 mt-1 accent-red-600 rounded-lg cursor-pointer"
                />
                <label htmlFor="agreed" className="text-xs font-bold text-slate-300 cursor-pointer leading-tight">
                  Eu li, entendo os riscos descritos (incluindo privação de sono, estresse e desafios físicos) e aceito integralmente os termos do Chamado UOU Movement sob as leis da LGPD.
                </label>
              </div>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
            <header className="text-center">
              <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                <CheckCircle size={40} />
              </div>
              <h2 className="text-3xl font-black uppercase tracking-tighter">Confirmação de Pagamento</h2>
              <p className="text-slate-500 text-sm mt-3 font-medium max-w-sm mx-auto">
                Para finalizar sua inscrição, confirme a situação do seu pagamento abaixo.
              </p>
            </header>

            {/* Pergunta: Já realizou o pagamento? */}
            <div className="space-y-4">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 text-center">Você já realizou o pagamento da inscrição?</p>
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <button
                  onClick={() => setHasPaid(true)}
                  className={`p-6 border-2 rounded-2xl transition-all font-black uppercase tracking-wider text-sm ${
                    hasPaid === true ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-900/30' : 'bg-slate-950 border-slate-800 hover:border-emerald-600/50 text-slate-400'
                  }`}
                >
                  <CheckCircle size={24} className="mx-auto mb-2" />
                  Sim, já paguei
                </button>
                <button
                  onClick={() => { setHasPaid(false); setPaymentMethod(null); }}
                  className={`p-6 border-2 rounded-2xl transition-all font-black uppercase tracking-wider text-sm ${
                    hasPaid === false ? 'bg-amber-600 border-amber-600 text-white shadow-lg shadow-amber-900/30' : 'bg-slate-950 border-slate-800 hover:border-amber-600/50 text-slate-400'
                  }`}
                >
                  <AlertCircle size={24} className="mx-auto mb-2" />
                  Ainda não
                </button>
              </div>
            </div>

            {/* Se SIM: Qual método? */}
            {hasPaid === true && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 text-center">Qual foi o método de pagamento?</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  {[
                    { id: 'PIX', label: 'PIX', icon: <QrCode size={28} /> },
                    { id: 'CARTAO', label: 'Cartão', icon: <CreditCard size={28} /> },
                    { id: 'DINHEIRO', label: 'Dinheiro', icon: <Wallet size={28} /> },
                  ].map(m => (
                    <button
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id)}
                      className={`p-8 border-2 rounded-2xl transition-all flex flex-col items-center gap-3 ${
                        paymentMethod === m.id ? 'bg-red-700 border-red-700 text-white shadow-lg shadow-red-900/30' : 'bg-slate-950 border-slate-800 hover:border-red-700/50 text-slate-400'
                      }`}
                    >
                      {m.icon}
                      <span className="font-black uppercase tracking-wider text-sm">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Se NÃO: Mensagem de orientação */}
            {hasPaid === false && (
              <div className="bg-amber-950/20 border border-amber-900/30 p-6 rounded-2xl text-center animate-in fade-in slide-in-from-bottom-2">
                <p className="text-amber-400 text-sm font-bold">Sem problemas! Você pode concluir a inscrição agora e realizar o pagamento depois.</p>
                <p className="text-slate-500 text-xs mt-2">Sua inscrição ficará com status "Pagamento Pendente" até a confirmação.</p>
              </div>
            )}

            {/* Botão de Finalizar */}
            <div className="flex flex-col items-center gap-4">
              <button
                disabled={hasPaid === null || (hasPaid === true && !paymentMethod)}
                onClick={() => onComplete(formData, hasPaid ? (paymentMethod || 'PENDENTE') : 'PENDENTE', videoBlob!)}
                className="w-full md:w-auto px-20 py-6 bg-red-700 hover:bg-red-600 disabled:opacity-20 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-2xl flex items-center justify-center gap-4 text-sm group"
              >
                Finalizar Inscrição
                <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <div className="flex items-center gap-2 text-slate-600">
                <ShieldCheck size={16} />
                <span className="text-[9px] uppercase font-black tracking-widest">Dados protegidos por criptografia</span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-16 flex justify-between items-center border-t border-slate-800 pt-10">
          {step > 1 && step < 6 && (
            <button onClick={handleBack} className="flex items-center gap-3 text-slate-600 hover:text-white font-black uppercase text-xs tracking-[0.2em] transition-all group">
              <ArrowLeft size={20} className="group-hover:-translate-x-1" /> Voltar
            </button>
          )}
          {step < 6 && (
            <div className="flex flex-col items-end gap-3 ml-auto">
              {step === 1 && (!videoBlob || (isMinor && (!formData.guardianName || !formData.guardianPhone))) && (
                <div className="flex items-center gap-2 text-red-500 text-[11px] font-black uppercase tracking-widest animate-pulse">
                  <AlertCircle size={14} />
                  {!videoBlob ? "Vídeo Obrigatório" : "Dados do Responsável Obrigatórios"}
                </div>
              )}
              <button onClick={handleNext} disabled={loading || (step === 5 && !formData.agreedToTerms) || (step === 1 && !videoBlob) || (step === 1 && isMinor && (!formData.guardianName || !formData.guardianPhone))} className="flex items-center gap-4 bg-red-700 hover:bg-red-600 disabled:opacity-20 px-14 py-6 rounded-2xl font-black uppercase tracking-widest transition-all shadow-2xl text-sm hover:scale-[1.02]">
                {loading ? 'Processando...' : 'Avançar'} <ArrowRight size={22} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const InputGroup = ({ label, name, value, onChange, placeholder, type = 'text', isTextArea = false, icon }: any) => (
  <div className="space-y-1.5 flex-1">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
      {icon} {label}
    </label>
    {isTextArea ? (
      <textarea name={name} value={value} onChange={onChange} placeholder={placeholder} rows={4} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 outline-none focus:ring-2 ring-red-500/50 text-sm text-slate-300 resize-none transition-all placeholder:text-slate-800 shadow-inner" />
    ) : (
      <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 outline-none focus:ring-2 ring-red-500/50 text-sm text-slate-300 transition-all placeholder:text-slate-800 shadow-inner" />
    )}
  </div>
);

export default EnrollmentForm;
