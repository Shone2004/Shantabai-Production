import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext.jsx';

export default function CustomerAuthModule() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [currentPath, setCurrentPath] = useState('/login'); 
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    city: '',
    locality: '',
    pincode: ''
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const triggerToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: '', message: '' }), 4000);
  };

  const validateForm = () => {
    let localErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (currentPath === '/signup') {
      if (!formData.fullName.trim()) localErrors.fullName = "Full name is required";
      
      if (!formData.phoneNumber) {
        localErrors.phoneNumber = "Phone number is required";
      } else if (!phoneRegex.test(formData.phoneNumber)) {
        localErrors.phoneNumber = "Enter a valid 10-digit phone number";
      }

      if (!formData.city.trim()) localErrors.city = "City is required";
      if (!formData.locality.trim()) localErrors.locality = "Area/Locality is required";
      
      if (!formData.pincode) {
        localErrors.pincode = "Pincode is required";
      } else if (formData.pincode.length < 6) {
        localErrors.pincode = "Enter a valid pincode";
      }

      if (formData.password !== formData.confirmPassword) {
        localErrors.confirmPassword = "Passwords do not match";
      }
    }

    if (!formData.email) {
      localErrors.email = "Email address is required";
    } else if (!emailRegex.test(formData.email)) {
      localErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      localErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      localErrors.password = "Password must be at least 6 characters";
    }

    setErrors(localErrors);
    return Object.keys(localErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      triggerToast('error', 'Please correct the validation errors below.');
      return;
    }

    setIsLoading(true);

    try {
      if (currentPath === '/signup') {
        // --- LIVE REGISTRATION: POST /api/auth/register ---
        const response = await api.post('/auth/register', {
          name: formData.fullName,
          email: formData.email,
          phone: formData.phoneNumber,
          password: formData.password,
          role: 'CUSTOMER',
          city: formData.city,
          area: formData.locality,
          pincode: formData.pincode,
        });

        if (response.data.success) {
          triggerToast('success', 'Account created successfully! Welcome to Shanta Bai.');
          setFormData({ fullName: '', email: '', phoneNumber: '', password: '', confirmPassword: '', city: '', locality: '', pincode: '' });
          setCurrentPath('/login');
        }
      } else {
        // --- LIVE LOGIN: POST /api/auth/login ---
        const response = await api.post('/auth/login', {
          email: formData.email,
          password: formData.password,
        });

        if (response.data.success) {
          // Persist token and update AuthContext
          login(response.data.user, response.data.token);
          triggerToast('success', 'Welcome back! Login successful.');

          // Role-based redirect
          const { role } = response.data.user;
          if (role === 'PROVIDER') {
            navigate('/chef/dashboard');
          } else if (role === 'ADMIN') {
            navigate('/admin/dashboard');
          } else {
            navigate('/');
          }
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
      triggerToast('error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateTo = (path) => {
    setErrors({});
    setCurrentPath(path);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-center items-center p-4 sm:p-6 font-sans antialiased relative selection:bg-brand-green selection:text-white">
      
      {/* --- TOAST NOTIFICATIONS HUB --- */}
      {toast.show && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl transition-all duration-300 border animate-slideIn ${
          toast.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
            : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          <span className="text-xl">{toast.type === 'success' ? '✨' : '🛑'}</span>
          <p className="text-xs font-bold uppercase tracking-wider">{toast.message}</p>
        </div>
      )}

      {/* --- MAIN AUTH CARD INTERFACE --- */}
      <div className="w-full max-w-xl bg-white border border-slate-200/60 rounded-[2.5rem] p-6 sm:p-10 shadow-xl shadow-brand-green/[0.02]">
        
        {/* Brand Banner Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Shanta <span className="text-brand-green">Bai</span>
          </h1>
          <p className="text-slate-400 text-xs font-medium tracking-wide mt-1 uppercase">
            {currentPath === '/login' ? 'Customer Portal Access' : 'Create Customer Account'}
          </p>
        </div>

        {/* Content Segment Switcher Form Formations */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* --- SIGNUP EXCLUSIVE LAYER FIELDS --- */}
          {currentPath === '/signup' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</label>
                <input 
                  type="text" 
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your first and last name"
                  className={`w-full bg-slate-50 border ${errors.fullName ? 'border-rose-400 focus:ring-rose-500/10' : 'border-slate-200 focus:border-brand-green'} focus:bg-white focus:ring-4 focus:ring-brand-green/10 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all`}
                />
                {errors.fullName && <span className="text-xs font-bold text-rose-500 px-1 animate-fadeIn">⚠️ {errors.fullName}</span>}
              </div>

              {/* Phone Number Input Layout */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Phone Number</label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-sm font-bold text-slate-400 border-r pr-2 border-slate-200">+91</span>
                  <input 
                    type="tel" 
                    name="phoneNumber"
                    maxLength="10"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="98765 43210"
                    className={`w-full bg-slate-50 border pl-16 pr-4 py-3 ${errors.phoneNumber ? 'border-rose-400 focus:ring-rose-500/10' : 'border-slate-200 focus:border-brand-green'} focus:bg-white focus:ring-4 focus:ring-brand-green/10 rounded-xl text-sm font-medium outline-none transition-all`}
                  />
                </div>
                {errors.phoneNumber && <span className="text-xs font-bold text-rose-500 px-1">⚠️ {errors.phoneNumber}</span>}
              </div>
            </div>
          )}

          {/* --- COMMON FIELDS: EMAIL SETUP --- */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</label>
            <input 
              type="text" 
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="name@domain.com"
              className={`w-full bg-slate-50 border ${errors.email ? 'border-rose-400 focus:ring-rose-500/10' : 'border-slate-200 focus:border-brand-green'} focus:bg-white focus:ring-4 focus:ring-brand-green/10 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all`}
            />
            {errors.email && <span className="text-xs font-bold text-rose-500 px-1">⚠️ {errors.email}</span>}
          </div>

          {/* --- COMMON FIELDS: PASSWORD LAYOUT WITH INTERACTIVE TOGGLE --- */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Password</label>
            <div className="relative flex items-center">
              <input 
                type={showPassword ? "text" : "password"} 
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className={`w-full bg-slate-50 border pr-12 ${errors.password ? 'border-rose-400 focus:ring-rose-500/10' : 'border-slate-200 focus:border-brand-green'} focus:bg-white focus:ring-4 focus:ring-brand-green/10 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all`}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-xs font-black text-brand-green hover:opacity-80 select-none uppercase tracking-widest"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && <span className="text-xs font-bold text-rose-500 px-1">⚠️ {errors.password}</span>}
          </div>

          {/* --- SIGNUP EXCLUSIVE COMPACT INFRASTRUCTURE GRID --- */}
          {currentPath === '/signup' && (
            <div className="space-y-5 animate-fadeIn">
              
              {/* Confirm Password Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Confirm Password</label>
                <div className="relative flex items-center">
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className={`w-full bg-slate-50 border pr-12 ${errors.confirmPassword ? 'border-rose-400 focus:ring-rose-500/10' : 'border-slate-200 focus:border-brand-green'} focus:bg-white focus:ring-4 focus:ring-brand-green/10 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all`}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 text-xs font-black text-brand-green hover:opacity-80 select-none uppercase tracking-widest"
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.confirmPassword && <span className="text-xs font-bold text-rose-500 px-1">⚠️ {errors.confirmPassword}</span>}
              </div>

              {/* Location Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* City Selection */}
                <div className="flex flex-col gap-1.5 sm:col-span-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">City</label>
                  <input 
                    type="text" 
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Mumbai"
                    className={`w-full bg-slate-50 border ${errors.city ? 'border-rose-400' : 'border-slate-200 focus:border-brand-green'} rounded-xl px-4 py-3 text-sm font-medium outline-none`}
                  />
                  {errors.city && <span className="text-[10px] font-bold text-rose-500">⚠️ Required</span>}
                </div>

                {/* Area / Locality */}
                <div className="flex flex-col gap-1.5 sm:col-span-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Area / Locality</label>
                  <input 
                    type="text" 
                    name="locality"
                    value={formData.locality}
                    onChange={handleInputChange}
                    placeholder="Vashi"
                    className={`w-full bg-slate-50 border ${errors.locality ? 'border-rose-400' : 'border-slate-200 focus:border-brand-green'} rounded-xl px-4 py-3 text-sm font-medium outline-none`}
                  />
                  {errors.locality && <span className="text-[10px] font-bold text-rose-500">⚠️ Required</span>}
                </div>

                {/* Pincode Map */}
                <div className="flex flex-col gap-1.5 sm:col-span-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Pincode</label>
                  <input 
                    type="text" 
                    name="pincode"
                    maxLength="6"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="400703"
                    className={`w-full bg-slate-50 border ${errors.pincode ? 'border-rose-400' : 'border-slate-200 focus:border-brand-green'} rounded-xl px-4 py-3 text-sm font-medium outline-none`}
                  />
                  {errors.pincode && <span className="text-[10px] font-bold text-rose-500">⚠️ Invalid</span>}
                </div>

              </div>
            </div>
          )}

          {/* --- INTERACTIVE ACTION BUTTON WITH INTEGRATED LOADING ENGINE --- */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full relative py-3.5 rounded-xl bg-brand-green hover:opacity-90 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black text-xs uppercase tracking-widest shadow-md shadow-brand-green/10 transition-all active:scale-[0.99] flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Processing...</span>
                </div>
              ) : (
                <span>{currentPath === '/login' ? 'Sign In' : 'Complete Registration'}</span>
              )}
            </button>
          </div>

        </form>

        {/* --- ROUTER TRANSITION NAVIGATION FOOTER --- */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          {currentPath === '/login' ? (
            <p className="text-xs font-semibold text-slate-500">
              Don't have an account?{' '}
              <button 
                type="button"
                onClick={() => navigateTo('/signup')}
                className="text-brand-green hover:opacity-80 font-bold underline transition-colors cursor-pointer"
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p className="text-xs font-semibold text-slate-500">
              Already have an account?{' '}
              <button 
                type="button"
                onClick={() => navigateTo('/login')}
                className="text-brand-green hover:opacity-80 font-bold underline transition-colors cursor-pointer"
              >
                Login
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}