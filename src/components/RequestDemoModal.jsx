import { useState, useEffect, useRef } from 'react';
import { X, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import api from '../services/api';

function RequestDemoModal({ open, onClose }) {
  const [form, setForm] = useState({ name: '', email: '', company: '', phone: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const panelRef = useRef(null);
  const nameRef = useRef(null);

  // Auto-focus first field on open
  useEffect(() => {
    if (open && nameRef.current) {
      const t = setTimeout(() => nameRef.current.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!open) return null;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');
    try {
      await api.post('/api/demo-request', form);
      setStatus('success');
      setForm({ name: '', email: '', company: '', phone: '', message: '' });
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.response?.data?.error || 'Something went wrong. Please try again.');
    }
  };

  const handleClose = () => {
    setStatus('idle');
    setErrorMsg('');
    onClose();
  };

  const inputCls = 'w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Request a Demo">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm animate-fade-in" onClick={handleClose} />

      {/* Panel */}
      <div
        ref={panelRef}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-sm z-10 px-6 pt-6 pb-4 border-b border-gray-100 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Request a Demo</h2>
              <p className="text-xs text-gray-500 mt-0.5">See PredixaAI in action</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {status === 'success' ? (
          <div className="p-8 text-center animate-fade-in-up">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={32} className="text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Thank you!</h3>
            <p className="text-gray-500 text-sm mb-8 max-w-xs mx-auto">
              We&apos;ve received your request. Our team will reach out within 24 hours to schedule your personalized demo.
            </p>
            <button
              onClick={handleClose}
              className="px-8 py-3 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all hover:-translate-y-0.5"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {status === 'error' && (
              <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl animate-fade-in">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label htmlFor="demo-name" className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
              <input
                ref={nameRef}
                id="demo-name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Jane Smith"
                className={inputCls}
              />
            </div>

            <div>
              <label htmlFor="demo-email" className="block text-sm font-semibold text-gray-700 mb-1.5">Work Email</label>
              <input
                id="demo-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="jane@company.com"
                className={inputCls}
              />
            </div>

            <div>
              <label htmlFor="demo-company" className="block text-sm font-semibold text-gray-700 mb-1.5">Company</label>
              <input
                id="demo-company"
                name="company"
                type="text"
                value={form.company}
                onChange={handleChange}
                required
                placeholder="Acme Manufacturing"
                className={inputCls}
              />
            </div>

            <div>
              <label htmlFor="demo-phone" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Phone <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                id="demo-phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                className={inputCls}
              />
            </div>

            <div>
              <label htmlFor="demo-message" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Message <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                id="demo-message"
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={3}
                placeholder="Tell us about your use case..."
                className={`${inputCls} resize-none`}
              />
            </div>

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="group w-full py-3.5 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/25 disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
            >
              {status === 'submitting' ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Request
                  <Send size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </>
              )}
            </button>

            <p className="text-[11px] text-gray-400 text-center pt-1">
              By submitting, you agree to be contacted about PredixaAI products.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default RequestDemoModal;
