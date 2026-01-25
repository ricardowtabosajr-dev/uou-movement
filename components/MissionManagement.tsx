
import React from 'react';
import { Target, Users, Calendar, MapPin, ChevronRight, AlertTriangle } from 'lucide-react';

const MissionManagement: React.FC = () => {
  const missions = [
    { id: 'm1', title: 'Operação Vale da Decisão', status: 'IN_PROGRESS', date: '12 Out 2024', enrolled: 450, capacity: 500 },
    { id: 'm2', title: 'Treinamento Catacumbas', status: 'OPEN', date: '22 Dez 2024', enrolled: 85, capacity: 200 },
    { id: 'm3', title: 'Missão Silenciosa', status: 'CLOSED', date: '15 Mar 2025', enrolled: 0, capacity: 150 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {missions.map(m => (
          <div key={m.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-red-500/50 transition-all flex flex-col group">
            <div className="h-32 bg-[url('https://images.unsplash.com/photo-1533240332313-0db49b459ad6?auto=format&fit=crop&q=80')] bg-cover bg-center relative">
               <div className="absolute inset-0 bg-slate-950/60"></div>
               <div className="absolute top-4 right-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                    m.status === 'OPEN' ? 'bg-emerald-500 text-white' : 
                    m.status === 'IN_PROGRESS' ? 'bg-amber-500 text-white' : 
                    'bg-slate-700 text-slate-300'
                  }`}>
                    {m.status}
                  </span>
               </div>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="text-lg font-black uppercase mb-4">{m.title}</h3>
              <div className="space-y-3 mb-8">
                 <div className="flex items-center gap-3 text-xs text-slate-400">
                    <Calendar size={14} className="text-red-500" /> {m.date}
                 </div>
                 <div className="flex items-center gap-3 text-xs text-slate-400">
                    <MapPin size={14} className="text-red-500" /> Base de Treinamento UOU
                 </div>
                 <div className="flex items-center gap-3 text-xs text-slate-400">
                    <Users size={14} className="text-red-500" /> {m.enrolled} / {m.capacity} Participantes
                 </div>
              </div>

              <div className="mt-auto">
                 <div className="w-full bg-slate-800 h-1.5 rounded-full mb-4 overflow-hidden">
                    <div className="bg-red-700 h-full" style={{ width: `${(m.enrolled/m.capacity)*100}%` }}></div>
                 </div>
                 <button className="w-full py-3 bg-slate-800 group-hover:bg-red-700 transition-all rounded-xl font-bold text-xs flex items-center justify-center gap-2">
                   Gerenciar Missão <ChevronRight size={16} />
                 </button>
              </div>
            </div>
          </div>
        ))}

        <button className="border-2 border-slate-800 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:border-red-500/50 hover:bg-slate-900/30 transition-all group">
           <div className="p-4 bg-slate-800 rounded-full group-hover:bg-red-700 transition-colors">
              <Target size={32} />
           </div>
           <p className="font-bold text-slate-500 uppercase tracking-widest text-xs">Criar Nova Missão</p>
        </button>
      </div>

      <div className="bg-red-950/10 border border-red-900/20 p-6 rounded-2xl flex gap-4 items-center">
         <AlertTriangle className="text-red-500" size={32} />
         <div>
            <h4 className="font-bold">Aviso Logístico</h4>
            <p className="text-sm text-slate-400">A Operação Vale da Decisão atingiu 90% da capacidade. Recomenda-se abrir novas frentes de recrutamento.</p>
         </div>
      </div>
    </div>
  );
};

export default MissionManagement;
