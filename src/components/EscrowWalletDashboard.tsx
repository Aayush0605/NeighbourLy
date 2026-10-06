import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Wallet, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  Clock, 
  Check, 
  Smartphone, 
  Building2, 
  RefreshCw, 
  Lock, 
  ArrowRight, 
  Plus,
  Zap,
  Sparkles,
  QrCode,
  CreditCard,
  X
} from 'lucide-react';
import { UserProfile, Order, WalletTransaction } from '../types';
import { 
  calculateEscrowBreakdown, 
  verifyUpiId, 
  saveVerifiedUpiToProfile, 
  removeLinkedUpiFromProfile, 
  transferFundsToVerifiedUpi,
  UpiVerificationResponse
} from '../services/escrowService';

interface EscrowWalletDashboardProps {
  currentUser: UserProfile;
  orders: Order[];
  onUpdateUser: (updatedUser: UserProfile) => void;
  showToast: (msg: string) => void;
  onNavigate?: (view: any) => void;
}

export const EscrowWalletDashboard: React.FC<EscrowWalletDashboardProps> = ({
  currentUser,
  orders,
  onUpdateUser,
  showToast,
  onNavigate,
}) => {
  // Input for new UPI ID to verify
  const [inputUpi, setInputUpi] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<UpiVerificationResponse | null>(null);
  const [verificationError, setVerificationError] = useState('');
  const [isEditingUpi, setIsEditingUpi] = useState(false);

  // Bank Account Verification alternative
  const [payoutMode, setPayoutMode] = useState<'upi' | 'bank'>('upi');
  const [bankAccNumber, setBankAccNumber] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [bankHolderName, setBankHolderName] = useState(currentUser.name || '');

  // Transfer Funds State
  const [transferAmount, setTransferAmount] = useState<number | ''>('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [lastTransferUtr, setLastTransferUtr] = useState<string | null>(null);

  // Deposit via Payment Gateway State
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number>(500);
  const [depositMethod, setDepositMethod] = useState<'upi' | 'card'>('upi');
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositTxnId, setDepositTxnId] = useState<string | null>(null);
  const [ledgerFilter, setLedgerFilter] = useState<'all' | 'earnings' | 'deposits' | 'payouts'>('all');

  // Completed Orders where current user is the provider/seller
  const myCompletedSales = orders.filter(
    (o) => (o.sellerId === currentUser.id || o.sellerId === currentUser.userId) && o.status === 'completed'
  );

  const inEscrowOrders = orders.filter(
    (o) => (o.sellerId === currentUser.id || o.sellerId === currentUser.userId) && o.status !== 'completed' && o.status !== 'cancelled'
  );

  // Buyer orders where user deposited into Escrow
  const myBuyerOrders = orders.filter(
    (o) => o.buyerId === currentUser.id || o.buyerId === currentUser.userId
  );

  // Direct wallet deposits and available spendable balance
  const directWalletBalance = currentUser.walletBalance || 0;
  const grossCompletedEarnings = myCompletedSales.reduce((sum, o) => sum + (o.amount || 0), 0);
  const totalCommissionCut = Math.round(grossCompletedEarnings * 0.08);
  const netEarned = grossCompletedEarnings - totalCommissionCut;
  const totalTransferred = currentUser.totalTransferred || 0;

  // Available balance ready for payout or spending:
  // Direct Wallet Balance + (Net Gig Earnings - Total Transferred)
  const availableBalance = directWalletBalance + Math.max(0, netEarned - totalTransferred);
  const inEscrowHold = inEscrowOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
  const hasVerifiedUpi = Boolean(currentUser.upiVerified && currentUser.upiId);

  // Handler: Deposit via Payment Gateway
  const handleDepositFunds = async () => {
    if (depositAmount <= 0) {
      showToast('Deposit amount must be greater than ₹0.');
      return;
    }

    setIsDepositing(true);
    try {
      const res = await fetch('/api/gateway/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          amount: depositAmount,
          paymentMethod: depositMethod,
        }),
      });
      const data = await res.json().catch(() => ({}));
      const txn = data.gatewayTxnId || `DEP-UPI-${Date.now().toString(36).toUpperCase()}`;
      setDepositTxnId(txn);
      const updated: UserProfile = {
        ...currentUser,
        walletBalance: (currentUser.walletBalance || 0) + depositAmount,
      };
      onUpdateUser(updated);
      showToast(`Payment Gateway: ₹${depositAmount} deposited into NeighborLy Funds!`);
      setTimeout(() => {
        setIsDepositModalOpen(false);
        setDepositTxnId(null);
      }, 1800);
    } catch (e) {
      showToast('Deposit failed. Please try again.');
    } finally {
      setIsDepositing(false);
    }
  };

  // Handler: Verify UPI ID
  const handleVerifyUpi = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError('');
    setVerificationResult(null);

    if (!inputUpi.trim()) {
      setVerificationError('Please enter a UPI ID (e.g. yourname@okhdfcbank, mobile@paytm).');
      return;
    }

    setIsVerifying(true);
    try {
      const res = await verifyUpiId(inputUpi.trim(), currentUser);
      if (res.isValid && res.verified) {
        setVerificationResult(res);
      } else {
        setVerificationError(res.error || 'Unable to verify UPI ID. Please check the handle.');
      }
    } catch (err: any) {
      setVerificationError(err?.message || 'Verification service temporarily unavailable.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Handler: Save Verified UPI to Dashboard
  const handleSaveVerifiedUpi = async () => {
    if (!verificationResult || !verificationResult.verified) return;

    const saved = await saveVerifiedUpiToProfile(currentUser.id, verificationResult);
    if (saved) {
      const updated: UserProfile = {
        ...currentUser,
        upiId: verificationResult.vpa,
        upiVerified: true,
        upiAccountName: verificationResult.accountHolderName,
        upiBankName: verificationResult.bankName,
        upiVerifiedAt: verificationResult.verifiedAt,
        upiReferenceId: verificationResult.referenceId,
      };
      onUpdateUser(updated);
      setIsEditingUpi(false);
      setVerificationResult(null);
      setInputUpi('');
      showToast(`UPI ID ${verificationResult.vpa} verified and linked!`);
    } else {
      showToast('Error saving verified UPI to cloud. Please try again.');
    }
  };

  // Handler: Reset / Change UPI
  const handleRemoveUpi = async () => {
    await removeLinkedUpiFromProfile(currentUser.id);
    const updated: UserProfile = {
      ...currentUser,
      upiId: '',
      upiVerified: false,
      upiAccountName: '',
      upiBankName: '',
      upiVerifiedAt: '',
    };
    onUpdateUser(updated);
    setIsEditingUpi(true);
    setVerificationResult(null);
    setInputUpi('');
    showToast('UPI unlinked. Verify a new UPI handle to receive withdrawals.');
  };

  // Handler: Transfer Funds (Withdrawal to verified UPI/Bank)
  const handleTransferFunds = async () => {
    if (!hasVerifiedUpi || !currentUser.upiId) {
      showToast('Please add and verify a UPI ID before transferring funds.');
      return;
    }

    const amountToTransfer = Number(transferAmount) || availableBalance;
    if (amountToTransfer <= 0) {
      showToast('Available balance is ₹0.');
      return;
    }

    if (amountToTransfer > availableBalance) {
      showToast(`Cannot transfer more than available balance of ₹${availableBalance}.`);
      return;
    }

    setIsTransferring(true);
    setLastTransferUtr(null);

    try {
      const res = await transferFundsToVerifiedUpi(
        currentUser.id,
        amountToTransfer,
        currentUser.upiId,
        currentUser.upiBankName || 'Verified Bank'
      );

      if (res.success && res.transaction) {
        const newTransferredTotal = totalTransferred + amountToTransfer;
        const newWalletBalance = Math.max(0, (currentUser.walletBalance || 0) - amountToTransfer);
        const updated: UserProfile = {
          ...currentUser,
          totalTransferred: newTransferredTotal,
          walletBalance: newWalletBalance,
        };
        onUpdateUser(updated);
        setLastTransferUtr(res.transaction.referenceId || `UTR${Date.now()}`);
        setTransferAmount('');
        showToast(`₹${amountToTransfer} transferred to verified UPI: ${currentUser.upiId}!`);
      } else {
        showToast(res.error || 'Transfer failed. Please try again.');
      }
    } catch (err: any) {
      showToast('Transfer failed. Please check network connection.');
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 w-full max-w-full overflow-hidden">
      
      {/* Clean Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl bg-white border border-zinc-200/90 shadow-soft-xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white flex items-center justify-center shadow-md shrink-0">
            <Wallet className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black font-heading text-zinc-950">
                NeighborLy Funds & Escrow Services
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                Active Wallet
              </span>
            </div>
            <p className="text-xs text-zinc-500">
              Campus peer funds, secure Escrow-protected holds, and instant withdrawals to your bank or UPI
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsDepositModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-xs font-black cursor-pointer shadow-soft transition-all flex items-center gap-1.5 self-start sm:self-center"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Funds</span>
        </button>
      </div>

      {/* Main Funds Wallet Content */}
      <div className="space-y-6">
          
          {/* 1. Overview Balance Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Available Spendable / Withdrawable Balance */}
            <div className="clay-card p-5 space-y-3 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
              <div className="flex items-center justify-between text-zinc-500">
                <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                  NeighborLy Funds (Available)
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  ₹
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-3xl font-black font-heading text-zinc-950 tabular-nums">
                    ₹{availableBalance}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsDepositModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black cursor-pointer shadow-soft transition-all flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Add Funds</span>
                  </button>
                </div>
                <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Spend or withdraw anytime</span>
                  </span>
                  {onNavigate && (
                    <button
                      type="button"
                      onClick={() => onNavigate('browse')}
                      className="text-indigo-600 font-bold hover:underline cursor-pointer"
                    >
                      Spend on Gigs →
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* In-Escrow Hold */}
            <div className="clay-card-soft p-5 space-y-2">
              <div className="flex items-center justify-between text-zinc-500">
                <span className="text-xs font-bold text-zinc-600 uppercase tracking-wider">In-Escrow (Held)</span>
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
              </div>
              <div className="space-y-0.5">
                <h3 className="text-3xl font-black font-heading text-zinc-950 tabular-nums">
                  ₹{inEscrowHold}
                </h3>
                <p className="text-[11px] text-amber-700 font-bold">
                  {inEscrowOrders.length} active gig{inEscrowOrders.length === 1 ? '' : 's'} in progress
                </p>
              </div>
            </div>

            {/* 8% Platform Commission Deducted */}
            <div className="clay-card-soft p-5 space-y-2">
              <div className="flex items-center justify-between text-zinc-500">
                <span className="text-xs font-bold text-zinc-600 uppercase tracking-wider">Escrow Fee (8%)</span>
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black">
                  8%
                </div>
              </div>
              <div className="space-y-0.5">
                <h3 className="text-3xl font-black font-heading text-indigo-900 tabular-nums">
                  ₹{totalCommissionCut}
                </h3>
                <p className="text-[11px] text-zinc-500 font-medium">
                  Fair 8% cut on delivered gigs (92% to student)
                </p>
              </div>
            </div>

            {/* Total Transferred to Bank / UPI */}
            <div className="clay-card-soft p-5 space-y-2">
              <div className="flex items-center justify-between text-zinc-500">
                <span className="text-xs font-bold text-zinc-600 uppercase tracking-wider">Total Withdrawn</span>
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              <div className="space-y-0.5">
                <h3 className="text-3xl font-black font-heading text-zinc-950 tabular-nums">
                  ₹{totalTransferred}
                </h3>
                <p className="text-[11px] text-zinc-500 font-medium">
                  Transferred directly to bank account
                </p>
              </div>
            </div>

          </div>

          {/* 2. Dual Panel: Verified Payout Destination (Left) & Withdraw Funds (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full max-w-full">
            
            {/* LEFT PANEL: Verified Payout Destination */}
            <div className="lg:col-span-7 min-w-0 clay-card p-6 sm:p-7 space-y-5">
              
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                    <Smartphone className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-base font-black font-heading text-zinc-950">
                      Verified Payout Method
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Mandatory NPCI UPI handle or Bank validation to receive payouts
                    </p>
                  </div>
                </div>

                {hasVerifiedUpi && !isEditingUpi && (
                  <button
                    type="button"
                    onClick={() => setIsEditingUpi(true)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer hover:underline"
                  >
                    Change UPI
                  </button>
                )}
              </div>

              {/* STATE A: Already has verified UPI */}
              {hasVerifiedUpi && !isEditingUpi ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-teal-50/50 to-white border border-emerald-200 space-y-3">
                    
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Verified with NPCI</span>
                      </span>
                      <span className="text-[11px] font-bold text-zinc-500">
                        {currentUser.upiBankName || 'Banking Gateway'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base sm:text-lg font-mono font-black text-zinc-950 tracking-tight">
                          {currentUser.upiId}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600 font-medium flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Account Holder: <strong>{currentUser.upiAccountName || currentUser.name}</strong></span>
                      </p>
                    </div>

                    {currentUser.upiVerifiedAt && (
                      <p className="text-[10px] text-zinc-400 font-mono">
                        Linked on: {new Date(currentUser.upiVerifiedAt).toLocaleDateString()} · Ref: {currentUser.upiReferenceId || 'NPCI-OK'}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
                    <span>Withdrawals credit into this bank account with 0% payout fee.</span>
                    <button
                      type="button"
                      onClick={handleRemoveUpi}
                      className="text-rose-600 font-bold hover:underline cursor-pointer"
                    >
                      Unlink
                    </button>
                  </div>
                </div>
              ) : (
                /* STATE B: No verified UPI or user is editing/adding new UPI */
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>NPCI Bank Verification Required</span>
                    </p>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      To prevent unauthorized withdrawals and guarantee student funds reach the rightful owner, any UPI added must be verified against NPCI banking handles before it can receive payouts.
                    </p>
                  </div>

                  {/* Form to Input and Verify UPI */}
                  <form onSubmit={handleVerifyUpi} className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-zinc-900 block mb-1">
                        Enter UPI ID / VPA
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={inputUpi}
                          onChange={(e) => {
                            setInputUpi(e.target.value);
                            setVerificationError('');
                            setVerificationResult(null);
                          }}
                          placeholder="e.g. yourname@okhdfcbank or 9876543210@paytm"
                          className="flex-1 px-4 py-2.5 clay-input-field text-xs sm:text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
                        />
                        <button
                          type="submit"
                          disabled={isVerifying || !inputUpi.trim()}
                          className="px-5 py-2.5 clay-button-primary text-xs font-black disabled:opacity-40 flex items-center gap-1.5 cursor-pointer shrink-0"
                        >
                          {isVerifying ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Verifying...</span>
                            </>
                          ) : (
                            <span>Verify UPI ID</span>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Popular sample handles for fast testing */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-zinc-500">
                      <span className="font-semibold">Supported Handles:</span>
                      {['@okhdfcbank', '@oksbi', '@okaxis', '@okicici', '@paytm', '@ybl'].map((h) => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => setInputUpi(`${(currentUser.email || 'student').split('@')[0]}${h}`)}
                          className="clay-pill px-2 py-0.5 text-zinc-700 hover:text-indigo-600 cursor-pointer"
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                  </form>

                  {/* Error Message */}
                  {verificationError && (
                    <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>{verificationError}</span>
                    </div>
                  )}

                  {/* Verification Success Preview Card */}
                  {verificationResult && verificationResult.verified && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3 animate-in zoom-in-95 duration-150">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>NPCI Verification Successful!</span>
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 font-mono">
                          Active VPA
                        </span>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-emerald-100 text-xs space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-zinc-500">UPI ID:</span>
                          <span className="font-mono font-bold text-zinc-950">{verificationResult.vpa}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Bank Name:</span>
                          <span className="font-bold text-zinc-950">{verificationResult.bankName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Verified Name:</span>
                          <span className="font-bold text-zinc-950">{verificationResult.accountHolderName}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleSaveVerifiedUpi}
                        className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Link Verified UPI for Payouts</span>
                      </button>
                    </div>
                  )}

                  {isEditingUpi && hasVerifiedUpi && (
                    <button
                      type="button"
                      onClick={() => setIsEditingUpi(false)}
                      className="text-xs text-zinc-500 hover:underline cursor-pointer"
                    >
                      Cancel and keep current verified UPI
                    </button>
                  )}
                </div>
              )}

            </div>

            {/* RIGHT PANEL: Withdraw / Transfer Funds to Verified UPI */}
            <div className="lg:col-span-5 min-w-0 clay-card p-6 sm:p-7 space-y-5">
              
              <div className="pb-3 border-b border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                    <Wallet className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-base font-black font-heading text-zinc-950">
                      Withdraw Funds
                    </h3>
                    <p className="text-xs text-zinc-500">Direct payout to your linked bank account</p>
                  </div>
                </div>

                <span className="text-[11px] font-black font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-lg">
                  Avail: ₹{availableBalance}
                </span>
              </div>

              {/* Transfer Amount Input */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-zinc-800">Amount to Withdraw</label>
                  <button
                    type="button"
                    onClick={() => setTransferAmount(availableBalance)}
                    className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                  >
                    Withdraw All (Max ₹{availableBalance})
                  </button>
                </div>

                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-base font-black text-zinc-500">₹</span>
                  <input
                    type="number"
                    min="1"
                    max={availableBalance}
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder={`Available: ${availableBalance}`}
                    disabled={!hasVerifiedUpi || availableBalance <= 0}
                    className="w-full pl-8 pr-4 py-3 clay-input-field text-lg font-black text-zinc-950 placeholder:text-zinc-400 focus:outline-none disabled:opacity-50"
                  />
                </div>

                {/* Destination Preview */}
                <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200/80 text-xs space-y-1">
                  <div className="flex justify-between text-zinc-600">
                    <span>Destination:</span>
                    <span className="font-bold text-zinc-950 truncate max-w-[180px]">
                      {hasVerifiedUpi ? currentUser.upiId : 'No Verified UPI linked'}
                    </span>
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <span>Transfer Payout Fee:</span>
                    <span className="font-bold text-emerald-700">₹0 (Free Payout)</span>
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <span>Platform Commission:</span>
                    <span className="font-bold text-zinc-500">8% already reserved</span>
                  </div>
                </div>

                {/* Action Transfer Button */}
                <button
                  type="button"
                  disabled={
                    !hasVerifiedUpi || 
                    availableBalance <= 0 || 
                    isTransferring || 
                    (transferAmount !== '' && Number(transferAmount) <= 0) ||
                    (transferAmount !== '' && Number(transferAmount) > availableBalance)
                  }
                  onClick={handleTransferFunds}
                  className="w-full py-3.5 clay-button-primary text-xs sm:text-sm font-black disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  {isTransferring ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Transferring to Bank Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Withdraw ₹{transferAmount || availableBalance} to Bank</span>
                      <ArrowRight className="w-4 h-4 stroke-[3]" />
                    </>
                  )}
                </button>

                {!hasVerifiedUpi && (
                  <p className="text-[11px] text-amber-700 font-bold text-center">
                    ⚠️ Verify your UPI ID in the left panel to enable withdrawals.
                  </p>
                )}

                {lastTransferUtr && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs space-y-2 animate-in fade-in duration-200">
                    <p className="font-bold flex items-center gap-1.5 text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Withdrawal Transfer Authorized!</span>
                    </p>
                    <p className="font-mono text-[11px] text-emerald-700">
                      Bank Settlement Ref (UTR): {lastTransferUtr}
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      Zero gateway fee deducted. 100% of requested funds disbursed to your verified UPI ID.
                    </p>
                    {hasVerifiedUpi && (
                      <div className="pt-1 border-t border-emerald-200/60">
                        <a
                          href={`upi://pay?pa=${encodeURIComponent(currentUser.upiId || '')}&pn=${encodeURIComponent(currentUser.upiAccountName || currentUser.name)}&am=${transferAmount || availableBalance}&cu=INR&tn=NeighborLyPayout`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold shadow-sm transition-all"
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>1-Tap UPI App Settlement Link</span>
                        </a>
                      </div>
                    )}
                  </div>
                )}

              </div>

            </div>

          </div>

          {/* 3. Spend Funds Shortcut Banner */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-purple-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 text-emerald-400 flex items-center justify-center font-bold text-lg shrink-0">
                ⚡
              </div>
              <div>
                <h4 className="text-sm font-black font-heading text-white">
                  Spend NeighborLy Funds on Campus Tasks & Services
                </h4>
                <p className="text-xs text-indigo-200 leading-relaxed">
                  Use your wallet balance to book coding help, dorm moving, graphic design, and class notes with <strong>1-click zero-fee checkout</strong>.
                </p>
              </div>
            </div>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('browse')}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-zinc-950 font-black text-xs rounded-xl shadow-lg cursor-pointer transition-all shrink-0"
              >
                Browse Campus Services →
              </button>
            )}
          </div>

          {/* 4. Financial Ledger & Audited Passbook */}
          <div className="clay-card p-6 sm:p-7 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
              <div>
                <h3 className="text-base font-black font-heading text-zinc-950 flex items-center gap-2">
                  <span>Financial Ledger & Audited Passbook</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                    Realtime Sync
                  </span>
                </h3>
                <p className="text-xs text-zinc-500">
                  Itemized records of deposits, gig payouts, 8% platform fee deductions, and bank payouts
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-xl text-xs font-bold">
                  {(['all', 'earnings', 'deposits', 'payouts'] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setLedgerFilter(f)}
                      className={`px-2.5 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                        ledgerFilter === f
                          ? 'bg-white text-zinc-950 shadow-2xs'
                          : 'text-zinc-500 hover:text-zinc-800'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setIsDepositModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black cursor-pointer shadow-soft transition-all"
                >
                  + Add Funds
                </button>
              </div>
            </div>

            {/* Transactions List */}
            {myCompletedSales.length === 0 && myBuyerOrders.length === 0 && totalTransferred === 0 && directWalletBalance === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                <Wallet className="w-8 h-8 text-zinc-300 mx-auto" />
                <p className="text-xs font-bold text-zinc-700">No Transactions Yet</p>
                <p className="text-[11px] text-zinc-400 max-w-sm mx-auto">
                  Client payments accepted through the gateway, completed gigs, 8% platform fee deductions, and direct transfers to your verified UPI will be recorded here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                
                {/* 1. Direct Wallet Balance entry if deposited */}
                {(ledgerFilter === 'all' || ledgerFilter === 'deposits') && directWalletBalance > 0 && (
                  <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                        +₹
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-black text-indigo-950">Direct Wallet Deposit</h4>
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-200 text-indigo-900">
                            Payment Gateway
                          </span>
                        </div>
                        <p className="text-[11px] text-indigo-700 font-mono">
                          NeighborLy Funds Stored Balance · Ready to spend or withdraw
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-zinc-500 block">Credited Balance</span>
                      <span className="text-base font-black text-indigo-950 font-mono">
                        +₹{directWalletBalance}
                      </span>
                    </div>
                  </div>
                )}

                {/* 2. Buyer escrow deposits */}
                {(ledgerFilter === 'all' || ledgerFilter === 'deposits') && myBuyerOrders.map((ord) => (
                  <div
                    key={`buy_${ord.id}`}
                    className="p-4 rounded-2xl bg-zinc-50/80 border border-zinc-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white transition-all shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-sm shrink-0">
                        <Lock className="w-4 h-4 text-indigo-700" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-black text-zinc-950 truncate">{ord.serviceTitle}</h4>
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                            {ord.status === 'completed' ? 'Completed & Released' : 'Held in Escrow'}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 font-mono">
                          Order #{ord.id} · Provider: {ord.sellerName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-200">
                      <div>
                        <span className="text-xs text-zinc-500 block">Protection</span>
                        <span className="text-[11px] text-emerald-700 font-bold block">
                          Escrow Protection (8% fee reserved)
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-zinc-500 font-medium block">Deposit Amount</span>
                        <span className="text-base font-black text-zinc-950 font-mono block">
                          ₹{ord.amount}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* 3. Completed seller orders (Earnings) */}
                {(ledgerFilter === 'all' || ledgerFilter === 'earnings') && myCompletedSales.map((ord) => {
                  const gross = ord.amount || 0;
                  const fee = Math.round(gross * 0.08);
                  const net = gross - fee;
                  return (
                    <div
                      key={ord.id}
                      className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-emerald-50/70 transition-all shadow-2xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
                          +₹
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-black text-zinc-950 truncate">{ord.serviceTitle}</h4>
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              Gig Completed
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-500 font-mono">
                            Order #{ord.id} · Client: {ord.buyerName}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-200">
                        <div>
                          <span className="text-xs text-zinc-500 block">Gross / 8% Fee</span>
                          <span className="text-[11px] font-mono text-zinc-600 block">
                            ₹{gross} - ₹{fee}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-emerald-700 font-bold block">Net Credited</span>
                          <span className="text-base font-black text-emerald-700 font-mono block">
                            +₹{net}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* 4. Bank Transfers / Payouts */}
                {(ledgerFilter === 'all' || ledgerFilter === 'payouts') && totalTransferred > 0 && (
                  <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm shrink-0">
                        <ArrowUpRight className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-black text-blue-950">Payout Transfer to Bank Account</h4>
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-200 text-blue-900">
                            IMPS/UPI Payout
                          </span>
                        </div>
                        <p className="text-[11px] text-blue-700 font-mono">
                          Destination: {currentUser.upiId || 'Verified UPI'} · {currentUser.upiBankName || 'Bank'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-blue-600 font-medium block">Total Transferred</span>
                      <span className="text-base font-black text-blue-950 font-mono">
                        ₹{totalTransferred}
                      </span>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

        </div>

      {/* ======================================================== */}
      {/* 4. MODAL: DEPOSIT FUNDS VIA PAYMENT GATEWAY             */}
      {/* ======================================================== */}
      {isDepositModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div 
            className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl border border-indigo-100 p-6 space-y-5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Wallet className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-sm font-black font-heading text-zinc-950">Add Funds to NeighborLy Wallet</h3>
                  <p className="text-[11px] text-zinc-500">100% Gateway-Free • Direct UPI & Stored Balance</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDepositModalOpen(false)}
                className="w-8 h-8 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Quick Amount Presets */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700 block">Select Preset Amount</label>
              <div className="grid grid-cols-4 gap-2">
                {[200, 500, 1000, 2000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDepositAmount(amt)}
                    className={`py-2 text-xs font-black rounded-xl border transition-all cursor-pointer ${
                      depositAmount === amt
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-zinc-50 text-zinc-800 border-zinc-200 hover:bg-white'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">Custom Amount (₹)</label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-sm font-black text-zinc-500">₹</span>
                <input
                  type="number"
                  min="50"
                  max="100000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-2.5 clay-input-field text-base font-black text-zinc-950 focus:outline-none"
                />
              </div>
            </div>

            {/* Deposit Method Selector: Direct UPI vs Instant Credit */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700 block">Deposit Method</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDepositMethod('upi')}
                  className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                    depositMethod === 'upi'
                      ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20 font-bold'
                      : 'border-zinc-200 bg-white hover:bg-zinc-50'
                  }`}
                >
                  <span className="text-xs font-black text-zinc-950 block flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Direct UPI / QR</span>
                  </span>
                  <span className="text-[10px] text-zinc-500 block mt-0.5">GPay, PhonePe, Paytm, QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDepositMethod('card')}
                  className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                    depositMethod === 'card'
                      ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20 font-bold'
                      : 'border-zinc-200 bg-white hover:bg-zinc-50'
                  }`}
                >
                  <span className="text-xs font-black text-zinc-950 block flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Instant Credit</span>
                  </span>
                  <span className="text-[10px] text-zinc-500 block mt-0.5">1-Click Immediate Top-up</span>
                </button>
              </div>
            </div>

            {/* Direct UPI Intent & QR details */}
            {depositMethod === 'upi' && (
              <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-600 font-medium">Platform Receiver UPI:</span>
                  <span className="font-mono font-bold text-zinc-950">9417918330@upi</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-24 h-24 bg-white p-1.5 rounded-xl border border-zinc-200 shrink-0 flex items-center justify-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`upi://pay?pa=9417918330@upi&pn=NeighborLyFunds&am=${depositAmount}&cu=INR&tn=Topup-Wallet`)}`}
                      alt="UPI QR"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <p className="text-[11px] text-zinc-600 font-medium leading-snug">
                      Scan QR or tap to pay directly to <strong>9417918330@upi</strong> on your mobile UPI app:
                    </p>
                    <a
                      href={`upi://pay?pa=9417918330@upi&pn=NeighborLyFunds&am=${depositAmount}&cu=INR&tn=Topup-Wallet`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black shadow-sm cursor-pointer"
                    >
                      <Smartphone className="w-3 h-3" />
                      <span>Open in UPI App</span>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {depositTxnId && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs space-y-0.5 animate-in fade-in duration-150">
                <p className="font-bold flex items-center gap-1.5 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Wallet Deposit Confirmed!</span>
                </p>
                <p className="font-mono text-[11px] text-emerald-700">Txn Ref: {depositTxnId}</p>
                <p className="text-[10px] text-zinc-500">Credited directly to your NeighborLy Funds balance.</p>
              </div>
            )}

            <button
              type="button"
              disabled={isDepositing || depositAmount <= 0}
              onClick={handleDepositFunds}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl text-xs sm:text-sm font-black shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isDepositing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Crediting Stored Funds...</span>
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 stroke-[2.5]" />
                  <span>Add ₹{depositAmount} to NeighborLy Funds</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Safety Guarantee Banner */}
      <div className="clay-card-soft p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs sm:text-sm font-bold text-zinc-950">
              Bank-Grade Escrow Services & 8% Platform Commission Guarantee
            </h4>
            <p className="text-xs text-zinc-600 max-w-2xl leading-relaxed">
              When a buyer hires you, 100% of the agreed funds are deposited into a secure Escrow Vault. Once you complete the task and the buyer signs off, our Escrow Service deducts a fair <strong>8% platform commission</strong> to support buyer protection, gateway insurance, dispute resolution, and automated UPI payouts. The remaining <strong>92% is instantly added to your Available Payout Balance</strong> and transferred to your verified bank or UPI ID with zero withdrawal fees.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
