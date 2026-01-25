
import React, { useState } from 'react';
import { ShieldAlert, Mail, Lock, User, ArrowRight, X } from 'lucide-react';
import { UserRole, UserProfile, EnrollmentStatus, PaymentStatus } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserProfile) => void;
  initialMode: 'LOGIN' | 'SIGNUP';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess, initialMode }) => {
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulando processamento de autenticação/criação de conta
    setTimeout(() => {
      const mockUser: UserProfile = {
        id: Math.random().toString(36).substr(2, 9),
        name: mode === 'SIGNUP' ? name : 'Usuário Recrutado',
        email: email,
        role: email.includes('admin') ? UserRole.ADMIN : UserRole.USER,
        enrollmentStatus: EnrollmentStatus.PENDING,
        paymentStatus: PaymentStatus.UNPAID,
        avatarUrl: `https://picsum.photos/seed/${email}/100/100`
      };
      
      // Salvar no localStorage para simular persistência individual
      const savedUsers = JSON.parse(localStorage.getItem('uou_users') || '[]');
      if (mode === 'SIGNUP') {
        savedUsers.push(mockUser);
        localStorage.setItem('uou_users', JSON.stringify(savedUsers));
      }

      onAuthSuccess(mockUser);
      setLoading(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl relative animate-in zoom-in duration-300">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
          <X size={24} />
        </button>

        <div className="p-8 md:p-12">
          <div className="flex flex-col items-center mb-8">
            <div className="p-3 bg-red-700 rounded-2xl mb-4 shadow-lg shadow-red-900/20">
              <ShieldAlert size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">
              {mode === 'LOGIN' ? 'Acesso ao Dossiê' : 'Recrutamento Individual'}
            </h2>
            <p className="text-slate-500 text-sm mt-2 text-center">
              {mode === 'LOGIN' ? 'Insira suas credenciais táticas.' : 'Inicie sua jornada no UOU MOVEMENT.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'SIGNUP' && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text" 
                  required
                  placeholder="Seu Nome Completo" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-4 outline-none focus:ring-2 ring-red-500/50 text-sm font-medium"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="email" 
                required
                placeholder="Seu Email Operacional" 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-4 outline-none focus:ring-2 ring-red-500/50 text-sm font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="password" 
                required
                placeholder="Código de Acesso (Senha)" 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-4 outline-none focus:ring-2 ring-red-500/50 text-sm font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button 
              disabled={loading}
              className="w-full py-4 bg-red-700 hover:bg-red-600 disabled:bg-slate-800 disabled:text-slate-500 rounded-xl font-black uppercase tracking-wider transition-all flex items-center justify-center gap-3 shadow-xl shadow-red-900/20"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <> {mode === 'LOGIN' ? 'Entrar no Sistema' : 'Finalizar Cadastro'} <ArrowRight size={20} /> </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-800 text-center">
            <button 
              onClick={() => setMode(mode === 'LOGIN' ? 'SIGNUP' : 'LOGIN')}
              className="text-sm font-bold text-slate-400 hover:text-red-500 transition-colors"
            >
              {mode === 'LOGIN' ? 'Não tem acesso? Cadastre-se aqui' : 'Já possui cadastro? Faça Login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
