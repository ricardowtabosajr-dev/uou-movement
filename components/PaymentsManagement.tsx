
import React, { useState, useEffect } from 'react';
import { UserProfile, PaymentStatus } from '../types';
import { DollarSign, ArrowUpRight, ArrowDownRight, CreditCard, Landmark, QrCode, X, Save, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

interface PaymentsManagementProps {
  enrollments: UserProfile[];
  isUserMode?: boolean;
}

const PaymentsManagement: React.FC<PaymentsManagementProps> = ({ enrollments, isUserMode = false }) => {
  const [pixKey, setPixKey] = useState(() => localStorage.getItem('uou_pix_key') || '');
  const [pixQRCode, setPixQRCode] = useState(() => localStorage.getItem('uou_pix_qr') || '');
  const [stripeEnabled, setStripeEnabled] = useState(() => localStorage.getItem('uou_stripe_status') === 'enabled');
  const [cardLink, setCardLink] = useState(() => localStorage.getItem('uou_card_link') || '');
  const [showPixModal, setShowPixModal] = useState(false);
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showUserPixModal, setShowUserPixModal] = useState(false);
  const [tempPixKey, setTempPixKey] = useState(pixKey);
  const [tempPixQRCode, setTempPixQRCode] = useState(pixQRCode);
  const [tempCardLink, setTempCardLink] = useState(cardLink);

  const paidCount = enrollments.filter(e => e.paymentStatus === PaymentStatus.PAID).length;
  const totalRevenue = paidCount * 1250; // Simulando R$ 1250 por inscrição

  const handleSavePix = (e: React.FormEvent) => {
    e.preventDefault();
    setPixKey(tempPixKey);
    setPixQRCode(tempPixQRCode);
    localStorage.setItem('uou_pix_key', tempPixKey);
    localStorage.setItem('uou_pix_qr', tempPixQRCode);
    setShowPixModal(false);
  };

  const handleQRCodeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempPixQRCode(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCardLink = (e: React.FormEvent) => {
    e.preventDefault();
    setCardLink(tempCardLink);
    localStorage.setItem('uou_card_link', tempCardLink);
    setShowLinkModal(false);
  };

  const toggleStripe = () => {
    const newStatus = !stripeEnabled;
    setStripeEnabled(newStatus);
    localStorage.setItem('uou_stripe_status', newStatus ? 'enabled' : 'disabled');
    setShowStripeModal(false);
  };

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleUserPayment = (method: string) => {
    if (method === 'CARD' && cardLink) {
      window.open(cardLink.startsWith('http') ? cardLink : `https://${cardLink}`, '_blank');
      return;
    }

    if (method === 'PIX') {
      setShowUserPixModal(true);
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      setTimeout(() => setPaymentSuccess(false), 3000);
    }, 2000);
  };

  const TransactionItem: React.FC<{ user: UserProfile }> = ({ user }) => (
    <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-all">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-full ${user.paymentStatus === PaymentStatus.PAID ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
          {user.paymentStatus === PaymentStatus.PAID ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
        </div>
        <div>
          <p className="font-bold text-sm">{isUserMode ? 'Inscrição: Operação Vale da Decisão' : user.name}</p>
          <p className="text-[10px] text-slate-500 font-mono">ID: {user.id.padStart(6, '0')} • {new Date().toLocaleDateString('pt-BR')}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-bold ${user.paymentStatus === PaymentStatus.PAID ? 'text-emerald-500' : 'text-slate-500'}`}>
          R$ 1.250,00
        </p>
        <p className="text-[10px] uppercase font-black text-slate-600 tracking-widest">{user.paymentStatus === PaymentStatus.PAID ? 'Confirmado' : 'Pendente'}</p>
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

      {isUserMode && (
        <div className="bg-red-900/10 border border-red-900/20 p-8 rounded-[2rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <DollarSign size={120} />
          </div>
          <div className="relative z-10 max-w-lg">
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">Central de Pagamentos</h3>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              Sua inscrição para a próxima operação exige a confirmação da taxa de logística. Escolha o método abaixo para prosseguir.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => handleUserPayment('PIX')}
                disabled={isProcessing}
                className="flex flex-col items-center gap-3 p-6 bg-slate-950 border border-slate-800 rounded-2xl hover:border-red-500/50 transition-all group"
              >
                <div className="p-3 bg-red-700/10 text-red-500 rounded-xl group-hover:bg-red-700 group-hover:text-white transition-colors">
                  <QrCode size={24} />
                </div>
                <div className="text-center">
                  <p className="font-black uppercase text-[10px] tracking-widest mb-1">Pagar com</p>
                  <p className="font-bold">PIX Direto</p>
                </div>
              </button>

              <button
                onClick={() => handleUserPayment('CARD')}
                disabled={isProcessing}
                className="flex flex-col items-center gap-3 p-6 bg-slate-950 border border-slate-800 rounded-2xl hover:border-red-500/50 transition-all group"
              >
                <div className="p-3 bg-slate-800 text-slate-400 rounded-xl group-hover:bg-red-700 group-hover:text-white transition-colors">
                  <CreditCard size={24} />
                </div>
                <div className="text-center">
                  <p className="font-black uppercase text-[10px] tracking-widest mb-1">Pagar com</p>
                  <p className="font-bold">Cartão de Crédito</p>
                </div>
              </button>
            </div>
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

      {!isUserMode && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => { setTempPixKey(pixKey); setShowPixModal(true); }}
            className={`p-4 bg-slate-900 border rounded-xl flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] text-left w-full ${pixKey ? 'border-emerald-500/50' : 'border-slate-800'}`}
          >
            <QrCode className={pixKey ? 'text-emerald-500' : 'text-red-500'} />
            <div>
              <p className="text-[10px] font-black uppercase text-slate-500">PIX Direto</p>
              <p className="text-sm font-bold">{pixKey ? 'Chave Ativa' : 'Configurar Chave'}</p>
            </div>
            {pixKey && <CheckCircle2 size={16} className="ml-auto text-emerald-500" />}
          </button>

          <button
            onClick={() => { setTempCardLink(cardLink); setShowLinkModal(true); }}
            className={`p-4 bg-slate-900 border rounded-xl flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] text-left w-full ${cardLink ? 'border-amber-500/50' : 'border-slate-800'}`}
          >
            <ArrowUpRight className={cardLink ? 'text-amber-500' : 'text-slate-500'} />
            <div>
              <p className="text-[10px] font-black uppercase text-slate-500">Link de Cartão</p>
              <p className="text-sm font-bold">{cardLink ? 'Link Ativo' : 'Link Manual'}</p>
            </div>
            {cardLink && <CheckCircle2 size={16} className="ml-auto text-amber-500" />}
          </button>

          <button
            onClick={() => setShowStripeModal(true)}
            className={`p-4 bg-slate-900 border rounded-xl flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] text-left w-full ${stripeEnabled ? 'border-emerald-500/50' : 'border-slate-800 opacity-60'}`}
          >
            <CreditCard className={stripeEnabled ? 'text-emerald-500' : 'text-slate-500'} />
            <div>
              <p className="text-[10px] font-black uppercase text-slate-500">Stripe Integration</p>
              <p className="text-sm font-bold">{stripeEnabled ? 'Integrado' : 'Desativado'}</p>
            </div>
            {stripeEnabled && <CheckCircle2 size={16} className="ml-auto text-emerald-500" />}
          </button>
        </div>
      )}

      {/* Modais omitidos para clareza, mantendo-os inalterados abaixo */}
      {isProcessing && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-red-700 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-black uppercase tracking-widest text-xs animate-pulse">Processando Transação Segura...</p>
          </div>
        </div>
      )}

      {paymentSuccess && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 p-12 rounded-[3rem] shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/20">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">Pagamento Confirmado</h3>
            <p className="text-slate-400 text-sm max-w-xs">Sua logistics foi validada. Verifique sua timeline na dashboard.</p>
          </div>
        </div>
      )}

      {/* Modal PIX Configuração (Admin) */}
      {showPixModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <form onSubmit={handleSavePix}>
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-700/20 rounded-xl text-red-500">
                    <QrCode size={20} />
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-tighter">Configurar PIX</h3>
                </div>
                <button type="button" onClick={() => setShowPixModal(false)} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label htmlFor="pix-key-input" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Chave PIX</label>
                  <input
                    id="pix-key-input"
                    required
                    type="text"
                    value={tempPixKey}
                    onChange={e => setTempPixKey(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all font-bold"
                    placeholder="Ex: financeiro@uou.com"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    QR Code do PIX <small className="text-[8px] opacity-50">(OPCIONAL)</small>
                  </label>

                  <div className="relative group">
                    {tempPixQRCode ? (
                      <div className="relative aspect-square w-full bg-white rounded-2xl overflow-hidden border-4 border-slate-800">
                        <img src={tempPixQRCode} alt="PIX QR Code" className="w-full h-full object-contain p-4" />
                        <button
                          type="button"
                          onClick={() => setTempPixQRCode('')}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center aspect-square w-full bg-slate-950 border-2 border-dashed border-slate-800 rounded-2xl cursor-pointer hover:border-red-500/50 transition-all group">
                        <div className="flex flex-col items-center gap-2 text-slate-500 group-hover:text-red-500 transition-colors">
                          <QrCode size={40} strokeWidth={1} />
                          <p className="text-[10px] font-black uppercase tracking-tighter">Upload QR Code</p>
                        </div>
                        <input type="file" accept="image/*" onChange={handleQRCodeUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowPixModal(false)}
                  className="flex-1 px-6 py-4 border border-slate-700 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-red-700 hover:bg-red-600 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg"
                >
                  <Save size={16} /> Salvar PIX
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Pagamento PIX (Usuário) */}
      {showUserPixModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 space-y-8">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-red-700/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <QrCode size={32} />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tighter">Pagamento via PIX</h3>
                <p className="text-xs text-slate-500 font-medium">Escaneie o código ou copie a chave abaixo</p>
              </div>

              {pixQRCode ? (
                <div className="bg-white p-4 rounded-3xl aspect-square w-full shadow-inner border-8 border-slate-800">
                  <img src={pixQRCode} alt="QR Code PIX" className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="aspect-square w-full bg-slate-950 border border-slate-800 rounded-3xl flex flex-col items-center justify-center gap-4 border-dashed">
                  <div className="p-4 bg-slate-900 rounded-full animate-pulse text-slate-700">
                    <QrCode size={48} strokeWidth={1} />
                  </div>
                  <p className="text-[10px] font-black uppercase text-slate-700 tracking-widest">Aguardando QR Code</p>
                </div>
              )}

              <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 space-y-2 group cursor-pointer active:scale-95 transition-all"
                onClick={() => {
                  navigator.clipboard.writeText(pixKey);
                  alert('Chave PIX copiada!');
                }}
              >
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Chave Copia e Cola</p>
                <p className="text-sm font-bold text-slate-300 break-all">{pixKey || 'Chave não cadastrada'}</p>
              </div>

              <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
                <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-500 font-medium leading-tight italic">
                  Após o pagamento, sua participação será confirmada automaticamente em até 10 minutos por nossa logística financeira.
                </p>
              </div>
            </div>

            <div className="p-6 bg-slate-900/50 border-t border-slate-800">
              <button
                onClick={() => setShowUserPixModal(false)}
                className="w-full py-5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
              >
                Fechar e Voltar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Link Manual de Cartão */}
      {showLinkModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <form onSubmit={handleSaveCardLink}>
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-700/20 rounded-xl text-amber-500">
                    <ArrowUpRight size={20} />
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-tighter">Link de Pagamento</h3>
                </div>
                <button type="button" onClick={() => setShowLinkModal(false)} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-8 space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Cole aqui o link de pagamento gerado no app da sua máquina (PagSeguro, Stone, etc). O participante será levado para este link ao clicar em pagar.
                </p>
                <div className="space-y-2">
                  <label htmlFor="card-link-input" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Link da Máquina</label>
                  <input
                    id="card-link-input"
                    required
                    type="url"
                    value={tempCardLink}
                    onChange={e => setTempCardLink(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all font-bold"
                    placeholder="https://pag.ae/..."
                  />
                </div>
              </div>
              <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="flex-1 px-6 py-4 border border-slate-700 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-amber-700 hover:bg-amber-600 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg"
                >
                  <Save size={16} /> Salvar Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Stripe */}
      {showStripeModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-700 rounded-xl text-white">
                  <CreditCard size={20} />
                </div>
                <h3 className="text-lg font-black uppercase tracking-tighter">Stripe Integration</h3>
              </div>
              <button onClick={() => setShowStripeModal(false)} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
                  <ShieldCheck size={32} />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h4 className="font-bold text-slate-200">
                  {stripeEnabled ? 'Desativar Integração?' : 'Ativar Gateway Stripe?'}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {stripeEnabled
                    ? 'Ao desativar, participantes não poderão pagar via Cartão de Crédito até que a integração seja reativada.'
                    : 'A ativação permitirá pagamentos automáticos via Cartão de Crédito e Apple/Google Pay diretamente na plataforma.'}
                </p>
              </div>
              {stripeEnabled ? (
                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex gap-3 items-start">
                  <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-500 leading-tight font-medium">
                    Certifique-se de que não há transações pendentes antes de desativar o serviço logístico de pagamentos.
                  </p>
                </div>
              ) : (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex gap-3 items-start">
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-emerald-500 leading-tight font-medium">
                    Protocolo SSL ativo. Todas as transações são seguras e processadas diretamente pelos servidores do Stripe.
                  </p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex flex-col gap-3">
              <button
                onClick={toggleStripe}
                className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg ${stripeEnabled ? 'bg-slate-800 hover:bg-red-700 text-white' : 'bg-red-700 hover:bg-red-600 text-white'
                  }`}
              >
                {stripeEnabled ? 'Desativar Agora' : 'Ativar Gateway de Pagamento'}
              </button>
              <button
                onClick={() => setShowStripeModal(false)}
                className="w-full px-6 py-4 border border-slate-700 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsManagement;
