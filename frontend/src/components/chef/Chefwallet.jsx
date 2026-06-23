import React, { useState, useEffect } from "react";
import api from "../../services/api";
import {
  Wallet, TrendingUp, ArrowDownCircle, Clock, CheckCircle,
  XCircle, AlertCircle, IndianRupee, Send, ChevronDown, ChevronUp,
  Loader2, RefreshCw,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) =>
  Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const fmtTime = (d) =>
  new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

const TX_STYLES = {
  CREDIT:     { bg: "bg-emerald-50",  text: "text-emerald-700", border: "border-emerald-100", icon: "↑", label: "Credited"   },
  DEBIT:      { bg: "bg-rose-50",     text: "text-rose-700",    border: "border-rose-100",    icon: "↓", label: "Debited"    },
  WITHDRAWAL: { bg: "bg-amber-50",    text: "text-amber-700",   border: "border-amber-100",   icon: "⇪", label: "Withdrawal" },
  REFUND:     { bg: "bg-blue-50",     text: "text-blue-700",    border: "border-blue-100",    icon: "↩", label: "Refund"     },
};

const WD_STATUS = {
  PENDING:  { bg: "bg-amber-100",  text: "text-amber-800",  label: "Processing"       },
  REJECTED: { bg: "bg-rose-100",   text: "text-rose-800",   label: "Failed"           },
  PAID:     { bg: "bg-emerald-100",text: "text-emerald-800",label: "Transferred ✓"    },
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function ChefWallet() {
  const [wallet, setWallet]         = useState(null);
  const [transactions, setTx]       = useState([]);
  const [withdrawals, setWd]        = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [tab, setTab]               = useState("transactions");
  const [showForm, setShowForm]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [formError, setFormError]   = useState("");

  // ── Withdrawal lock countdown ──
  const [canWithdraw, setCanWithdraw]       = useState(false);
  const [withdrawableAt, setWithdrawableAt] = useState(null);
  const [countdown, setCountdown]           = useState("");

  const [form, setForm] = useState({
    amount: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    accountHolderName: "",
  });

  const fetchWallet = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/wallet/me");
      if (res.data.success) {
        setWallet(res.data.wallet);
        setTx(res.data.transactions || []);
        setWd(res.data.withdrawalRequests || []);
        setCanWithdraw(res.data.wallet.canWithdraw);
        setWithdrawableAt(res.data.wallet.withdrawableAt || null);
      }
    } catch (err) {
      setError("Could not load wallet. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWallet(); }, []);

  // ── Live countdown ticker ──────────────────────────────────────────────────
  useEffect(() => {
    if (!withdrawableAt) return;

    const tick = () => {
      const diff = new Date(withdrawableAt) - new Date();
      if (diff <= 0) {
        setCanWithdraw(true);
        setCountdown("");
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setCountdown(`${mins}m ${secs < 10 ? "0" : ""}${secs}s`);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [withdrawableAt]);

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setFormError("");
    setSuccessMsg("");

    const amount = Number(form.amount);
    if (!amount || amount < 100) {
      return setFormError("Minimum withdrawal amount is ₹100");
    }
    if (amount > (wallet?.availableForWithdrawal || 0)) {
      return setFormError(`Amount exceeds available balance of ₹${fmt(wallet?.availableForWithdrawal)}`);
    }
    if (!form.bankName || !form.accountNumber || !form.ifscCode || !form.accountHolderName) {
      return setFormError("Please fill in all bank details");
    }

    try {
      setSubmitting(true);
      const res = await api.post("/wallet/withdraw", { ...form, amount });
      if (res.data.success) {
        setSuccessMsg(res.data.message);
        setShowForm(false);
        setForm({ amount: "", bankName: "", accountNumber: "", ifscCode: "", accountHolderName: "" });
        fetchWallet(); // refresh
      }
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to submit withdrawal request");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
        <p className="text-sm font-semibold">Loading your wallet...</p>
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-rose-500">
        <AlertCircle className="w-8 h-8" />
        <p className="text-sm font-semibold">{error}</p>
        <button
          onClick={fetchWallet}
          className="mt-1 text-xs font-bold text-brand-green underline flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" /> Try again
        </button>
      </div>
    );
  }

  const available = wallet?.availableForWithdrawal ?? 0;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900">My Wallet</h2>
          <p className="text-sm text-slate-500 mt-1">
            Earnings are credited after each completed order (10% platform fee deducted). Withdrawal unlocks 30 minutes after payment is received.
          </p>
        </div>
        <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
          <Wallet className="w-6 h-6" />
        </div>
      </div>

      {/* ── Success message ── */}
      {successMsg && (
        <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
          <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-semibold text-emerald-700">{successMsg}</p>
        </div>
      )}

      {/* ── Stats cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<IndianRupee className="w-5 h-5" />}
          label="Available Balance"
          value={`₹${fmt(available)}`}
          sub={wallet?.pendingWithdrawalTotal > 0 ? `₹${fmt(wallet.pendingWithdrawalTotal)} pending` : "Ready to withdraw"}
          color="green"
          big
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="This Month"
          value={`₹${fmt(wallet?.thisMonthEarnings)}`}
          sub="Net earnings"
          color="blue"
        />
        <StatCard
          icon={<Wallet className="w-5 h-5" />}
          label="Total Earned"
          value={`₹${fmt(wallet?.totalEarningsNet)}`}
          sub={`Gross: ₹${fmt(wallet?.totalEarningsGross)}`}
          color="purple"
        />
        <StatCard
          icon={<ArrowDownCircle className="w-5 h-5" />}
          label="Total Withdrawn"
          value={`₹${fmt(wallet?.totalWithdrawn)}`}
          sub="Paid to bank"
          color="amber"
        />
      </div>

      {/* ── Platform fee info ── */}
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-slate-500 leading-relaxed">
          <span className="font-bold text-slate-700">Platform fee: {wallet?.platformFeePercent ?? 10}%</span> is deducted from each completed order.
          For example, on a ₹200 order you receive ₹{200 - (200 * (wallet?.platformFeePercent ?? 10)) / 100} in your wallet.
          Withdrawals are auto-processed and credited to your bank within 30 minutes.
        </p>
      </div>

      {/* ── Withdrawal section ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900">Request Withdrawal</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Available: <span className="font-bold text-brand-green">₹{fmt(available)}</span>
            </p>
          </div>

          {/* ── Locked: show countdown ── */}
          {!canWithdraw && withdrawableAt && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
              <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <div className="text-left">
                <p className="text-xs font-bold text-amber-700">Available in</p>
                <p className="text-sm font-extrabold text-amber-800 tabular-nums">{countdown}</p>
              </div>
            </div>
          )}

          {/* ── No earnings yet ── */}
          {!canWithdraw && !withdrawableAt && (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
              <AlertCircle className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <p className="text-xs font-semibold text-slate-500">No earnings yet</p>
            </div>
          )}

          {/* ── Unlocked: show withdraw button ── */}
          {canWithdraw && (
            <button
              onClick={() => { setShowForm(!showForm); setFormError(""); setSuccessMsg(""); }}
              disabled={available < 100}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                available >= 100
                  ? "bg-brand-green text-white hover:bg-green-900 shadow-md shadow-green-500/20"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
            >
              <Send className="w-4 h-4" />
              Withdraw
              {showForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* ── Settlement notice while locked ── */}
        {!canWithdraw && withdrawableAt && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl p-3 mb-2">
            <Clock className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 leading-relaxed font-medium">
              Your payment is in the <span className="font-bold">30-minute settlement period</span>. 
              The withdrawal option will unlock automatically once the timer ends.
            </p>
          </div>
        )}

        {/* ── Withdrawal form ── */}
        {showForm && (
          <form onSubmit={handleWithdraw} className="border-t border-slate-100 pt-5 space-y-4">
            {formError && (
              <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 rounded-xl p-3">
                <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <p className="text-xs font-semibold text-rose-600">{formError}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Amount */}
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-600 block mb-1.5">
                  Withdrawal Amount (₹) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    min="100"
                    max={available}
                    value={form.amount}
                    onChange={(e) => setField("amount", e.target.value)}
                    placeholder="Enter amount"
                    className="w-full pl-7 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/10"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Min ₹100 · Max ₹{fmt(available)}</p>
              </div>

              {/* Account Holder */}
              <FormField
                label="Account Holder Name"
                value={form.accountHolderName}
                onChange={(v) => setField("accountHolderName", v)}
                placeholder="As per bank records"
              />

              {/* Bank Name */}
              <FormField
                label="Bank Name"
                value={form.bankName}
                onChange={(v) => setField("bankName", v)}
                placeholder="e.g. State Bank of India"
              />

              {/* Account Number */}
              <FormField
                label="Account Number"
                value={form.accountNumber}
                onChange={(v) => setField("accountNumber", v)}
                placeholder="Enter account number"
                type="text"
              />

              {/* IFSC */}
              <FormField
                label="IFSC Code"
                value={form.ifscCode}
                onChange={(v) => setField("ifscCode", v.toUpperCase())}
                placeholder="e.g. SBIN0001234"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:border-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 bg-brand-green text-white rounded-xl text-sm font-bold hover:bg-green-900 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                ) : (
                  <><Send className="w-4 h-4" /> Submit Request</>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ── Transaction / Withdrawal tabs ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-slate-100">
          {[
            { key: "transactions", label: "Transaction History" },
            { key: "withdrawals",  label: "Withdrawal Requests" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-3.5 text-sm font-bold transition-colors ${
                tab === t.key
                  ? "text-brand-green border-b-2 border-brand-green bg-green-50/50"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Transactions list ── */}
        {tab === "transactions" && (
          <div className="divide-y divide-slate-50">
            {transactions.length === 0 ? (
              <Empty icon="🧾" title="No Transactions Yet" sub="Completed orders will appear here." />
            ) : (
              transactions.map((tx, i) => {
                const s = TX_STYLES[tx.type] || TX_STYLES.CREDIT;
                return (
                  <div key={tx._id || i} className="flex items-start gap-4 p-4 hover:bg-slate-50/50 transition-colors">
                    {/* Icon */}
                    <div className={`w-9 h-9 rounded-full ${s.bg} ${s.text} flex items-center justify-center text-base font-black flex-shrink-0 border ${s.border}`}>
                      {s.icon}
                    </div>

                    {/* Description */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 leading-snug">
                        {tx.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>
                          {s.label}
                        </span>
                        {tx.platformFee > 0 && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            Fee: ₹{fmt(tx.platformFee)}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400">
                          {fmtDate(tx.createdAt)} · {fmtTime(tx.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="text-right flex-shrink-0">
                      <p className={`font-bold text-sm ${tx.type === "CREDIT" ? "text-emerald-600" : "text-rose-600"}`}>
                        {tx.type === "CREDIT" ? "+" : "-"}₹{fmt(tx.amount)}
                      </p>
                      {tx.status === "PENDING" && (
                        <span className="text-[10px] text-amber-600 font-bold">Pending</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── Withdrawals list ── */}
        {tab === "withdrawals" && (
          <div className="divide-y divide-slate-50">
            {withdrawals.length === 0 ? (
              <Empty icon="🏦" title="No Withdrawal Requests" sub="Your withdrawal requests will appear here." />
            ) : (
              withdrawals.map((wd, i) => {
                const s = WD_STATUS[wd.status] || WD_STATUS.PENDING;
                return (
                  <div key={wd._id || i} className="p-4 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-slate-900 text-sm">₹{fmt(wd.amount)}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>
                            {s.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {wd.bankName} · A/C ending {wd.accountNumber.slice(-4)} · IFSC: {wd.ifscCode}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Requested: {fmtDate(wd.createdAt)}
                          {wd.resolvedAt && ` · Transferred: ${fmtDate(wd.resolvedAt)}`}
                        </p>
                        {wd.status === "PAID" && (
                          <p className="text-xs text-emerald-600 mt-1.5 bg-emerald-50 rounded-lg px-3 py-1.5 border border-emerald-100 font-semibold">
                            ✅ Funds transferred to your bank account within 30 minutes.
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        {wd.status === "PENDING"  && <Clock className="w-4 h-4 text-amber-500" />}
                        {wd.status === "PAID"     && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                        {wd.status === "REJECTED" && <XCircle className="w-4 h-4 text-rose-500" />}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color, big }) {
  const colors = {
    green:  "bg-emerald-50 text-emerald-600",
    blue:   "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    amber:  "bg-amber-50 text-amber-600",
  };
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-4 ${big ? "col-span-2 lg:col-span-1" : ""}`}>
      <div className={`w-9 h-9 rounded-xl ${colors[color]} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{label}</p>
      <p className={`font-extrabold text-slate-900 mt-1 ${big ? "text-2xl" : "text-lg"}`}>{value}</p>
      <p className="text-[11px] text-slate-400 mt-0.5 font-medium">{sub}</p>
    </div>
  );
}

function FormField({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label className="text-xs font-bold text-slate-600 block mb-1.5">
        {label} <span className="text-rose-500">*</span>
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/10 bg-white"
      />
    </div>
  );
}

function Empty({ icon, title, sub }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center px-4">
      <span className="text-4xl mb-3">{icon}</span>
      <p className="font-bold text-slate-700">{title}</p>
      <p className="text-sm text-slate-400 mt-1">{sub}</p>
    </div>
  );
}