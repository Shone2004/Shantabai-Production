import React, { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';

// Uses your existing api service (../../services/api)
// Your backend must expose:  POST /api/contact
// Expected request body: { name, email, subject, message }
// Expected response:     { success: true } on success

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: 'easeOut' },
  }),
};

const CONTACT_INFO = [
  { emoji: '📧', label: 'Email Us',      value: 'teamshantabai@gmail.com',    sub: 'We reply within 24 hours' },
  { emoji: '📍', label: 'Based In',      value: 'Mumbai, Maharashtra',      sub: 'Proudly Indian 🇮🇳'       },
  { emoji: '🕐', label: 'Support Hours', value: 'Mon–Sat, 9 AM–7 PM',    sub: 'IST'                      },
];

const SUBJECTS = [
  'General Enquiry',
  'Partnership / Become a Chef',
  'Order Issue',
  'Technical Problem',
  'Media / Press',
  'Other',
];

const INITIAL_FORM   = { name: '', email: '', subject: '', message: '' };
const INITIAL_ERRORS = { name: '', email: '', subject: '', message: '' };

function validate({ name, email, subject, message }) {
  const errs = { ...INITIAL_ERRORS };
  if (!name.trim())    errs.name    = 'Your name is required.';
  if (!email.trim())   errs.email   = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email address.';
  if (!subject)        errs.subject = 'Please select a subject.';
  if (!message.trim()) errs.message = 'Message is required.';
  else if (message.trim().length < 20) errs.message = 'Message must be at least 20 characters.';
  return errs;
}

export default function ContactPage() {
  const [form,        setForm]        = useState(INITIAL_FORM);
  const [errors,      setErrors]      = useState(INITIAL_ERRORS);
  const [status,      setStatus]      = useState('idle');   // idle | loading | success | error
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async () => {
    const errs = validate(form);
    if (Object.values(errs).some(Boolean)) { setErrors(errs); return; }
    setStatus('loading');
    setServerError('');
    try {
      // Calls your existing backend: POST /api/contact
      await api.post('/contact', form);
      setStatus('success');
      setForm(INITIAL_FORM);
    } catch (err) {
      setStatus('error');
      setServerError(
        err?.response?.data?.message ||
        'Something went wrong. Please try again or email us directly.'
      );
    }
  };

  const base  = 'w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green transition-colors duration-150';
  const ok    = 'border-gray-200';
  const bad   = 'border-rose-400 bg-rose-50 focus:ring-rose-300/40 focus:border-rose-400';

  return (
    <div className="bg-white min-h-screen overflow-x-hidden">

      {/* Hero */}
      <section className="bg-gray-950 text-white pt-24 pb-16 px-4 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(27,67,50,0.55) 0%, transparent 70%)' }}
        />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.span
            variants={fadeUp} initial="hidden" animate="visible"
            className="inline-block bg-brand-green/20 text-green-400 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-5">
            Contact Us
          </motion.span>
          <motion.h1
            variants={fadeUp} custom={1} initial="hidden" animate="visible"
            className="text-4xl sm:text-5xl font-black leading-tight mb-4">
            We'd love to <span className="text-brand-green">hear from you</span>
          </motion.h1>
          <motion.p
            variants={fadeUp} custom={2} initial="hidden" animate="visible"
            className="text-gray-400 text-lg leading-relaxed max-w-xl mx-auto">
            Got a question, partnership idea, or just want to say hi? Drop us a message.
          </motion.p>
        </div>
      </section>

      {/* Info Cards */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        <div className="grid sm:grid-cols-3 gap-4">
          {CONTACT_INFO.map((info, i) => (
            <motion.div
              key={info.label}
              variants={fadeUp} custom={i * 0.1} initial="hidden" animate="visible"
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
              <span className="text-3xl">{info.emoji}</span>
              <div>
                <p className="font-bold text-gray-900 text-sm">{info.label}</p>
                <p className="text-gray-700 text-sm font-medium">{info.value}</p>
                <p className="text-gray-400 text-xs mt-0.5">{info.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Form Card */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <motion.div
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="bg-white rounded-3xl border border-gray-100 shadow-lg p-8 sm:p-10">

          {/* Success state */}
          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-brand-green" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">Message sent!</h3>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto mb-6">
                Thanks for reaching out. We'll get back to you within 24 hours.
              </p>
              <button
                onClick={() => setStatus('idle')}
                className="bg-brand-green text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-green-700 transition-colors duration-150">
                Send another message
              </button>
            </motion.div>
          )}

          {/* Form */}
          {status !== 'success' && (
            <>
              <h2 className="text-2xl font-black text-gray-900 mb-2">Send us a message</h2>
              <p className="text-gray-500 text-sm mb-7">All fields are required.</p>

              <div className="space-y-5">

                {/* Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Your Name</label>
                  <input
                    type="text" name="name" value={form.name} onChange={handleChange}
                    placeholder="Priya Sharma"
                    className={`${base} ${errors.name ? bad : ok}`}
                  />
                  {errors.name && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address</label>
                  <input
                    type="email" name="email" value={form.email} onChange={handleChange}
                    placeholder="priya@example.com"
                    className={`${base} ${errors.email ? bad : ok}`}
                  />
                  {errors.email && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.email}</p>}
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Subject</label>
                  <select
                    name="subject" value={form.subject} onChange={handleChange}
                    className={`${base} ${errors.subject ? bad : ok} cursor-pointer`}>
                    <option value="">Select a subject…</option>
                    {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.subject && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.subject}</p>}
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Message</label>
                  <textarea
                    name="message" value={form.message} onChange={handleChange}
                    rows={5} placeholder="Tell us how we can help…"
                    className={`${base} resize-none ${errors.message ? bad : ok}`}
                  />
                  <div className="flex justify-between items-center mt-1">
                    {errors.message
                      ? <p className="text-rose-500 text-xs font-medium">{errors.message}</p>
                      : <span />}
                    <span className={`text-xs font-medium ${form.message.length < 20 ? 'text-gray-400' : 'text-brand-green'}`}>
                      {form.message.length} / 20 min chars
                    </span>
                  </div>
                </div>

                {/* Server error */}
                {status === 'error' && serverError && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-rose-600 text-sm font-medium">
                    ⚠️ {serverError}
                  </div>
                )}

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={status === 'loading'}
                  className="w-full bg-brand-green text-white font-bold py-3.5 rounded-xl text-sm hover:bg-green-700 active:scale-95 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {status === 'loading' ? (
                    <>
                      <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Sending…
                    </>
                  ) : (
                    'Send Message'
                  )}
                </button>

              </div>
            </>
          )}

        </motion.div>
      </div>
    </div>
  );
}