
import React, { useState } from 'react';
import { UserProfile, EnrollmentStatus, PaymentStatus } from '../types';
import { Search, Filter, CheckCircle, XCircle, Eye, X } from 'lucide-react';

interface UsersManagementProps {
  enrollments: UserProfile[];
  onApprove: (userId: string) => void;
  onReject: (userId: string) => void;
}

const UsersManagement: React.FC<UsersManagementProps> = ({ enrollments, onApprove, onReject }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const filtered = enrollments.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status?: EnrollmentStatus) => {
    switch (status) {
      case EnrollmentStatus.APPROVED: return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
      case EnrollmentStatus.REVIEWING: return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
      case EnrollmentStatus.REJECTED: return 'bg-red-500/10 text-red-500 border border-red-500/20';
      default: return 'bg-slate-800 text-slate-500 border border-slate-700';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Modal de Visualização Rápida */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-lg uppercase tracking-tight">Dossiê do Participante</h3>
              <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400">
                <X size={20} />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-6">
                <img src={selectedUser.avatarUrl} className="w-20 h-20 rounded-2xl border-2 border-red-700/30" alt="" />
                <div>
                  <h4 className="text-xl font-black">{selectedUser.name}</h4>
                  <p className="text-slate-500">{selectedUser.email}</p>
                  <div className="flex gap-2 mt-2">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${getStatusColor(selectedUser.enrollmentStatus)}`}>
                      {selectedUser.enrollmentStatus}
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Missão Atribuída</p>
                  <p className="font-bold">Chamado Intensivo 2024</p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Status Financeiro</p>
                  <p className={`font-bold ${selectedUser.paymentStatus === PaymentStatus.PAID ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {selectedUser.paymentStatus}
                  </p>
                </div>
              </div>
              <div className="bg-red-950/10 p-4 rounded-xl border border-red-900/20">
                <p className="text-xs text-slate-400 italic">"Participante comprometido com os protocolos de segurança e treinamento tático do UOU MOVEMENT."</p>
              </div>
            </div>
            <div className="p-6 bg-slate-950 border-t border-slate-800 flex gap-3">
               <button 
                onClick={() => { onApprove(selectedUser.id); setSelectedUser(null); }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-900/20"
               >
                 Aprovar Participante
               </button>
               <button 
                onClick={() => { onReject(selectedUser.id); setSelectedUser(null); }}
                className="flex-1 bg-red-700 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-red-900/20"
               >
                 Rejeitar
               </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou email..." 
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 ring-red-500/50 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors">
            <Filter size={18} /> Filtrar Status
          </button>
          <button className="flex items-center gap-2 px-4 py-3 bg-red-700 rounded-xl text-sm font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-900/20">
            Exportar Lista (CSV)
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-slate-800/50 border-b border-slate-800 text-slate-400 text-[10px] uppercase font-black tracking-widest">
            <tr>
              <th className="px-6 py-5">Perfil</th>
              <th className="px-6 py-5">Missão Atual</th>
              <th className="px-6 py-5">Status Inscrição</th>
              <th className="px-6 py-5">Financeiro</th>
              <th className="px-6 py-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filtered.map(user => (
              <tr key={user.id} className="hover:bg-slate-800/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img src={user.avatarUrl} className="w-10 h-10 rounded-lg border border-slate-700 shadow-lg" alt="" />
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-sm font-bold group-hover:text-red-500 transition-colors">{user.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-medium text-slate-400">Chamado Intensivo 2024</span>
                </td>
                <td className="px-6 py-4">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all ${getStatusColor(user.enrollmentStatus)}`}>
                    {user.enrollmentStatus}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                    user.paymentStatus === PaymentStatus.PAID ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                    user.paymentStatus === PaymentStatus.PENDING ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                    'bg-red-500/10 text-red-500 border border-red-500/20'
                  }`}>
                    {user.paymentStatus}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => setSelectedUser(user)}
                      className="p-2.5 bg-slate-800/50 hover:bg-slate-700 rounded-xl text-slate-400 transition-all hover:scale-110" 
                      title="Ver Dossiê"
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                      onClick={() => onApprove(user.id)}
                      className="p-2.5 bg-slate-800/50 hover:bg-emerald-900/40 rounded-xl text-emerald-500 transition-all hover:scale-110 disabled:opacity-30" 
                      title="Aprovar"
                      disabled={user.enrollmentStatus === EnrollmentStatus.APPROVED}
                    >
                      <CheckCircle size={18} />
                    </button>
                    <button 
                      onClick={() => onReject(user.id)}
                      className="p-2.5 bg-slate-800/50 hover:bg-red-900/40 rounded-xl text-red-500 transition-all hover:scale-110 disabled:opacity-30" 
                      title="Recusar"
                      disabled={user.enrollmentStatus === EnrollmentStatus.REJECTED}
                    >
                      <XCircle size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-20 text-center text-slate-500">
            <p>Nenhum participante encontrado com os critérios atuais.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersManagement;
