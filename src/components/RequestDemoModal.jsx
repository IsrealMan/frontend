import { useState, useEffect, useRef } from 'react';
import { X, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import api from '../services/api';

function RequestDemoModal({ open, onClose }) {
  const [form, setForm] = useState({ name: '', email: '', company: '', phone: '', country: '', industry: '', message: '' });
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const nameRef = useRef(null);

  useEffect(() => {
    if (open && nameRef.current) {
      const t = setTimeout(() => nameRef.current.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!open) return null;

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');
    try {
      await api.post('/api/demo-request', form);
      setStatus('success');
      setForm({ name: '', email: '', company: '', phone: '', country: '', industry: '', message: '' });
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.response?.data?.error || 'Something went wrong. Please try again.');
    }
  };

  const handleClose = () => { setStatus('idle'); setErrorMsg(''); onClose(); };

  const inputCls = 'w-full px-4 py-3 bg-transparent border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-sky-400/60 transition-colors';

  const Field = ({ id, label, optional, children }) => (
    <div className="space-y-2">
      <label htmlFor={id} className="flex items-center gap-2 text-sm font-medium text-gray-300">
        {label}
        {optional && <span className="text-gray-600 font-normal text-xs">optional</span>}
      </label>
      {children}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-[#0a0f1e] border border-white/10 rounded-2xl shadow-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-5">
          <div>
            <h2 className="text-lg font-semibold text-white">Request a Demo</h2>
            <p className="text-sm text-gray-500 mt-0.5">See PredixaAI in action</p>
          </div>
          <button onClick={handleClose} className="p-1.5 text-gray-600 hover:text-gray-300 transition-colors rounded-lg hover:bg-white/5 -mt-0.5" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="h-px bg-white/5 mx-6" />

        {status === 'success' ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-emerald-400/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={24} className="text-emerald-400" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1.5">Request received</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
              Our team will reach out within 24 hours to schedule your demo.
            </p>
            <button onClick={handleClose} className="px-6 py-2.5 bg-sky-400 text-gray-900 rounded-xl text-sm font-semibold hover:bg-sky-300 transition-all">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 pt-5 space-y-4">
            {status === 'error' && (
              <div className="flex items-center gap-2.5 p-3 bg-red-500/10 border border-red-500/15 text-red-400 text-sm rounded-xl">
                <AlertCircle size={14} className="flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <Field id="demo-name" label="Full Name">
              <input ref={nameRef} id="demo-name" name="name" type="text" value={form.name} onChange={handleChange} required placeholder="Jane Smith" className={inputCls} />
            </Field>

            <Field id="demo-email" label="Work Email">
              <input id="demo-email" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="jane@company.com" className={inputCls} />
            </Field>

            <Field id="demo-company" label="Company">
              <input id="demo-company" name="company" type="text" value={form.company} onChange={handleChange} required placeholder="Acme Manufacturing" className={inputCls} />
            </Field>

            <Field id="demo-phone" label="Phone" optional>
              <input id="demo-phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" className={inputCls} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field id="demo-country" label="Country" optional>
                <input id="demo-country" name="country" type="text" value={form.country} onChange={handleChange} placeholder="United States" className={inputCls} />
              </Field>
              <Field id="demo-industry" label="Industry" optional>
                <select id="demo-industry" name="industry" value={form.industry} onChange={handleChange} className={`${inputCls} appearance-none`}>
                  <option value="">Select...</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Automotive">Automotive</option>
                  <option value="Pharmaceuticals">Pharmaceuticals</option>
                  <option value="Food & Beverage">Food & Beverage</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Chemicals">Chemicals</option>
                  <option value="Aerospace">Aerospace</option>
                  <option value="Energy">Energy</option>
                  <option value="Other">Other</option>
                </select>
              </Field>
            </div>

            <Field id="demo-message" label="Message" optional>
              <textarea id="demo-message" name="message" value={form.message} onChange={handleChange} rows={3} placeholder="Tell us about your use case..." className={`${inputCls} resize-none`} />
            </Field>

            <div className="pt-1">
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full py-3 bg-sky-400 text-gray-900 rounded-xl text-sm font-semibold hover:bg-sky-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {status === 'submitting' ? (
                  <><Loader2 size={15} className="animate-spin" /> Submitting...</>
                ) : (
                  <><Send size={14} /> Submit Request</>
                )}
              </button>
              <p className="text-[11px] text-gray-600 text-center mt-3">
                By submitting, you agree to be contacted about PredixaAI products.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default RequestDemoModal;
