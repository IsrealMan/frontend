import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, Shield, Brain, MessageSquare,
  DollarSign, Clock, Leaf, BookOpen, Menu, X,
  ArrowRight, Play, ChevronRight, Zap, BarChart3,
  TrendingUp, CheckCircle2, Mail, Phone
} from 'lucide-react';
import RequestDemoModal from '../components/RequestDemoModal';

/* ───────────────────── Data ───────────────────── */

const capabilities = [
  { icon: Activity, title: 'Real-Time Monitoring', desc: 'Continuously monitor production parameters with AI-powered anomaly detection across all your manufacturing lines.', color: 'from-indigo-500 to-blue-500' },
  { icon: TrendingUp, title: 'Predict Failures', desc: 'Leverage machine learning models to predict equipment failures before they happen, reducing unplanned downtime.', color: 'from-violet-500 to-purple-500' },
  { icon: Shield, title: 'Automated Root Cause Analysis', desc: 'Instantly identify the root cause of process anomalies with AI-driven analysis, eliminating guesswork.', color: 'from-rose-500 to-pink-500' },
  { icon: Brain, title: 'Actionable Recommendations', desc: 'Receive prioritized, step-by-step recommendations to resolve issues and optimize production efficiency.', color: 'from-amber-500 to-orange-500' },
  { icon: MessageSquare, title: 'AI Chat', desc: 'Interact with your production data through natural language — ask questions, get insights, and make decisions faster.', color: 'from-emerald-500 to-teal-500' },
];

const benefits = [
  { icon: DollarSign, title: 'SAVE MONEY', desc: 'Reduce unplanned downtime costs by up to 50% and extend equipment lifespan through predictive maintenance.', metric: '50%', metricLabel: 'Cost reduction' },
  { icon: Clock, title: 'SAVE TIME', desc: 'Automate root cause analysis and reduce mean-time-to-resolution from hours to minutes.', metric: '10x', metricLabel: 'Faster resolution' },
  { icon: Leaf, title: 'SUSTAINABILITY', desc: 'Optimize resource consumption, reduce waste, and lower your carbon footprint with smarter operations.', metric: '30%', metricLabel: 'Less waste' },
  { icon: BookOpen, title: 'PRESERVE KNOWLEDGE', desc: 'Capture institutional expertise in AI models so critical know-how stays in your organization forever.', metric: '100%', metricLabel: 'Knowledge retained' },
];

const team = [
  { name: 'Senait Dasa', role: 'CEO', color: 'from-indigo-400 to-purple-500' },
  { name: 'Israel Mangisto', role: 'CTO', color: 'from-blue-400 to-indigo-500' },
  { name: 'Dr. Matan Ben Zion', role: 'Asst Professor of AI', color: 'from-violet-400 to-purple-500' },
  { name: 'Solomon Geveye', role: 'VP Business Development', color: 'from-emerald-400 to-teal-500' },
  { name: 'Shoshi Tessema', role: 'Team Member', color: 'from-rose-400 to-pink-500' },
];

/* ───────────────────── Hooks ───────────────────── */

function useScrollReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('is-visible'); observer.unobserve(el); } },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function useAnimatedCounter(end, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!startOnView) return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.unobserve(el); } },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [startOnView]);

  useEffect(() => {
    if (!started) return;
    let raf;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * end));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [started, end, duration]);

  return { count, ref };
}

/* ───────────────────── Sub-components ───────────────────── */

function StatCard({ value, label, prefix = '', suffix = '' }) {
  const { count, ref } = useAnimatedCounter(parseFloat(value), 1800);
  return (
    <div ref={ref} className="relative p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm group hover:bg-white/10 transition-all duration-300">
      <div className="text-5xl font-bold text-gradient mb-2">
        {prefix}{count}{suffix}
      </div>
      <div className="text-sm text-gray-400 font-medium">{label}</div>
    </div>
  );
}

function DashboardMockup() {
  return (
    <div className="relative mx-auto max-w-4xl mt-16">
      {/* Glow behind */}
      <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl opacity-60" />

      {/* Browser chrome */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 border border-gray-200/60">
        {/* Title bar */}
        <div className="bg-gray-100 px-4 py-3 flex items-center gap-2 border-b border-gray-200">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-white rounded-md px-4 py-1 text-xs text-gray-400 w-64 text-center border border-gray-200">
              app.predixaai.com/dashboard
            </div>
          </div>
        </div>

        {/* Dashboard content */}
        <div className="bg-gray-50 p-6 flex gap-4">
          {/* Mini sidebar */}
          <div className="hidden sm:flex flex-col w-40 bg-white rounded-xl p-3 gap-2 border border-gray-100">
            <div className="flex items-center gap-2 px-2 py-1.5 bg-primary/10 rounded-lg">
              <div className="w-4 h-4 bg-primary rounded" />
              <span className="text-xs font-medium text-primary">Dashboard</span>
            </div>
            {['Production', 'Quality', 'AI Chat'].map(item => (
              <div key={item} className="flex items-center gap-2 px-2 py-1.5 text-gray-400 rounded-lg">
                <div className="w-4 h-4 bg-gray-200 rounded" />
                <span className="text-xs">{item}</span>
              </div>
            ))}
          </div>

          {/* Main area */}
          <div className="flex-1 space-y-4">
            {/* KPI row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Active Alerts', val: '3', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' },
                { label: 'Uptime', val: '99.7%', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                { label: 'Predictions', val: '12', color: 'text-primary', bg: 'bg-indigo-50', border: 'border-indigo-100' },
              ].map(kpi => (
                <div key={kpi.label} className={`${kpi.bg} border ${kpi.border} rounded-xl p-3`}>
                  <div className={`text-lg font-bold ${kpi.color}`}>{kpi.val}</div>
                  <div className="text-[10px] text-gray-500">{kpi.label}</div>
                </div>
              ))}
            </div>

            {/* Chart area */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-700">Temperature Trend</span>
                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">Normal</span>
              </div>
              {/* Fake sparkline */}
              <svg viewBox="0 0 300 60" className="w-full h-12">
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0 40 Q30 35 60 30 T120 25 T180 20 T240 28 T300 15" fill="none" stroke="url(#lineGrad)" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M0 40 Q30 35 60 30 T120 25 T180 20 T240 28 T300 15 L300 60 L0 60Z" fill="url(#areaGrad)" />
              </svg>
            </div>

            {/* Recommendation row */}
            <div className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap size={14} className="text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-gray-800 truncate">AI Recommendation: Reduce pressure by 5%</div>
                <div className="text-[10px] text-gray-400">Predicted anomaly in 2h — confidence 94%</div>
              </div>
              <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────── Main Page ───────────────────── */

function LandingPage() {
  const [demoOpen, setDemoOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  }, []);

  const r1 = useScrollReveal();
  const r2 = useScrollReveal();
  const r3 = useScrollReveal();
  const r4 = useScrollReveal();
  const r5 = useScrollReveal();
  const r6 = useScrollReveal();
  const r7 = useScrollReveal();

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">

      {/* ── Sticky Nav ── */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] border-b border-gray-100/50'
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <button onClick={() => scrollTo('hero')} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="font-bold text-lg tracking-tight text-gray-900">
              Predixa<span className="text-gradient">AI</span>
            </span>
          </button>

          {/* Desktop */}
          <div className="hidden lg:flex items-center gap-1">
            {['problem', 'solution', 'capabilities', 'benefits', 'team'].map((s) => (
              <button
                key={s}
                onClick={() => scrollTo(s)}
                className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 font-medium rounded-lg hover:bg-gray-50 transition-all capitalize"
              >
                {s}
              </button>
            ))}
            <div className="w-px h-6 bg-gray-200 mx-2" />
            <Link to="/login" className="px-3 py-1.5 text-sm font-semibold text-gray-700 hover:text-primary transition-colors">
              Login
            </Link>
            <button
              onClick={() => setDemoOpen(true)}
              className="ml-2 px-5 py-2 bg-gradient-to-r from-primary to-purple-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              Request a Demo
            </button>
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Toggle menu">
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        <div className={`lg:hidden transition-all duration-300 overflow-hidden ${mobileMenuOpen ? 'max-h-96 border-t border-gray-100' : 'max-h-0'}`}>
          <div className="bg-white/95 backdrop-blur-xl px-4 pb-5 pt-2 space-y-1">
            {['problem', 'solution', 'capabilities', 'benefits', 'team'].map((s) => (
              <button key={s} onClick={() => scrollTo(s)} className="block w-full text-left px-3 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg capitalize transition-colors">
                {s}
              </button>
            ))}
            <div className="border-t border-gray-100 my-2" />
            <Link to="/login" className="block px-3 py-2.5 text-sm font-semibold text-primary">Customer Login</Link>
            <button onClick={() => { setDemoOpen(true); setMobileMenuOpen(false); }} className="w-full px-4 py-2.5 bg-gradient-to-r from-primary to-purple-600 text-white text-sm font-semibold rounded-xl mt-1">
              Request a Demo
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section id="hero" className="relative pt-28 pb-8 sm:pt-36 sm:pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/80 via-white to-white" />
        <div className="absolute inset-0 dot-grid opacity-60" />
        <div className="absolute top-16 -right-32 w-[500px] h-[500px] bg-gradient-to-br from-primary/10 to-purple-300/20 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-gradient-to-tr from-blue-200/20 to-indigo-300/10 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/5 to-transparent rounded-full animate-pulse-soft" />

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/80 backdrop-blur border border-primary/20 text-primary text-xs font-semibold rounded-full mb-8 shadow-sm animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            AI-Powered Predictive Maintenance for Manufacturing
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-extrabold leading-[1.1] mb-6 tracking-tight animate-fade-in-up">
            PredixaAI enables manufacturers to{' '}
            <span className="text-gradient">predict and prevent</span>{' '}
            unexpected downtime
          </h1>

          <p className="text-lg sm:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            Transform your manufacturing operations with AI that sees problems before they happen — saving millions in lost production.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <button
              onClick={() => setDemoOpen(true)}
              className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary to-purple-600 text-white font-semibold rounded-2xl hover:shadow-xl hover:shadow-primary/25 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
            >
              Request a Demo
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <Link
              to="/login"
              className="group w-full sm:w-auto px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-2xl hover:border-primary/40 hover:text-primary transition-all text-center flex items-center justify-center gap-2 shadow-sm"
            >
              Customer Login
              <Play size={16} className="group-hover:text-primary transition-colors" />
            </Link>
          </div>

          {/* Dashboard preview */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <DashboardMockup />
          </div>
        </div>
      </section>

      {/* ── Problem ── */}
      <section id="problem" className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-gray-950 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.15),transparent_50%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        <div ref={r1} className="reveal relative max-w-5xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            The Problem
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-8 tracking-tight">
            The Hidden Cost of Downtime
          </h2>
          <p className="text-xl sm:text-2xl leading-relaxed text-gray-300 max-w-3xl mx-auto">
            Unplanned downtime costs the world&apos;s top 500 companies{' '}
            <span className="text-white font-bold">$1.4 trillion annually</span> — over{' '}
            <span className="text-gradient font-bold">11% of total revenue</span>.
          </p>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StatCard value={1.4} prefix="$" suffix="T" label="Annual cost of unplanned downtime" />
            <StatCard value={11} suffix="%" label="Of total revenue lost" />
            <StatCard value={500} prefix="" suffix="" label="Top companies affected globally" />
          </div>
        </div>
      </section>

      {/* ── Solution ── */}
      <section id="solution" className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

        <div ref={r2} className="reveal max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-full mb-6">
              <CheckCircle2 size={12} />
              The Solution
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 mb-8">
              AI That <span className="text-gradient">Prevents</span> Downtime
            </h2>
          </div>

          <div className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-gray-50 to-indigo-50/50 border border-gray-100">
            <div className="absolute top-6 right-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed relative">
              PredixaAI is an <strong className="text-gray-900">AI-driven platform</strong> that transforms manufacturing operations by{' '}
              <strong className="text-gray-900">proactively predicting and preventing process anomalies that cause downtime</strong>.
              Our platform learns from your production data in real time, identifying patterns invisible to human operators,
              and delivers actionable insights before issues escalate.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {['Machine Learning', 'Real-Time Analytics', 'Predictive Models', 'Natural Language AI'].map((tag) => (
                <span key={tag} className="px-3 py-1 bg-white border border-gray-200 text-gray-600 text-xs font-medium rounded-full shadow-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Capabilities ── */}
      <section id="capabilities" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-gray-50/80">
        <div className="max-w-6xl mx-auto">
          <div ref={r3} className="reveal text-center mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-xs font-semibold rounded-full mb-6">
              <BarChart3 size={12} />
              Platform
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900">
              Capabilities
            </h2>
          </div>

          <div ref={r4} className="reveal-stagger grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((cap) => (
              <div
                key={cap.title}
                className="group relative bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${cap.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                  <cap.icon size={22} className="text-white" />
                </div>
                <h3 className="text-lg font-bold mb-3 text-gray-900 group-hover:text-primary transition-colors">{cap.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{cap.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section id="benefits" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div ref={r5} className="reveal text-center mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold rounded-full mb-6">
              <Zap size={12} />
              Why PredixaAI
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900">
              Benefits
            </h2>
          </div>

          <div ref={r6} className="reveal-stagger grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b) => (
              <div key={b.title} className="group relative bg-white rounded-2xl border border-gray-100 p-8 text-center hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                {/* Background metric */}
                <div className="absolute top-4 right-4 text-6xl font-black text-gray-50 group-hover:text-primary/5 transition-colors select-none">
                  {b.metric}
                </div>

                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                    <b.icon size={26} className="text-primary" />
                  </div>
                  <h3 className="font-bold text-xs tracking-[0.15em] mb-2 text-gray-900">{b.title}</h3>
                  <div className="text-primary font-bold text-sm mb-3">{b.metric} {b.metricLabel}</div>
                  <p className="text-gray-500 text-sm leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section id="team" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-gray-50/80">
        <div className="max-w-4xl mx-auto">
          <div ref={r7} className="reveal text-center mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-violet-50 border border-violet-200 text-violet-700 text-xs font-semibold rounded-full mb-6">
              Our People
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900">
              Team
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
            {team.map((m) => (
              <div key={m.name} className="group text-center">
                <div className="relative mx-auto mb-4">
                  <div className={`w-24 h-24 bg-gradient-to-br ${m.color} rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all group-hover:scale-105 group-hover:-translate-y-1`}>
                    <span className="text-white font-bold text-xl tracking-wide">
                      {m.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent rounded-full group-hover:via-primary/30 transition-colors" />
                </div>
                <h3 className="font-semibold text-sm text-gray-900 group-hover:text-primary transition-colors">{m.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{m.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gray-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.2),transparent_70%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6 tracking-tight">
            Ready to eliminate{' '}
            <span className="text-gradient">unplanned downtime</span>?
          </h2>
          <p className="text-lg text-gray-400 mb-10 max-w-xl mx-auto">
            Join leading manufacturers who trust PredixaAI to keep their operations running — and their revenue growing.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setDemoOpen(true)}
              className="group w-full sm:w-auto px-8 py-4 bg-white text-gray-900 font-semibold rounded-2xl hover:shadow-xl transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              Request a Demo
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 border-2 border-white/20 text-white font-semibold rounded-2xl hover:bg-white/10 transition-all text-center"
            >
              Customer Login
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-950 border-t border-white/5 text-gray-400 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="font-bold text-lg text-white tracking-tight">
                  Predixa<span className="text-gradient">AI</span>
                </span>
              </div>
              <p className="text-sm max-w-xs leading-relaxed">
                AI-driven predictive maintenance for modern manufacturers. Predict. Prevent. Prosper.
              </p>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-white text-sm mb-4">Contact</h4>
              <div className="space-y-3">
                <a href="tel:054-2334474" className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                  <Phone size={14} />
                  054-2334474
                </a>
                <a href="mailto:senaitd@predixaai.com" className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                  <Mail size={14} />
                  senaitd@predixaai.com
                </a>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold text-white text-sm mb-4">Quick Links</h4>
              <div className="flex flex-col gap-3">
                <Link to="/login" className="text-sm hover:text-primary transition-colors">Customer Login</Link>
                <button onClick={() => setDemoOpen(true)} className="text-sm hover:text-primary transition-colors text-left">Request a Demo</button>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <span>&copy; {new Date().getFullYear()} PredixaAI. All rights reserved.</span>
            <div className="flex items-center gap-1 text-gray-600">
              Built with <span className="text-red-400 mx-0.5">&#9829;</span> for manufacturing
            </div>
          </div>
        </div>
      </footer>

      <RequestDemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}

export default LandingPage;
