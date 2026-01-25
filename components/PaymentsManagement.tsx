
import React from 'react';
import { UserProfile, PaymentStatus } from '../types';
import { DollarSign, ArrowUpRight, ArrowDownRight, CreditCard, Landmark, QrCode } from 'lucide-react';

interface PaymentsManagementProps {
  enrollments: UserProfile[];
  isUserMode?: boolean;
}

const PaymentsManagement: React.FC<PaymentsManagementProps> = ({ enrollments, isUserMode = false }) => {
  const paidCount = enrollments.filter(e => e.paymentStatus === PaymentStatus.PAID).length;
  const totalRevenue = paidCount * 1250; // Simulando R$ 1250 por inscrição

  // Fix: Explicitly type TransactionItem as React.FC to allow React-specific props like 'key' when used in maps
  const TransactionItem: React.FC<{ user: UserProfile }> = ({ user }) => (
    <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-all">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-full ${user.paymentStatus === PaymentStatus.PAID ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
          {user.paymentStatus === PaymentStatus.PAID ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
        </div>
        <div>
          <p className="font-bold text-sm">{isUserMode ? 'Pagamento Inscrição' : user.name}</p>
          <p className="text-[10px] text-slate-500 font-mono">ID: {user.id.padStart(6, '0')}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-bold ${user.paymentStatus === PaymentStatus.PAID ? 'text-emerald-500' : 'text-slate-500'}`}>
          R$ 1.250,00
        </p>
        <p className="text-[10px] uppercase font-black text-slate-600 tracking-widest">{user.paymentStatus}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {!isUserMode && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl">
            <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-1">Arrecadação Total</p>
            <h3 className="text-4xl font-black text-emerald-500">R$ {totalRevenue.toLocaleString()}</h3>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Pagamentos Confirmados</p>
            <h3 className="text-4xl font-black">{paidCount}</h3>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Média por Missão</p>
            <h3 className="text-4xl font-black">R$ 1.2k</h3>
          </div>
        </div>
      )}

      <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 border-dashed">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Landmark size={20} className="text-red-500" /> 
          {isUserMode ? 'Histórico de Transações' : 'Log de Transações Recentes'}
        </h3>
        <div className="space-y-3">
          {enrollments.length > 0 ? (
            enrollments.map(e => <TransactionItem key={e.id} user={e} />)
          ) : (
            <p className="text-center py-10 text-slate-500">Nenhuma transação registrada no sistema.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3">
          <QrCode className="text-red-500" />
          <div>
            <p className="text-[10px] font-black uppercase text-slate-500">PIX Direto</p>
            <p className="text-sm font-bold">Configurar Chave</p>
          </div>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3 opacity-50">
          <CreditCard className="text-slate-500" />
          <div>
            <p className="text-[10px] font-black uppercase text-slate-500">Stripe Integration</p>
            <p className="text-sm font-bold">Desativado</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentsManagement;
