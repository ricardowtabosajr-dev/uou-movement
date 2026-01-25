
import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { Users, Target, TrendingUp, AlertCircle, Sparkles, ChevronRight } from 'lucide-react';
import { getAdminInsights } from '../services/gemini';
import { UserProfile, EnrollmentStatus, PaymentStatus } from '../types';

const data = [
  { name: 'Jan', inscritos: 40, pagos: 24 },
  { name: 'Fev', inscritos: 30, pagos: 13 },
  { name: 'Mar', inscritos: 20, pagos: 98 },
  { name: 'Abr', inscritos: 27, pagos: 39 },
  { name: 'Mai', inscritos: 18, pagos: 48 },
  { name: 'Jun', inscritos: 23, pagos: 38 },
  { name: 'Jul', inscritos: 34, pagos: 43 },
];

interface AdminDashboardProps {
  enrollments?: UserProfile[];
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ enrollments = [] }) => {
  const [insights, setInsights] = useState<string>('Analisando inteligência do campo...');
  const [loadingInsights, setLoadingInsights] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      const stats = {
        totalInscritos: 450 + enrollments.length,
        totalPagos: 320 + enrollments.filter(e => e.paymentStatus === PaymentStatus.PAID).length,
        metaMissao: 500
      };
      const res = await getAdminInsights(stats);
      setInsights(res);
      setLoadingInsights(false);
    };
    fetchInsights();
  }, [enrollments]);

  const stats = [
    { label: 'Total Inscritos', value: (450 + enrollments.length).toString(), icon: Users, color: 'blue', change: '+12%' },
    { label: 'Missões Ativas', value: '08', icon: Target, color: 'red', change: 'Estável' },
    { label: 'Arrecadação', value: `R$ ${(84 + (enrollments.filter(e => e.paymentStatus === PaymentStatus.PAID).length * 0.5)).toFixed(1)}k`, icon: TrendingUp, color: 'emerald', change: '+24%' },
    { label: 'Pendências', value: (15 + enrollments.filter(e => e.paymentStatus === PaymentStatus.UNPAID).length).toString(), icon: AlertCircle, color: 'amber', change: '-5%' },
  ];

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
    <div className="space-y-6">
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
            <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
            <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Fluxo de Inscrições vs Pagamentos</h3>
              <select className="bg-slate-800 border-none rounded text-xs px-2 py-1">
                <option>Últimos 6 meses</option>
                <option>Este ano</option>
              </select>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
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
                <h3 className="font-bold">Inscrições Recentes</h3>
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
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                        </div>
                     </td>
                     <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${getStatusColor(user.enrollmentStatus)}`}>
                          {user.enrollmentStatus}
                        </span>
                     </td>
                     <td className="px-6 py-4 text-sm text-slate-300">Vale da Decisão 2024</td>
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

        {/* Sidebar Insights */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-red-950/40 to-slate-900 border border-red-900/30 p-6 rounded-xl">
             <div className="flex items-center gap-2 mb-4 text-red-500">
                <Sparkles size={20} />
                <h3 className="font-bold">AI Insights Estratégicos</h3>
             </div>
             <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {loadingInsights ? (
                  <div className="space-y-3">
                    <div className="h-4 bg-slate-800 rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-slate-800 rounded w-5/6 animate-pulse"></div>
                    <div className="h-4 bg-slate-800 rounded w-full animate-pulse"></div>
                  </div>
                ) : insights}
             </div>
             <button className="mt-6 w-full py-2 bg-red-700 hover:bg-red-600 rounded-lg text-sm font-bold transition-colors">
               Gerar Relatório Completo
             </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
             <h3 className="font-bold mb-4">Metas do Trimestre</h3>
             <div className="space-y-4">
               <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Arrecadação</span>
                    <span className="text-emerald-500 font-bold">84%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: '84%' }}></div>
                  </div>
               </div>
               <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Preenchimento Vagas</span>
                    <span className="text-red-500 font-bold">62%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-red-500 h-full" style={{ width: '62%' }}></div>
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
