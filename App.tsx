
import React, { useState, useEffect } from 'react';
import { UserRole, UserProfile, EnrollmentStatus, PaymentStatus } from './types';
import { supabase } from './services/supabase';
import { getProfile, updateProfile, getAllProfiles, signOut, onAuthStateChange } from './services/auth';
import Sidebar from './components/Sidebar';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import EnrollmentForm from './components/EnrollmentForm';
import UsersManagement from './components/UsersManagement';
import PaymentsManagement from './components/PaymentsManagement';
import ReportsView from './components/ReportsView';
import MissionManagement from './components/MissionManagement';
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';

type AppView = 'DASHBOARD' | 'ENROLLMENT' | 'USERS' | 'MISSIONS' | 'PAYMENTS' | 'REPORTS' | 'MISSION_INFO' | 'PAYMENT_HISTORY';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [enrollments, setEnrollments] = useState<UserProfile[]>([]);
  const [view, setView] = useState<AppView>('DASHBOARD');
  const [loading, setLoading] = useState(true);
  const [showApp, setShowApp] = useState(false);
  const [authModal, setAuthModal] = useState<{ open: boolean, mode: 'LOGIN' | 'SIGNUP' }>({ open: false, mode: 'LOGIN' });

  // Verificar sessão existente ao carregar
  useEffect(() => {
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const profile = await getProfile(session.user.id);
          if (profile) {
            setUser(profile);
            setShowApp(true);
          }
        }
      } catch (err) {
        console.error('Erro ao restaurar sessão:', err);
      }
      setLoading(false);
    };

    initSession();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setShowApp(false);
        setView('DASHBOARD');
      } else if (event === 'SIGNED_IN' && session?.user) {
        const profile = await getProfile(session.user.id);
        if (profile) {
          setUser(profile);
          setShowApp(true);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Carregar lista de inscrições (para admin)
  useEffect(() => {
    if (user?.role === UserRole.ADMIN) {
      loadEnrollments();
    }
  }, [user?.role]);

  const loadEnrollments = async () => {
    const profiles = await getAllProfiles();
    setEnrollments(profiles.filter(p => p.role === UserRole.USER));
  };

  const handleLogout = async () => {
    await signOut();
    setUser(null);
    setShowApp(false);
    setView('DASHBOARD');
  };

  const handleAuthSuccess = (authenticatedUser: UserProfile) => {
    setUser(authenticatedUser);
    setShowApp(true);
    setAuthModal({ ...authModal, open: false });
  };

  const handleEnrollmentComplete = async (paymentMethod: string) => {
    if (!user) return;

    await updateProfile(user.id, {
      enrollmentStatus: EnrollmentStatus.REVIEWING,
      paymentStatus: PaymentStatus.PAID,
    });

    const updatedUser: UserProfile = {
      ...user,
      enrollmentStatus: EnrollmentStatus.REVIEWING,
      paymentStatus: PaymentStatus.PAID,
    };
    setUser(updatedUser);

    // Atualizar a lista de enrollments para admins
    setEnrollments(prev => {
      const exists = prev.find(e => e.id === updatedUser.id);
      if (exists) return prev.map(e => e.id === updatedUser.id ? updatedUser : e);
      return [updatedUser, ...prev];
    });

    setView('DASHBOARD');
  };

  const updateEnrollmentStatus = async (userId: string, status: EnrollmentStatus) => {
    await updateProfile(userId, { enrollmentStatus: status });

    setEnrollments(prev => prev.map(e => e.id === userId ? { ...e, enrollmentStatus: status } : e));
    if (user?.id === userId) setUser({ ...user, enrollmentStatus: status });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4 bg-slate-950">
        <div className="w-12 h-12 border-4 border-red-700 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 animate-pulse font-mono tracking-widest text-xs uppercase text-center px-4">
          Sincronizando Identidade Tática...
        </p>
      </div>
    );
  }

  if (!showApp) {
    return (
      <>
        <LandingPage 
          onEnterAdmin={() => setAuthModal({ open: true, mode: 'LOGIN' })} 
          onEnterUser={() => setAuthModal({ open: true, mode: 'SIGNUP' })} 
        />
        <AuthModal 
          isOpen={authModal.open}
          initialMode={authModal.mode}
          onClose={() => setAuthModal({ ...authModal, open: false })}
          onAuthSuccess={handleAuthSuccess}
        />
      </>
    );
  }

  const handleBriefingComplete = async () => {
    if (!user) return;
    
    await updateProfile(user.id, { briefingCompleted: true });

    const updatedUser = { ...user, briefingCompleted: true };
    setUser(updatedUser);
  };

  const renderContent = () => {
    switch (view) {
      case 'DASHBOARD':
        return user?.role === UserRole.ADMIN ? (
          <AdminDashboard enrollments={enrollments} />
        ) : (
          <UserDashboard 
            user={user!} 
            onStartEnrollment={() => setView('ENROLLMENT')} 
            onCompleteBriefing={handleBriefingComplete}
          />
        );
      case 'ENROLLMENT':
        return <EnrollmentForm user={user!} onComplete={handleEnrollmentComplete} />;
      case 'USERS':
        return (
          <UsersManagement 
            enrollments={enrollments} 
            onApprove={(id) => updateEnrollmentStatus(id, EnrollmentStatus.APPROVED)}
            onReject={(id) => updateEnrollmentStatus(id, EnrollmentStatus.REJECTED)}
          />
        );
      case 'MISSIONS':
        return <MissionManagement />;
      case 'PAYMENTS':
        return <PaymentsManagement enrollments={enrollments} />;
      case 'REPORTS':
        return <ReportsView enrollments={enrollments} />;
      case 'MISSION_INFO':
        return <UserDashboard user={user!} onStartEnrollment={() => setView('ENROLLMENT')} onCompleteBriefing={handleBriefingComplete} />;
      case 'PAYMENT_HISTORY':
        return <PaymentsManagement enrollments={enrollments.filter(e => e.id === user?.id)} isUserMode={true} />;
      default:
        return <AdminDashboard enrollments={enrollments} />;
    }
  };

  const getViewTitle = () => {
    switch (view) {
      case 'DASHBOARD': return user?.role === UserRole.ADMIN ? 'Logística Central' : 'Minha Jornada';
      case 'ENROLLMENT': return 'Inscrição de Missão';
      case 'USERS': return 'Participantes Ativos';
      case 'MISSIONS': return 'Operações de Campo';
      case 'PAYMENTS': return 'Logística Financeira';
      case 'REPORTS': return 'Análise de Inteligência';
      case 'MISSION_INFO': return 'Sobre o Chamado';
      case 'PAYMENT_HISTORY': return 'Minhas Transações';
      default: return 'UOU MOVEMENT';
    }
  };

  return (
    <div className="flex h-screen overflow-hidden text-slate-100 bg-slate-950">
      <Sidebar 
        user={user!} 
        activeView={view} 
        onViewChange={(v) => setView(v as AppView)} 
        onLogout={handleLogout}
        onToggleRole={() => {}}
      />
      
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-black tracking-tighter uppercase">{getViewTitle()}</h2>
            <p className="text-slate-500 font-mono text-[10px] md:text-xs uppercase">
              RECRUTA: {user?.name.toUpperCase()} • ID: {user?.id.substring(0, 8).toUpperCase()}
            </p>
          </div>
          <div className="flex items-center gap-4 bg-slate-900 px-4 py-2 rounded-lg border border-slate-800 shadow-xl shadow-black/20">
             <div className="text-right">
                <p className="text-sm font-bold text-slate-300">{user?.role === UserRole.ADMIN ? 'ADMINISTRADOR' : 'PARTICIPANTE'}</p>
                <div className="flex justify-end gap-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <p className="text-[8px] text-emerald-500 uppercase tracking-widest font-black">Sessão Ativa</p>
                </div>
             </div>
             <img src={user?.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-red-700/50" />
          </div>
        </header>

        <div className="max-w-7xl mx-auto pb-10">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
