import React, { useState, useEffect } from 'react';
import { Target, Users, Calendar, MapPin, ChevronRight, AlertTriangle, X, Save, Trash2, Plus } from 'lucide-react';
import { Mission } from '../types';

const MissionManagement: React.FC = () => {
   const [missions, setMissions] = useState<Mission[]>(() => {
      const saved = localStorage.getItem('uou_missions');
      if (saved) return JSON.parse(saved);
      return [
         { id: 'm1', title: 'Operação Vale da Decisão', description: 'Missão de treinamento intensivo.', startDate: '2024-10-12', endDate: '2024-10-20', capacity: 500, enrolled: 450, status: 'IN_PROGRESS' },
         { id: 'm2', title: 'Treinamento Catacumbas', description: 'Treinamento de sobrevivência e fé.', startDate: '2024-12-22', endDate: '2024-12-30', capacity: 200, enrolled: 85, status: 'OPEN' },
         { id: 'm3', title: 'Missão Silenciosa', description: 'Operação em locais de restrição.', startDate: '2025-03-15', endDate: '2025-03-25', capacity: 150, enrolled: 0, status: 'CLOSED' },
      ];
   });

   const [isModalOpen, setIsModalOpen] = useState(false);
   const [editingMission, setEditingMission] = useState<Partial<Mission> | null>(null);

   useEffect(() => {
      localStorage.setItem('uou_missions', JSON.stringify(missions));
   }, [missions]);

   const handleOpenModal = (mission?: Mission) => {
      if (mission) {
         setEditingMission(mission);
      } else {
         setEditingMission({
            title: '',
            description: '',
            startDate: '',
            endDate: '',
            capacity: 100,
            enrolled: 0,
            status: 'OPEN'
         });
      }
      setIsModalOpen(true);
   };

   const handleSave = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingMission) return;

      if (editingMission.id) {
         setMissions(prev => prev.map(m => m.id === editingMission.id ? (editingMission as Mission) : m));
      } else {
         const newMission = {
            ...editingMission,
            id: `m${Date.now()}`,
         } as Mission;
         setMissions(prev => [...prev, newMission]);
      }
      setIsModalOpen(false);
      setEditingMission(null);
   };

   const handleDelete = (id: string) => {
      if (confirm('Tem certeza que deseja excluir esta missão?')) {
         setMissions(prev => prev.filter(m => m.id !== id));
         setIsModalOpen(false);
      }
   };

   return (
      <div className="space-y-6 animate-in fade-in duration-500">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {missions.map(m => (
               <div key={m.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-red-500/50 transition-all flex flex-col group">
                  <div className="h-32 bg-[url('https://images.unsplash.com/photo-1533240332313-0db49b459ad6?auto=format&fit=crop&q=80')] bg-cover bg-center relative">
                     <div className="absolute inset-0 bg-slate-950/60"></div>
                     <div className="absolute top-4 right-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${m.status === 'OPEN' ? 'bg-emerald-500 text-white' :
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
                           <Calendar size={14} className="text-red-500" /> {new Date(m.startDate).toLocaleDateString('pt-BR')}
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
                           <div className="bg-red-700 h-full" style={{ width: `${(m.enrolled / m.capacity) * 100}%` }}></div>
                        </div>
                        <button
                           onClick={() => handleOpenModal(m)}
                           className="w-full py-3 bg-slate-800 group-hover:bg-red-700 transition-all rounded-xl font-bold text-xs flex items-center justify-center gap-2"
                        >
                           Gerenciar Missão <ChevronRight size={16} />
                        </button>
                     </div>
                  </div>
               </div>
            ))}

            <button
               onClick={() => handleOpenModal()}
               className="border-2 border-slate-800 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:border-red-500/50 hover:bg-slate-900/30 transition-all group min-h-[300px]"
            >
               <div className="p-4 bg-slate-800 rounded-full group-hover:bg-red-700 transition-colors">
                  <Plus size={32} />
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

         {isModalOpen && editingMission && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-in fade-in duration-200">
               <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                  <form onSubmit={handleSave}>
                     <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-red-700/20 rounded-xl text-red-500">
                              <Target size={24} />
                           </div>
                           <h3 className="text-xl font-black uppercase tracking-tighter">
                              {editingMission.id ? 'Editar Missão' : 'Nova Missão'}
                           </h3>
                        </div>
                        <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                           <X size={20} />
                        </button>
                     </div>

                     <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                        <div className="grid grid-cols-1 gap-6">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nome da Operação</label>
                              <input
                                 required
                                 type="text"
                                 value={editingMission.title}
                                 onChange={e => setEditingMission({ ...editingMission, title: e.target.value })}
                                 className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all font-bold"
                                 placeholder="Ex: Operação Vale da Decisão"
                              />
                           </div>

                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Descrição / Objetivo</label>
                              <textarea
                                 required
                                 rows={3}
                                 value={editingMission.description}
                                 onChange={e => setEditingMission({ ...editingMission, description: e.target.value })}
                                 className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all font-medium text-sm"
                                 placeholder="Descreva os objetivos da missão..."
                              />
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Data de Início</label>
                                 <input
                                    required
                                    type="date"
                                    value={editingMission.startDate}
                                    onChange={e => setEditingMission({ ...editingMission, startDate: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all font-bold"
                                 />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Data de Término</label>
                                 <input
                                    required
                                    type="date"
                                    value={editingMission.endDate}
                                    onChange={e => setEditingMission({ ...editingMission, endDate: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all font-bold"
                                 />
                              </div>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Capacidade</label>
                                 <input
                                    required
                                    type="number"
                                    value={editingMission.capacity}
                                    onChange={e => setEditingMission({ ...editingMission, capacity: parseInt(e.target.value) })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all font-bold"
                                 />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Inscritos</label>
                                 <input
                                    required
                                    type="number"
                                    value={editingMission.enrolled}
                                    onChange={e => setEditingMission({ ...editingMission, enrolled: parseInt(e.target.value) })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all font-bold"
                                 />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Status</label>
                                 <select
                                    value={editingMission.status}
                                    onChange={e => setEditingMission({ ...editingMission, status: e.target.value as any })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all font-bold"
                                 >
                                    <option value="OPEN">Aberta</option>
                                    <option value="IN_PROGRESS">Em Andamento</option>
                                    <option value="CLOSED">Fechada</option>
                                 </select>
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="p-8 border-t border-slate-800 flex flex-col md:flex-row gap-4 bg-slate-900/50">
                        {editingMission.id && (
                           <button
                              type="button"
                              onClick={() => handleDelete(editingMission.id!)}
                              className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all order-last md:order-first"
                           >
                              <Trash2 size={16} /> Excluir Missão
                           </button>
                        )}
                        <div className="flex-1 flex gap-4">
                           <button
                              type="button"
                              onClick={() => setIsModalOpen(false)}
                              className="flex-1 px-6 py-4 border border-slate-700 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all"
                           >
                              Cancelar
                           </button>
                           <button
                              type="submit"
                              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-red-700 hover:bg-red-600 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-red-900/20"
                           >
                              <Save size={16} /> Salvar Alterações
                           </button>
                        </div>
                     </div>
                  </form>
               </div>
            </div>
         )}
      </div>
   );
};

export default MissionManagement;
