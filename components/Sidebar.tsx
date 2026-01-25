
import React from 'react';
import { UserProfile, UserRole } from '../types';
import { 
  LayoutDashboard, 
  ClipboardCheck, 
  Users, 
  Target, 
  CreditCard, 
  BarChart3, 
  Settings, 
  LogOut, 
  ShieldAlert,
  Menu,
  X,
  RefreshCw
} from 'lucide-react';

interface SidebarProps {
  user: UserProfile;
  activeView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
  onToggleRole: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, activeView, onViewChange, onLogout, onToggleRole }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const menuItems = user.role === UserRole.ADMIN ? [
    { id: 'DASHBOARD', icon: LayoutDashboard, label: 'Resumo' },
    { id: 'USERS', icon: Users, label: 'Participantes' },
    { id: 'MISSIONS', icon: Target, label: 'Missões' },
    { id: 'PAYMENTS', icon: CreditCard, label: 'Financeiro' },
    { id: 'REPORTS', icon: BarChart3, label: 'Relatórios' },
  ] : [
    { id: 'DASHBOARD', icon: LayoutDashboard, label: 'Minha Jornada' },
    { id: 'ENROLLMENT', icon: ClipboardCheck, label: 'Inscrição' },
    { id: 'MISSION_INFO', icon: Target, label: 'Sobre a Missão' },
    { id: 'PAYMENT_HISTORY', icon: CreditCard, label: 'Pagamentos' },
  ];

  // Fix: Explicitly type NavItem as React.FC to allow React-specific props like 'key' when used in JSX maps
  const NavItem: React.FC<{ item: any }> = ({ item }) => (
    <button
      onClick={() => {
        onViewChange(item.id);
        setIsOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
        activeView === item.id 
          ? 'bg-red-900/20 text-red-500 border border-red-900/30 shadow-inner' 
          : 'text-slate-400 hover:text-white hover:bg-slate-800'
      }`}
    >
      <item.icon size={20} />
      <span className="font-medium">{item.label}</span>
    </button>
  );

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 rounded-lg border border-slate-700"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className={`fixed md:relative z-40 h-full w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="p-2 bg-red-700 rounded-lg">
              <ShieldAlert className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tighter">UOU <span className="text-red-600">MOVEMENT</span></h1>
          </div>

          <nav className="flex-1 space-y-2">
            {menuItems.map(item => (
              <NavItem key={item.id} item={item} />
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-800 space-y-2">
            <button 
              onClick={onToggleRole}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-amber-500 hover:bg-amber-500/10 transition-colors"
            >
              <RefreshCw size={18} />
              <span className="text-sm font-medium">Trocar para {user.role === UserRole.ADMIN ? 'User' : 'Admin'}</span>
            </button>

            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-500 hover:text-white hover:bg-red-900/20 transition-all"
            >
              <LogOut size={20} />
              <span className="font-medium">Sair da Sessão</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
