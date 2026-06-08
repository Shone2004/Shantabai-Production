import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { 
  Clock, 
  XCircle, 
  AlertOctagon, 
  LogOut, 
  RefreshCw, 
  ChefHat, 
  Mail, 
  Phone,
  ShieldCheck,
  FileCheck,
  Search
} from "lucide-react";

export default function VerificationStatus() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    // Reloading triggers the AuthProvider useEffect to fetch the latest '/auth/me' details.
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const status = user?.verificationStatus || "PENDING";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-rose-500/10 blur-[120px]" />
      
      <div className="w-full max-w-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 md:p-12 shadow-2xl relative z-10">
        
        {/* Header Branding */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-rose-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white leading-tight">
              Shantabai <span className="text-indigo-400">Chef</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Partner Portal</p>
          </div>
        </div>

        {/* ──────── 1. PENDING STATUS ──────── */}
        {status === "PENDING" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-2 relative">
                <Clock className="w-10 h-10 animate-pulse" />
                <span className="absolute top-0 right-0 w-4 h-4 bg-amber-500 rounded-full border-2 border-slate-950 animate-ping" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white">Under Review</h2>
              <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                Welcome, <span className="text-indigo-300 font-bold">{user?.name}</span>! Your kitchen profile is currently being audited by our verification team. This usually takes between 12-24 hours.
              </p>
            </div>

            {/* Stepper Progression */}
            <div className="bg-slate-950/40 border border-slate-800/40 rounded-2xl p-6">
              <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-4">Verification Steps</h3>
              <div className="space-y-6">
                
                {/* Step 1: Registered */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                      <FileCheck className="w-4 h-4" />
                    </div>
                    <div className="w-0.5 h-8 bg-indigo-500/30" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Profile Submitted</h4>
                    <p className="text-xs text-slate-400 mt-1">Your kitchen details and documents have been uploaded successfully.</p>
                  </div>
                </div>

                {/* Step 2: Under Audit */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                      <Search className="w-4 h-4" />
                    </div>
                    <div className="w-0.5 h-8 bg-slate-800" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-amber-400">FSSAI & Document Audit</h4>
                    <p className="text-xs text-slate-400 mt-1">Our compliance team is verifying your kitchen address and legal documents.</p>
                  </div>
                </div>

                {/* Step 3: Go Live */}
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-600">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-500">Go Live</h4>
                    <p className="text-xs text-slate-600 mt-1">Add your food items and begin accepting orders once approved.</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ──────── 2. REJECTED STATUS ──────── */}
        {status === "REJECTED" && (
          <div className="space-y-8 animate-fadeIn text-center">
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 mb-2">
                <XCircle className="w-10 h-10" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white">Application Rejected</h2>
              <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                We appreciate your interest in partner-registering with Shantabai. Unfortunately, your application did not meet our compliance requirements or verification standards.
              </p>
            </div>

            <div className="bg-rose-950/20 border border-rose-900/30 rounded-2xl p-6 text-left space-y-4">
              <h3 className="text-xs font-bold uppercase text-rose-400 tracking-wider">What can you do?</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                The most common reasons for rejection include blurry document uploads, incorrect location coordinates, or incomplete address details. 
              </p>
              <div className="flex flex-col gap-2 pt-2 text-xs font-semibold text-slate-400">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-indigo-400" />
                  <span>support@shantabai.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-indigo-400" />
                  <span>+91 98765 43210</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ──────── 3. SUSPENDED STATUS ──────── */}
        {status === "SUSPENDED" && (
          <div className="space-y-8 animate-fadeIn text-center">
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 text-red-500 mb-2">
                <AlertOctagon className="w-10 h-10" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white">Account Suspended</h2>
              <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                Your chef partner account has been suspended by our administration. Your kitchen is temporarily offline and cannot accept orders.
              </p>
            </div>

            <div className="bg-red-950/20 border border-red-900/30 rounded-2xl p-6 text-left space-y-3">
              <h3 className="text-xs font-bold uppercase text-red-400 tracking-wider">Why is my account suspended?</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Suspensions occur due to repeated negative customer reviews, violations of food safety regulations, or failure to comply with system terms of service.
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                If you believe this is a mistake or wish to appeal this decision, please reach out to the support line immediately.
              </p>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 pt-8 border-t border-slate-800/80">
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white text-xs font-bold tracking-wide transition-all shadow-lg shadow-indigo-600/15 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            <span>{refreshing ? "Checking..." : "Refresh Status"}</span>
          </button>
          
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-300 hover:text-white text-xs font-bold tracking-wide transition-all border border-slate-700/60 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>

        </div>

      </div>
    </div>
  );
}
