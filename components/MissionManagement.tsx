import React, { useState, useEffect } from 'react';
import { Target, Users, Calendar, MapPin, ChevronRight, AlertTriangle, X, Save, Trash2, Plus, Loader2, ImageIcon, Upload } from 'lucide-react';
import { Mission } from '../types';
import { getMissions, createMission, updateMission, deleteMission, MissionDB, uploadMissionThumbnail } from '../services/database';

interface MissionManagementProps {
   onMissionsUpdated?: () => void;
}

const MissionManagement: React.FC<MissionManagementProps> = ({ onMissionsUpdated }) => {
   const [missions, setMissions] = useState<MissionDB[]>([]);
   const [loading, setLoading] = useState(true);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [editingMission, setEditingMission] = useState<Partial<MissionDB> | null>(null);
   const [saving, setSaving] = useState(false);
   const [selectedFile, setSelectedFile] = useState<File | null>(null);
   const [previewUrl, setPreviewUrl] = useState<string | null>(null);

   useEffect(() => {
      fetchMissions();
   }, []);

   const fetchMissions = async () => {
      setLoading(true);
      const data = await getMissions();
      setMissions(data);
      setLoading(false);
      if (onMissionsUpdated) onMissionsUpdated();
   };

   const handleOpenModal = (mission?: MissionDB) => {
      setSelectedFile(null);
      if (mission) {
         setEditingMission(mission);
         setPreviewUrl(mission.thumbnail_url || null);
      } else {
         setPreviewUrl(null);
         setEditingMission({
            title: '',
            description: '',
            start_date: '',
            end_date: '',
            capacity: 100,
            enrolled: 0,
            status: 'OPEN'
         });
      }
      setIsModalOpen(true);
   };

   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
         const file = e.target.files[0];
         setSelectedFile(file);
         setPreviewUrl(URL.createObjectURL(file));
      }
   };

   const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingMission) return;
      
      setSaving(true);
      try {
         let updatedMission = { ...editingMission };

         if (selectedFile) {
            if (editingMission.id) {
               const uploadResult = await uploadMissionThumbnail(editingMission.id, selectedFile);
               if (uploadResult.success) {
                  updatedMission.thumbnail_url = uploadResult.url!;
               }
            }
         }

         if (editingMission.id) {
            const result = await updateMission(editingMission.id, updatedMission);
            if (!result.success) alert(`Erro ao atualizar: ${result.error}`);
         } else {
            const result = await createMission(updatedMission as Omit<MissionDB, 'id'>);
            if (result.success && selectedFile) {
               const allMissions = await getMissions();
               const newMission = allMissions.find(m => m.title === updatedMission.title && m.start_date === updatedMission.start_date);
               if (newMission) {
                  const uploadResult = await uploadMissionThumbnail(newMission.id, selectedFile);
                  if (uploadResult.success) {
                     await updateMission(newMission.id, { thumbnail_url: uploadResult.url! });
                  }
               }
            }
            if (!result.success) alert(`Erro ao criar: ${result.error}`);
         }
         await fetchMissions();
         setIsModalOpen(false);
         setEditingMission(null);
      } catch (err: any) {
         alert(`Erro tático: ${err.message}`);
      } finally {
         setSaving(false);
      }
   };

   const handleDelete = async (id: string) => {
      if (confirm('Tem certeza que deseja excluir esta missão? A exclusão é permanente no banco de dados.')) {
         setSaving(true);
         const result = await deleteMission(id);
         if (!result.success) {
            alert(`Erro ao excluir: ${result.error}`);
         } else {
            await fetchMissions();
            setIsModalOpen(false);
         }
         setSaving(false);
      }
   };

   return (
      <div className="space-y-6 animate-in fade-in duration-500">
         {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-900/20 rounded-3xl border border-slate-800 border-dashed">
               <Loader2 className="text-red-600 animate-spin mb-4" size={40} />
               <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Sincronizando Base de Dados...</p>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {missions.map(m => (
                  <div key={m.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-red-500/50 transition-all flex flex-col group text-left">
                     <div 
                        className="h-32 bg-cover bg-center relative"
                        style={{ backgroundImage: `url(${m.thumbnail_url || 'https://images.unsplash.com/photo-1510252119330-1c9f2801458e?auto=format&fit=crop&q=80'})` }}
                     >
                        <div className="absolute inset-0 bg-slate-950/60"></div>
                        <div className="absolute top-4 right-4">
                           <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${m.status === 'OPEN' ? 'bg-emerald-500 text-white' :
                              m.status === 'IN_PROGRESS' ? 'bg-amber-500 text-white' :
                                 'bg-slate-700 text-slate-300'
                              }`}>
                              {m.status === 'OPEN' ? 'Aberta' : m.status === 'IN_PROGRESS' ? 'Em Andamento' : 'Fechada'}
                           </span>
                        </div>
                     </div>
                     <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-lg font-black uppercase mb-4">{m.title}</h3>
                        <div className="space-y-3 mb-8">
                           <div className="flex items-center gap-3 text-xs text-slate-400">
                              <Calendar size={14} className="text-red-500" /> {new Date(m.start_date).toLocaleDateString('pt-BR')}
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
         )}

         <div className="bg-red-950/10 border border-red-900/20 p-6 rounded-2xl flex gap-4 items-center">
            <AlertTriangle className="text-red-500" size={32} />
            <div>
               <h4 className="font-bold">Aviso de Sincronização</h4>
               <p className="text-sm text-slate-400">As missões acima são persistidas dinamicamente no Supabase e refletem instantaneamente para todos os recrutas.</p>
            </div>
         </div>

         {isModalOpen && editingMission && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-in fade-in duration-200 text-left">
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
                              <label htmlFor="mission-title" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nome da Operação</label>
                              <input
                                 id="mission-title"
                                 required
                                 type="text"
                                 value={editingMission.title}
                                 onChange={e => setEditingMission({ ...editingMission, title: e.target.value })}
                                 className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all font-bold"
                                 placeholder="Ex: Operação Vale da Decisão"
                              />
                           </div>

                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Thumbnail da Missão</label>
                              <div className="flex flex-col md:flex-row gap-4 items-center">
                                 <div className="w-full md:w-32 h-20 bg-slate-800 rounded-xl overflow-hidden border border-slate-700 flex items-center justify-center relative group">
                                    {previewUrl ? (
                                       <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                                    ) : (
                                       <ImageIcon className="text-slate-600" size={24} />
                                    )}
                                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                       <Upload size={16} />
                                    </div>
                                 </div>
                                 <div className="flex-1 w-full">
                                    <input
                                       type="file"
                                       accept="image/*"
                                       onChange={handleFileChange}
                                       className="hidden"
                                       id="mission-thumb-input"
                                    />
                                    <label
                                       htmlFor="mission-thumb-input"
                                       className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-slate-800 border border-slate-700 rounded-xl font-bold text-xs cursor-pointer hover:bg-slate-700 transition-colors"
                                    >
                                       <Upload size={16} /> {previewUrl ? 'Alterar Foto' : 'Selecionar Foto'}
                                    </label>
                                    <p className="text-[9px] text-slate-500 mt-2 uppercase tracking-tighter">Recomendado: 800x600px • Máx 2MB</p>
                                 </div>
                              </div>
                           </div>

                           <div className="space-y-2">
                              <label htmlFor="mission-desc" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Descrição / Objetivo</label>
                              <textarea
                                 id="mission-desc"
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
                                 <label htmlFor="mission-start" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Data de Início</label>
                                 <input
                                    id="mission-start"
                                    required
                                    type="date"
                                    value={editingMission.start_date}
                                    onChange={e => setEditingMission({ ...editingMission, start_date: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all font-bold"
                                 />
                              </div>
                              <div className="space-y-2">
                                 <label htmlFor="mission-end" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Data de Término</label>
                                 <input
                                    id="mission-end"
                                    required
                                    type="date"
                                    value={editingMission.end_date}
                                    onChange={e => setEditingMission({ ...editingMission, end_date: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all font-bold"
                                 />
                              </div>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                 <label htmlFor="mission-capacity" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Capacidade</label>
                                 <input
                                    id="mission-capacity"
                                    required
                                    type="number"
                                    value={editingMission.capacity}
                                    onChange={e => setEditingMission({ ...editingMission, capacity: parseInt(e.target.value) })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all font-bold"
                                 />
                              </div>
                              <div className="space-y-2">
                                 <label htmlFor="mission-enrolled" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Inscritos</label>
                                 <input
                                    id="mission-enrolled"
                                    required
                                    type="number"
                                    value={editingMission.enrolled}
                                    onChange={e => setEditingMission({ ...editingMission, enrolled: parseInt(e.target.value) })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all font-bold"
                                 />
                              </div>
                              <div className="space-y-2">
                                 <label htmlFor="mission-status" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Status</label>
                                 <select
                                    id="mission-status"
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
                              disabled={saving}
                              onClick={() => handleDelete(editingMission.id!)}
                              className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all order-last md:order-first disabled:opacity-50"
                           >
                              {saving ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} Excluir Missão
                           </button>
                        )}
                        <div className="flex-1 flex gap-4">
                           <button
                              type="button"
                              disabled={saving}
                              onClick={() => setIsModalOpen(false)}
                              className="flex-1 px-6 py-4 border border-slate-700 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all disabled:opacity-50"
                           >
                              Cancelar
                           </button>
                           <button
                              type="submit"
                              disabled={saving}
                              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-red-700 hover:bg-red-600 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-red-900/20 disabled:opacity-50"
                           >
                              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {editingMission.id ? 'Salvar Alterações' : 'Criar Missão'}
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
