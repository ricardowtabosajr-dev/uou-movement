import React, { useState } from 'react';
import { UserProfile, EnrollmentStatus, PaymentStatus } from '../types';
import { Search, Filter, CheckCircle, Eye, Trash2 } from 'lucide-react';
import EnrollmentDetailPanel from './EnrollmentDetailPanel';

interface UsersManagementProps {
  enrollments: UserProfile[];
  onApprove: (userId: string) => void;
  onDelete: (userId: string) => void;
}

const UsersManagement: React.FC<UsersManagementProps> = ({ enrollments, onApprove, onDelete }) => {
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

  const handleExportCSV = () => {
    if (enrollments.length === 0) return;

    const headers = ['Nome', 'Email', 'Missao', 'Status Inscricao', 'Financeiro'];
    const rows = enrollments.map(u => [
      `"${u.name}"`,
      `"${u.email}"`,
      '"Chamado Intensivo 2024"',
      `"${u.enrollmentStatus}"`,
      `"${u.paymentStatus}"`
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `participantes_uou_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Painel Lateral de Detalhes */}
      {selectedUser && (
        <EnrollmentDetailPanel
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onApprove={onApprove}
          onDelete={onDelete}
        />
      )}

      <div className="flex flex-col md:flex-row gap-4 justify-between items-center no-print">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou email..." 
            aria-label="Buscar participantes"
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 ring-red-500/50 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors">
            <Filter size={18} /> Filtrar Status
          </button>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-3 bg-red-700 rounded-xl text-sm font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-900/20"
          >
            Exportar Lista (CSV)
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl no-print">
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
                      onClick={() => onDelete(user.id)}
                      className="p-2.5 bg-slate-800/50 hover:bg-red-900/60 rounded-xl text-red-500 transition-all hover:scale-110" 
                      title="Excluir Usuário"
                    >
                      <Trash2 size={18} />
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
