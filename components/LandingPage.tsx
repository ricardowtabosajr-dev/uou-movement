
import React from 'react';
import { 
  ShieldAlert, 
  Globe, 
  Target, 
  Users, 
  MapPin, 
  ChevronRight, 
  Flame, 
  Zap, 
  ShieldCheck, 
  HeartHandshake,
  ArrowRight,
  Menu,
  X,
  Compass
} from 'lucide-react';

interface LandingPageProps {
  onEnterAdmin: () => void;
  onEnterUser: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnterAdmin, onEnterUser }) => {
  const [mobileMenu, setMobileMenu] = React.useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenu(false);
  };

  const missions = [
    { title: "Vale da Decisão", location: "Base Alpha", intensity: "Nível 4", img: "https://images.unsplash.com/photo-1533240332313-0db49b459ad6?auto=format&fit=crop&q=80" },
    { title: "Operação Catacumbas", location: "Subsolo Central", intensity: "Nível 5", img: "https://images.unsplash.com/photo-1510252119330-1c9f2801458e?auto=format&fit=crop&q=80" },
    { title: "Frente Urbana", location: "Metrópoles", intensity: "Nível 3", img: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80" },
  ];

  const historicalActions = [
    { year: "2023", name: "Missão Nordeste", impact: "500+ famílias alcançadas", img: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80" },
    { year: "2022", name: "Impacto Transcontinental", impact: "Fronteiras rompidas", img: "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&q=80" },
    { year: "2021", name: "Chamado Underground", impact: "Treinamento intensivo", img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80" },
  ];

  const flags = [
    { name: "Brasil", icon: "🇧🇷" }, { name: "Iraque", icon: "🇮🇶" }, { name: "China", icon: "🇨🇳" }, 
    { name: "Nigéria", icon: "🇳🇬" }, { name: "Índia", icon: "🇮🇳" }, { name: "Colômbia", icon: "🇨🇴" }
  ];

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 selection:bg-red-700/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="p-1.5 bg-red-700 rounded-lg">
              <ShieldAlert size={24} className="text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase">UOU <span className="text-red-600">MOVEMENT</span></span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('missoes')} className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Missões</button>
            <button onClick={() => scrollToSection('impacto')} className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Impacto</button>
            <button onClick={() => scrollToSection('alcance')} className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Alcance Global</button>
            <button 
              onClick={onEnterAdmin}
              className="px-5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors"
            >
              Portal Admin
            </button>
            <button 
              onClick={onEnterUser}
              className="px-6 py-2.5 bg-red-700 rounded-xl text-sm font-black uppercase hover:bg-red-600 transition-all shadow-lg shadow-red-900/20"
            >
              Responder ao Chamado
            </button>
          </div>

          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden text-slate-400">
            {mobileMenu ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenu && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800 p-6 space-y-4 animate-in slide-in-from-top duration-300">
            <button onClick={() => scrollToSection('missoes')} className="block w-full text-left text-lg font-bold">Missões</button>
            <button onClick={() => scrollToSection('impacto')} className="block w-full text-left text-lg font-bold">Impacto</button>
            <button onClick={() => scrollToSection('alcance')} className="block w-full text-left text-lg font-bold">Alcance Global</button>
            <div className="pt-4 flex flex-col gap-3">
              <button onClick={onEnterUser} className="w-full py-4 bg-red-700 rounded-xl font-black uppercase">Responder ao Chamado</button>
              <button onClick={onEnterAdmin} className="w-full py-4 bg-slate-800 rounded-xl font-bold">Portal Admin</button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section - Refined for Proportionality */}
      <section className="relative pt-32 pb-20 md:pt-52 md:pb-40 overflow-hidden flex items-center justify-center min-h-[90vh]">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1510252119330-1c9f2801458e?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 grayscale scale-110 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/40 to-slate-950"></div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-950/30 border border-red-900/40 rounded-full animate-in fade-in slide-in-from-bottom-2 duration-700">
            <Flame size={14} className="text-red-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-red-500">Alerta: Novas Missões Disponíveis</span>
          </div>

          <div className="space-y-4">
             <p className="text-red-700 font-black tracking-[0.6em] uppercase text-xs md:text-sm animate-pulse">UOU MOVEMENT</p>
             <h1 className="text-6xl md:text-[7rem] font-black tracking-tighter leading-[0.9] uppercase">
               As Ondas do <br /> 
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-amber-600 to-red-600">Avivamento</span>
             </h1>
          </div>
          
          <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
            O UOU MOVEMENT é um treinamento intensivo de preparação tática e espiritual para realidades de perseguição global. Prepare-se para o impossível.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
            <button 
              onClick={onEnterUser}
              className="w-full sm:w-auto px-12 py-5 bg-red-700 hover:bg-red-600 rounded-2xl font-black uppercase tracking-widest shadow-[0_20px_50px_rgba(185,28,28,0.3)] transition-all hover:scale-105 flex items-center justify-center gap-4 group"
            >
              Iniciar Inscrição Tática <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            <div className="w-full sm:w-auto flex items-center gap-4 px-8 py-5 bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800/60 group hover:border-slate-700 transition-colors">
               <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500 group-hover:scale-110 transition-transform">
                 <Users size={22} />
               </div>
               <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 leading-none mb-1">Impacto Global</p>
                  <p className="text-sm font-black whitespace-nowrap"><span className="text-white">12.5k+</span> <span className="text-slate-400">Participantes</span></p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Presence Flags */}
      <section className="bg-slate-900/20 border-y border-slate-900/50 py-12 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 text-center mb-8">Frequências de Atuação Global</p>
          <div className="flex flex-wrap justify-center gap-10 md:gap-20 opacity-40 hover:opacity-100 transition-all duration-700">
            {flags.map(f => (
              <div key={f.name} className="flex items-center gap-3 grayscale hover:grayscale-0 transition-all transform hover:scale-110">
                <span className="text-3xl">{f.icon}</span>
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">{f.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Missions Grid */}
      <section id="missoes" className="py-32 max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <div className="space-y-2">
            <div className="w-12 h-1 bg-red-700 rounded-full mb-4"></div>
            <h2 className="text-4xl font-black uppercase tracking-tight">Operações em Curso</h2>
            <p className="text-slate-500 text-sm font-medium">Missões ativas aguardando recrutas qualificados para o campo.</p>
          </div>
          <button className="text-red-500 text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all group">
            Ver mapa de operações <ChevronRight size={18} className="group-hover:translate-x-1" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {missions.map((m, i) => (
            <div key={i} className="group relative rounded-[2.5rem] overflow-hidden aspect-[4/5] border border-slate-900 shadow-2xl">
              <img src={m.img} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s]" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-10 w-full space-y-4">
                <span className="inline-block px-3 py-1 bg-red-700 text-[10px] font-black uppercase rounded-lg tracking-widest shadow-lg">{m.intensity}</span>
                <h3 className="text-3xl font-black uppercase leading-tight tracking-tighter">{m.title}</h3>
                <div className="flex items-center gap-2 text-slate-300 text-xs font-bold">
                   <MapPin size={16} className="text-red-500" /> {m.location}
                </div>
                <button 
                  onClick={onEnterUser}
                  className="w-full py-5 mt-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-red-700 hover:border-red-600 transition-all shadow-xl"
                >
                  Ver Dossiê
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Alcance Global Section */}
      <section id="alcance" className="py-32 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10">
            <div className="space-y-4">
              <h2 className="text-5xl font-black uppercase leading-[0.95] tracking-tighter">Alcance Global: <br /><span className="text-red-600">Missões nas Nações</span></h2>
              <p className="text-slate-400 text-lg leading-relaxed font-medium">
                O UOU MOVEMENT não conhece fronteiras. Atuamos onde o Evangelho é mais urgente, treinando recrutas para romper barreiras culturais e geográficas em todo o mapa mundi.
              </p>
            </div>
            <div className="space-y-8">
              <FeatureItem icon={Globe} title="Fronteiras Rompidas" desc="Presença ativa em nações de acesso restrito com logística tática especializada e suporte local." />
              <FeatureItem icon={Compass} title="Direcionamento Estratégico" desc="Identificamos os campos mais necessitados para o envio coordenado de novos missionários táticos." />
              <FeatureItem icon={Target} title="Povos Não Alcançados" desc="Nosso foco principal é onde a luz do avivamento ainda não chegou, atuando no epicentro da necessidade." />
            </div>
          </div>
          <div className="relative group">
             <div className="absolute -inset-10 bg-red-600/10 blur-[100px] rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
             <div className="relative rounded-[3rem] border border-slate-800 shadow-2xl overflow-hidden aspect-video bg-slate-900">
               <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80" className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000" alt="Mapa Mundi Tático" />
               <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-transparent pointer-events-none"></div>
             </div>
             <div className="absolute -bottom-10 -right-6 bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] hidden md:block animate-in slide-in-from-right-10 duration-1000">
                <div className="flex items-center gap-5">
                   <div className="p-4 bg-red-700 rounded-2xl text-white shadow-lg shadow-red-900/40">
                     <Globe size={28}/>
                   </div>
                   <div>
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-1">Alcance do Movimento</p>
                      <p className="text-2xl font-black text-white">40+ NAÇÕES ATIVAS</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Historical Impact */}
      <section id="impacto" className="py-32 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Ações Estratégicas</h2>
            <p className="text-slate-500 max-w-2xl mx-auto font-medium">Um histórico de edições que transformaram realidades e forjaram novos líderes para o movimento global sob pressão extrema.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {historicalActions.map((h, i) => (
              <div key={i} className="bg-slate-950 border border-slate-900 rounded-[2.5rem] p-8 hover:border-red-700/40 transition-all group">
                <div className="aspect-video rounded-3xl overflow-hidden mb-8 relative">
                  <img src={h.img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
                  <div className="absolute top-6 left-6 bg-slate-900/90 backdrop-blur-md px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest border border-white/5">{h.year}</div>
                </div>
                <h4 className="text-2xl font-black uppercase tracking-tight mb-3">{h.name}</h4>
                <div className="flex items-center gap-3 text-emerald-500 text-[10px] font-black uppercase tracking-[0.15em]">
                  <Globe size={18} /> {h.impact}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-red-700 via-red-800 to-red-950 rounded-[4rem] p-16 md:p-28 text-center relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(185,28,28,0.4)]">
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 blur-[120px] -mr-64 -mt-64 rounded-full"></div>
           <div className="relative z-10 space-y-8">
             <h2 className="text-5xl md:text-7xl font-black uppercase leading-[0.85] tracking-tighter">Você aceita <br />o chamado?</h2>
             <p className="text-white/80 max-w-lg mx-auto text-lg font-medium leading-relaxed">Vagas limitadas por edição devido à natureza intensiva do treinamento. Garanta seu lugar no campo.</p>
             <button 
              onClick={onEnterUser}
              className="px-16 py-6 bg-white text-red-800 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-100 transition-all hover:scale-105 shadow-2xl"
             >
               Inscrever-se Agora
             </button>
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-32 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-20">
          <div className="md:col-span-2 space-y-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-700 rounded-xl shadow-lg shadow-red-900/20">
                <ShieldAlert size={28} className="text-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter uppercase">UOU <span className="text-red-600">MOVEMENT</span></span>
            </div>
            <p className="text-slate-500 max-w-xs text-sm leading-relaxed font-medium">Movimento de despertamento e preparação tática para a Igreja do século XXI. Atuação global coordenada, impacto local profundo.</p>
          </div>
          <div>
            <h5 className="font-black uppercase text-[10px] tracking-[0.3em] mb-10 text-slate-500">Navegação</h5>
            <ul className="space-y-6 text-sm font-bold text-slate-400">
              <li><button onClick={() => scrollToSection('missoes')} className="hover:text-red-500 text-left transition-colors">Missões Ativas</button></li>
              <li><button onClick={() => scrollToSection('impacto')} className="hover:text-red-500 text-left transition-colors">Impacto Global</button></li>
              <li><button onClick={() => scrollToSection('alcance')} className="hover:text-red-500 text-left transition-colors">Alcance Global</button></li>
            </ul>
          </div>
          <div>
            <h5 className="font-black uppercase text-[10px] tracking-[0.3em] mb-10 text-slate-500">Sociais</h5>
            <ul className="space-y-6 text-sm font-bold text-slate-400">
              <li><a href="#" className="hover:text-red-500 transition-colors">Instagram</a></li>
              <li><a href="#" className="hover:text-red-500 transition-colors">YouTube</a></li>
              <li><a href="#" className="hover:text-red-500 transition-colors">Telegram</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-32 pt-12 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] font-mono text-slate-700 uppercase tracking-[0.4em]">© 2024 UOU MOVEMENT • PROTOCOLO DE SEGURANÇA ATIVO</p>
          <div className="flex gap-6">
             {["🇺🇸", "🇬🇧", "🇫🇷", "🇪🇸"].map(f => <span key={f} className="text-xl opacity-20 hover:opacity-100 transition-opacity cursor-default">{f}</span>)}
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureItem = ({ icon: Icon, title, desc }: any) => (
  <div className="flex gap-8 group">
    <div className="flex-shrink-0 w-16 h-16 bg-red-950/20 border border-red-900/30 rounded-3xl flex items-center justify-center text-red-500 group-hover:bg-red-700 group-hover:text-white transition-all duration-500">
      <Icon size={28} />
    </div>
    <div className="space-y-1">
      <h4 className="font-black text-xl uppercase tracking-tight">{title}</h4>
      <p className="text-slate-500 text-sm font-medium leading-relaxed">{desc}</p>
    </div>
  </div>
);

export default LandingPage;
