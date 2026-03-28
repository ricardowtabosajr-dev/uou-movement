
import React, { useState } from 'react';
import { ShieldAlert, Mail, Lock, User, ArrowRight, X, AlertCircle } from 'lucide-react';
import { UserProfile } from '../types';
import { signIn, signUp } from '../services/auth';

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
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    if (!email || !password || (mode === 'SIGNUP' && !name)) {
      setError("Por favor, preencha todos os campos táticos.");
      setLoading(false);
      return;
    }

    if (!email.includes('@')) {
      setError("Email operacional inválido.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("O código de acesso deve ter pelo menos 6 caracteres.");
      setLoading(false);
      return;
    }

    try {
      if (mode === 'SIGNUP') {
        const result = await signUp(email, password, name);
        if (result.error) {
          setError(result.error);
          setLoading(false);
          return;
        }
        if (result.user) {
          setSuccessMessage('Cadastro realizado! Verifique seu email para confirmar o acesso.');
          // Tentar fazer login automaticamente (caso email confirmation esteja desabilitado)
          const loginResult = await signIn(email, password);
          if (loginResult.user) {
            onAuthSuccess(loginResult.user);
            onClose();
          }
        }
      } else {
        const result = await signIn(email, password);
        if (result.error) {
          setError(result.error);
          setLoading(false);
          return;
        }
        if (result.user) {
          onAuthSuccess(result.user);
          onClose();
        }
      }
    } catch (err: any) {
      setError('Erro de conexão. Tente novamente.');
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl relative animate-in zoom-in duration-300">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
          <X size={24} />
        </button>

        <div className="p-8 md:p-12">
          <div className="flex flex-col items-center mb-8">
            <div className="relative group mb-8">
              <div className="absolute -inset-4 bg-red-600/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition duration-700"></div>
              <img 
                src="/logo.png" 
                alt="UOU Movement logo" 
                className="relative h-28 w-auto object-contain drop-shadow-[0_0_30px_rgba(185,28,28,0.2)]"
              />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">
              {mode === 'LOGIN' ? 'Acesso ao Dossiê' : 'Recrutamento Individual'}
            </h2>
            <p className="text-slate-500 text-sm mt-2 text-center">
              {mode === 'LOGIN' ? 'Insira suas credenciais táticas.' : 'Inicie sua jornada no UOU MOVEMENT.'}
            </p>
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <div className="mb-4 p-3 bg-red-950/50 border border-red-900/30 rounded-xl flex items-center gap-3 animate-in fade-in duration-300">
              <AlertCircle size={18} className="text-red-500 shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Mensagem de Sucesso */}
          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-950/50 border border-emerald-900/30 rounded-xl animate-in fade-in duration-300">
              <p className="text-sm text-emerald-400">{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'SIGNUP' && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <label htmlFor="auth-name" className="sr-only">Seu Nome Completo</label>
                <input
                  id="auth-name"
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
              <label htmlFor="auth-email" className="sr-only">Seu Email Operacional</label>
              <input
                id="auth-email"
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
              <label htmlFor="auth-password" className="sr-only">Código de Acesso</label>
              <input
                id="auth-password"
                type="password"
                required
                minLength={6}
                placeholder="Código de Acesso (mín. 6 caracteres)"
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
              onClick={() => { setMode(mode === 'LOGIN' ? 'SIGNUP' : 'LOGIN'); setError(null); setSuccessMessage(null); }}
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
