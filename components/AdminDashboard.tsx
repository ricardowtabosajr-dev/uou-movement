
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { Users, Target, TrendingUp, AlertCircle, Sparkles, ChevronRight } from 'lucide-react';
import { UserProfile, EnrollmentStatus, PaymentStatus } from '../types';
import { MissionDB, PaymentDB } from '../services/database';

// Dados estáticos para o gráfico como fallback (agora computados dinamicamente no componente)
const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

interface AdminDashboardProps {
  enrollments?: UserProfile[];
  missions?: MissionDB[];
  payments?: PaymentDB[];
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  enrollments = [], 
  missions = [], 
  payments = [] 
}) => {
  // Cálculos Reais
  const totalInscritos = enrollments.length;
  const missoesAtivas = missions.filter(m => m.status === 'OPEN' || m.status === 'IN_PROGRESS').length;
  const arrecadacaoTotal = payments
    .filter(p => p.status === 'PAID')
    .reduce((sum, p) => sum + p.amount, 0);
  const pendencias = enrollments.filter(e => 
    e.enrollmentStatus === EnrollmentStatus.PENDING || 
    e.enrollmentStatus === EnrollmentStatus.REVIEWING ||
    e.paymentStatus === PaymentStatus.PENDING
  ).length;

  // Gerar dados para o gráfico baseados em dados reais (Simplificado para os últimos 6 meses)
  const currentMonth = new Date().getMonth();
  const chartData = Array.from({ length: 6 }).map((_, i) => {
    const monthIdx = (currentMonth - 5 + i + 12) % 12;
    return {
      name: months[monthIdx],
      inscritos: Math.round(totalInscritos / (6 - i)), // Estimativa suave baseada no total
      pagos: Math.round(payments.filter(p => p.status === 'PAID').length / (6 - i))
    };
  });

  const stats = [
    { 
      label: 'Total Inscritos', 
      value: totalInscritos.toString(), 
      icon: Users, 
      color: 'blue', 
      change: enrollments.length > 0 ? '+Real' : '0%' 
    },
    { 
      label: 'Missões Ativas', 
      value: missoesAtivas.toString().padStart(2, '0'), 
      icon: Target, 
      color: 'red', 
      change: 'Em Campo' 
    },
    { 
      label: 'Arrecadação', 
      value: `R$ ${(arrecadacaoTotal / 1000).toFixed(1)}k`, 
      icon: TrendingUp, 
      color: 'emerald', 
      change: 'Total Pago' 
    },
    { 
      label: 'Pendências', 
      value: pendencias.toString(), 
      icon: AlertCircle, 
      color: 'amber', 
      change: 'Ação Requerida' 
    },
  ];

  // Cálculo de Metas do Trimestre
  const metaArrecadacao = Math.min(Math.round((arrecadacaoTotal / 50000) * 100), 100); // Meta de 50k
  const totalVagas = missions.reduce((sum, m) => sum + m.capacity, 0);
  const preenchimentoVagas = totalVagas > 0 ? Math.min(Math.round((totalInscritos / totalVagas) * 100), 100) : 0;

  const getStatusColor = (status?: EnrollmentStatus) => {
    switch (status) {
      case EnrollmentStatus.APPROVED: return 'bg-emerald-500/10 text-emerald-500';
      case EnrollmentStatus.REVIEWING: return 'bg-amber-500/10 text-amber-500';
      case EnrollmentStatus.REJECTED: return 'bg-red-500/10 text-red-500';
      default: return 'bg-slate-500/10 text-slate-500';
    }
  };

  const getPaymentColor = (status?: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID: return 'bg-emerald-500/10 text-emerald-500';
      case PaymentStatus.PENDING: return 'bg-amber-500/10 text-amber-500';
      case PaymentStatus.UNPAID: return 'bg-red-500/10 text-red-500';
      default: return 'bg-slate-500/10 text-slate-500';
    }
  };

  return (
    <div className="space-y-6 no-print">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 p-6 rounded-xl hover:border-slate-700 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-lg bg-${stat.color}-500/10`}>
                <stat.icon className={`text-${stat.color}-500`} size={24} />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full bg-${stat.color}-500/10 text-${stat.color}-500`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-[clamp(1.25rem,4vw,1.875rem)] font-black mb-1 leading-tight">{stat.value}</h3>
            <p className="text-sm text-slate-500 font-bold leading-relaxed">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black leading-snug">Fluxo de Inscrições vs Pagamentos</h3>
              <div className="flex items-center gap-2">
                <label htmlFor="period-select" className="sr-only">Período</label>
                <select id="period-select" className="bg-slate-800 border-none rounded text-xs px-2 py-1 text-slate-300">
                  <option>Últimos 6 meses</option>
                  <option>Este ano</option>
                </select>
              </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorInscritos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  />
                  <Area type="monotone" dataKey="inscritos" stroke="#ef4444" fillOpacity={1} fill="url(#colorInscritos)" />
                  <Area type="monotone" dataKey="pagos" stroke="#10b981" fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
             <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <h3 className="font-black leading-snug">Inscrições Recentes</h3>
                <button className="text-red-500 text-sm font-medium hover:underline flex items-center gap-1">
                  Ver todas <ChevronRight size={16} />
                </button>
             </div>
             <table className="w-full text-left">
               <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-widest">
                 <tr>
                   <th className="px-6 py-4">Usuário</th>
                   <th className="px-6 py-4">Status</th>
                   <th className="px-6 py-4">Missão</th>
                   <th className="px-6 py-4">Pagamento</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-800">
                 {enrollments.map(user => (
                   <tr key={user.id} className="hover:bg-slate-800/30 transition-colors animate-in slide-in-from-top-2 duration-300">
                     <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={user.avatarUrl} className="w-8 h-8 rounded-full border border-slate-700" alt={user.name} />
                          <div>
                            <p className="text-sm font-bold leading-normal">{user.name}</p>
                            <p className="text-xs text-slate-500 leading-normal">{user.email}</p>
                          </div>
                        </div>
                     </td>
                     <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${getStatusColor(user.enrollmentStatus)}`}>
                          {user.enrollmentStatus}
                        </span>
                     </td>
                     <td className="px-6 py-4 text-sm text-slate-300">
                        {missions.find(m => m.id === user.missionId)?.title || 'Chamado Geral'}
                     </td>
                     <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${getPaymentColor(user.paymentStatus)}`}>
                          {user.paymentStatus}
                        </span>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        </div>

        {/* Sidebar Status */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
             <h3 className="font-bold mb-4">Metas do Trimestre</h3>
             <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-slate-400 uppercase tracking-widest">Arrecadação</span>
                  <span className="text-emerald-500 font-mono">{metaArrecadacao}%</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${metaArrecadacao}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-slate-400 uppercase tracking-widest">Preenchimento Vagas</span>
                  <span className="text-red-500 font-mono">{preenchimentoVagas}%</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full transition-all duration-1000" style={{ width: `${preenchimentoVagas}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
