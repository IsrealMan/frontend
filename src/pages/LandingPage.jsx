import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, Brain, MessageSquare,
  DollarSign, Clock, Leaf, BookOpen, Menu, X,
  Zap, BarChart3, Settings,
  TrendingUp, Search, AlertTriangle
} from 'lucide-react';
import RequestDemoModal from '../components/RequestDemoModal';
import { useTranslations } from '../hooks/useTranslations';

/* ───────────────────── Data ───────────────────── */

const industries = [
  { label: 'Semiconductor Fabs' },
  { label: 'Advanced Manufacturing' },
  { label: 'Digital Printing' },
  { label: 'Precision Production' },
];

const problemPoints = [
  { icon: Search,     text: 'Root cause analysis is slow and manual' },
  { icon: Brain,      text: 'Engineering knowledge is not scalable' },
  { icon: Activity,   text: 'Data exists but insights remain hidden' },
  { icon: TrendingUp, text: 'Valuable process improvements are often missed' },
];

const solutionPoints = [
  { icon: Zap,      text: 'Automated root cause analysis' },
  { icon: Settings, text: 'Cross-process intelligence' },
  { icon: BarChart3, text: 'Detection of process drift and hidden inefficiencies' },
  { icon: Brain,    text: 'Continuous learning from production data' },
];

const capabilities = [
  { icon: Activity,       title: 'Real-Time Monitoring',         desc: 'Continuously monitor production parameters with AI-powered anomaly detection across all your manufacturing lines.',       color: 'from-blue-500 to-sky-500'      },
  { icon: TrendingUp,     title: 'Predict Failures',              desc: 'Leverage machine learning models to predict equipment failures before they happen, reducing unplanned downtime.',         color: 'from-violet-500 to-purple-500' },
  { icon: Search,         title: 'Automated Root Cause Analysis', desc: 'Instantly identify the root cause of process anomalies with AI-driven analysis, eliminating guesswork.',                 color: 'from-rose-500 to-pink-500'     },
  { icon: AlertTriangle,  title: 'Actionable Recommendations',    desc: 'Receive prioritized, step-by-step recommendations to resolve issues and optimize production efficiency.',                 color: 'from-amber-500 to-orange-500'  },
  { icon: MessageSquare,  title: 'AI Chat',                       desc: 'Interact with your production data through natural language — ask questions, get insights, and make decisions faster.',   color: 'from-emerald-500 to-teal-500'  },
];

const benefits = [
  { icon: DollarSign, title: 'SAVE MONEY',        metric: '50%',  metricLabel: 'Cost reduction',    desc: 'Reduce unplanned downtime costs by up to 50% and extend equipment lifespan.'         },
  { icon: Clock,      title: 'SAVE TIME',          metric: '10x',  metricLabel: 'Faster resolution', desc: 'Automate root cause analysis and reduce resolution time from hours to minutes.'      },
  { icon: Leaf,       title: 'SUSTAINABILITY',      metric: '30%',  metricLabel: 'Less waste',        desc: 'Optimize resource consumption, reduce waste, and lower your carbon footprint.'       },
  { icon: BookOpen,   title: 'PRESERVE KNOWLEDGE',  metric: '100%', metricLabel: 'Knowledge retained',desc: 'Capture institutional expertise so critical know-how stays in your organization.'    },
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


/* ───────────────────── Sub-components ───────────────────── */

function FeatureCard({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
      <div className="w-11 h-11 bg-sky-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
        <Icon size={20} className="text-sky-400" />
      </div>
      <span className="text-base text-gray-300 font-medium">{text}</span>
    </div>
  );
}

/* ───────────────────── Main Page ───────────────────── */

function LandingPage() {
  const t = useTranslations('landing', 'en');
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

  const navLinks = ['about', 'problem', 'solution', 'capabilities', 'benefits'];

  return (
    <div className="min-h-screen bg-[#050a18] text-gray-100 overflow-x-hidden">

      {/* ── Sticky Nav ── */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#050a18]/90 backdrop-blur-xl border-b border-white/10'
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <button onClick={() => scrollTo('hero')} className="flex items-center gap-2.5">
            <img src="/logo-Dee6QY-c.png" alt="PredixaAI" className="w-9 h-9 rounded-xl" />
            <span className="font-bold text-xl tracking-tight text-white">
              PredixaAI
            </span>
          </button>

          {/* Desktop */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((s) => (
              <button
                key={s}
                onClick={() => scrollTo(s)}
                className="px-3 py-1.5 text-sm text-gray-400 hover:text-white font-medium rounded-lg hover:bg-white/5 transition-all capitalize"
              >
                {s}
              </button>
            ))}
            <div className="w-px h-6 bg-white/10 mx-2" />
            <Link
              to="/login"
              className="px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
            >
              Login
            </Link>
            <button
              onClick={() => setDemoOpen(true)}
              className="ml-1 px-5 py-2 bg-sky-400 text-gray-900 text-sm font-semibold rounded-xl hover:bg-sky-300 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              Request a Demo
            </button>
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 text-gray-400 hover:bg-white/5 rounded-lg transition-colors" aria-label="Toggle menu">
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        <div className={`lg:hidden transition-all duration-300 overflow-hidden ${mobileMenuOpen ? 'max-h-96 border-t border-white/10' : 'max-h-0'}`}>
          <div className="bg-[#050a18]/95 backdrop-blur-xl px-4 pb-5 pt-2 space-y-1">
            {navLinks.map((s) => (
              <button key={s} onClick={() => scrollTo(s)} className="block w-full text-left px-3 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg capitalize transition-colors">
                {s}
              </button>
            ))}
            <div className="border-t border-white/10 my-2" />
            <Link to="/login" className="block px-3 py-2.5 text-sm font-semibold text-sky-400">Customer Login</Link>
            <button onClick={() => { setDemoOpen(true); setMobileMenuOpen(false); }} className="w-full px-4 py-2.5 bg-sky-400 text-gray-900 text-sm font-semibold rounded-xl mt-1">
              Request a Demo
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section id="hero" className="relative pt-28 pb-20 sm:pt-40 sm:pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.06),transparent_60%)]" />

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Logo mark */}
          <div className="flex justify-center mb-8 animate-fade-in">
            <img src="/logo-Dee6QY-c.png" alt="PredixaAI" className="w-28 h-28 rounded-[2rem] shadow-2xl" />
          </div>

          {/* Headline */}
          <h1 className="text-7xl sm:text-8xl lg:text-9xl font-extrabold leading-[1.05] mb-6 tracking-tight animate-fade-in-up">
            <span className="text-white">Predixa</span><span className="text-sky-400">AI</span>
          </h1>

          <p className="text-2xl sm:text-3xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            Automating production engineering decision making
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <button
              onClick={() => setDemoOpen(true)}
              className="w-full sm:w-auto px-10 py-4 bg-sky-400 text-gray-900 font-semibold rounded-2xl hover:bg-sky-300 transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-sky-500/20 text-base"
            >
              Request a Demo
            </button>
            <button
              onClick={() => scrollTo('about')}
              className="w-full sm:w-auto px-10 py-4 bg-white/5 border border-white/20 text-white font-semibold rounded-2xl hover:bg-white/10 hover:border-white/40 transition-all text-base"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div ref={r1} className="reveal max-w-5xl mx-auto">
          <span className="text-sky-400 text-sm font-semibold tracking-[0.2em] uppercase block mb-5">
            About
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-8 tracking-tight text-white max-w-3xl">
            Enabling Industry 5.0 Manufacturing
          </h2>
          <p className="text-xl sm:text-2xl text-gray-400 leading-relaxed max-w-3xl mb-12">
            Industry 4.0 connected factories through data. Industry 5.0 introduces intelligent systems that help humans make better decisions.<br />
            PredixaAI is building the intelligence layer that enables factories to move from reactive troubleshooting to autonomous optimization.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {industries.map((ind) => (
              <div key={ind.label} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
                <BarChart3 size={18} className="text-sky-400 flex-shrink-0" />
                <span className="text-base text-gray-300 font-medium">{ind.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Problem ── */}
      <section id="problem" className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div ref={r2} className="reveal max-w-5xl mx-auto">
          <span className="text-sky-400 text-sm font-semibold tracking-[0.2em] uppercase block mb-5">
            {t('problem.badge', 'Problem')}
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-8 tracking-tight text-white max-w-3xl">
            Manufacturing Still Depends on Human Expertise
          </h2>
          <p className="text-xl sm:text-2xl text-gray-400 leading-relaxed max-w-3xl mb-12">
            Modern factories collect enormous volumes of production data. Yet when yield drops or a process deviates, engineers must manually investigate multiple systems to understand what happened.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {problemPoints.map((p) => (
              <FeatureCard key={p.text} icon={p.icon} text={p.text} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Solution ── */}
      <section id="solution" className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div ref={r3} className="reveal max-w-5xl mx-auto">
          <span className="text-sky-400 text-sm font-semibold tracking-[0.2em] uppercase block mb-5">
            {t('solution.badge', 'Solution')}
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-8 tracking-tight text-white max-w-3xl">
            The Digital Process Engineer
          </h2>
          <p className="text-xl sm:text-2xl text-gray-400 leading-relaxed max-w-3xl mb-12">
            PredixaAI analyzes production data across tools, materials, processes, and operators to automatically detect patterns, explain anomalies, and uncover optimization opportunities.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {solutionPoints.map((p) => (
              <FeatureCard key={p.text} icon={p.icon} text={p.text} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Capabilities ── */}
      <section id="capabilities" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div ref={r4} className="reveal text-center mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white">
              Capabilities
            </h2>
          </div>

          <div ref={r7} className="reveal-stagger grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {capabilities.map((cap) => (
              <div
                key={cap.title}
                className="group bg-white/5 border border-white/10 p-8 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${cap.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                  <cap.icon size={22} className="text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">{cap.title}</h3>
                <p className="text-gray-400 text-base leading-relaxed">{cap.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section id="benefits" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div ref={r5} className="reveal text-center mb-16">
            <span className="text-sky-400 text-sm font-semibold tracking-[0.2em] uppercase block mb-5">
              Benefits
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white">
              Measurable Impact
            </h2>
          </div>

          <div ref={r6} className="reveal-stagger grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {benefits.map((b) => (
              <div key={b.title} className="group bg-white/5 border border-white/10 rounded-2xl p-8 text-left hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                <div className="w-12 h-12 bg-sky-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-sky-500/20 transition-colors">
                  <b.icon size={22} className="text-sky-400" />
                </div>
                <div className="text-6xl font-black text-white mb-1">{b.metric}</div>
                <h3 className="font-bold text-sm tracking-[0.15em] mb-4 text-sky-400">{b.title}</h3>
                <p className="text-gray-400 text-base leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="relative py-28 sm:py-36 px-4 sm:px-6 lg:px-8 overflow-hidden border-t border-white/5">
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight leading-tight">
            The future factory will not only collect data —{' '}
            <span className="text-sky-400">it will understand it.</span>
          </h2>
          <p className="text-xl text-gray-400 mb-10 max-w-xl mx-auto">
            PredixaAI is building the intelligence layer for the factories of the future.
          </p>
          <button
            onClick={() => setDemoOpen(true)}
            className="px-10 py-4 bg-sky-400 text-gray-900 font-semibold rounded-2xl hover:bg-sky-300 transition-all hover:-translate-y-0.5 shadow-lg shadow-sky-500/20 text-base"
          >
            Request a Demo
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/10 text-gray-400 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src="/logo-Dee6QY-c.png" alt="PredixaAI" className="w-8 h-8 rounded-lg" />
            <span className="font-bold text-base text-white tracking-tight">
              PredixaAI
            </span>
          </div>
          <span className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} PredixaAI. All rights reserved.
          </span>
        </div>
      </footer>

      <RequestDemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}

export default LandingPage;
