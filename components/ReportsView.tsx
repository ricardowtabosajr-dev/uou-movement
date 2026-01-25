
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { UserProfile, EnrollmentStatus } from '../types';
import { Zap, Shield, Target, Flame } from 'lucide-react';

const data = [
  { name: 'Seg', v: 400 },
  { name: 'Ter', v: 300 },
  { name: 'Qua', v: 600 },
  { name: 'Qui', v: 800 },
  { name: 'Sex', v: 500 },
  { name: 'Sáb', v: 900 },
  { name: 'Dom', v: 1000 },
];

interface ReportsViewProps {
  enrollments: UserProfile[];
}

const ReportsView: React.FC<ReportsViewProps> = ({ enrollments }) => {
  const statusData = [
    { name: 'Aprovados', value: enrollments.filter(e => e.enrollmentStatus === EnrollmentStatus.APPROVED).length },
    { name: 'Em Análise', value: enrollments.filter(e => e.enrollmentStatus === EnrollmentStatus.REVIEWING).length },
    { name: 'Pendentes', value: enrollments.filter(e => e.enrollmentStatus === EnrollmentStatus.PENDING).length },
  ];

  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Target size={24} className="text-red-500" /> Fluxo de Engajamento
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-1">Sessão tática: Monitoramento de atividade semanal</p>
            </div>
            <div className="flex gap-2">
               <div className="px-3 py-1 bg-red-950/30 text-red-500 text-[10px] font-black uppercase rounded border border-red-900/30">Tempo Real</div>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorReport" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="v" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorReport)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl">
          <h3 className="font-bold mb-6">Status da Missão</h3>
          <div className="h-[200px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4 mt-6">
            {statusData.map((s, idx) => (
              <div key={s.name} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }}></div>
                  <span className="text-slate-400 font-medium">{s.name}</span>
                </div>
                <span className="font-bold">{s.value} participantes</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <ReportCard icon={Zap} title="Conversão" value="68%" desc="Inscritos vs Pagos" color="amber" />
        <ReportCard icon={Shield} title="LGPD" value="100%" desc="Termos de Aceite" color="emerald" />
        <ReportCard icon={Flame} title="Intensidade" value="Alta" desc="Nível de Desafio" color="red" />
        <ReportCard icon={Target} title="Meta" value="450/500" desc="Vagas Ocupadas" color="blue" />
      </div>
    </div>
  );
};

const ReportCard = ({ icon: Icon, title, value, desc, color }: any) => (
  <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
    <Icon className={`text-${color}-500 mb-4`} size={24} />
    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{title}</p>
    <h4 className="text-2xl font-black mb-1">{value}</h4>
    <p className="text-[10px] text-slate-600 font-mono">{desc}</p>
  </div>
);

export default ReportsView;
