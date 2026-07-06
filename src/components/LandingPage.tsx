import { useState, useEffect } from 'react';
import { LandingPageData } from '../types';
import { 
  Star, 
  ChevronDown, 
  CheckCircle, 
  Lock, 
  Bolt, 
  ArrowRight, 
  Settings, 
  ShieldCheck, 
  Zap, 
  Flame, 
  TrendingUp,
  Award,
  BookOpen,
  Apple,
  Dumbbell,
  Check
} from 'lucide-react';

interface LandingPageProps {
  data: LandingPageData;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
}

export default function LandingPage({ data, onOpenAdmin, isAdminLoggedIn }: LandingPageProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [stickyCtaVisible, setStickyCtaVisible] = useState(false);
  const [imageAnimateClass, setImageAnimateClass] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 600) {
        setStickyCtaVisible(true);
      } else {
        setStickyCtaVisible(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleHeroImageClick = () => {
    setImageAnimateClass('scale-98 opacity-90 transition-all');
    setTimeout(() => {
      setImageAnimateClass('scale-102 transition-all duration-300');
    }, 150);
    setTimeout(() => {
      setImageAnimateClass('hover:scale-101 transition-all');
    }, 450);
  };

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const scrollToPricing = () => {
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Safe icons list mapping
  const renderIcon = (iconName: string) => {
    const baseClass = "text-emerald-600 w-6 h-6";
    switch (iconName) {
      case 'psychology':
        return <span className="material-symbols-outlined text-emerald-600 text-2xl">psychology</span>;
      case 'restaurant_menu':
        return <span className="material-symbols-outlined text-emerald-600 text-2xl">restaurant_menu</span>;
      case 'nutrition':
        return <span className="material-symbols-outlined text-emerald-600 text-2xl">nutrition</span>;
      case 'cycle':
        return <span className="material-symbols-outlined text-emerald-600 text-2xl">sync</span>;
      case 'schedule':
        return <span className="material-symbols-outlined text-emerald-600 text-2xl">schedule</span>;
      case 'monitor_heart':
        return <span className="material-symbols-outlined text-emerald-600 text-2xl">monitor_heart</span>;
      case 'fitness_center':
        return <span className="material-symbols-outlined text-emerald-600 text-2xl">fitness_center</span>;
      case 'sports_gymnastics':
        return <span className="material-symbols-outlined text-emerald-600 text-2xl">sports_gymnastics</span>;
      case 'timeline':
        return <span className="material-symbols-outlined text-emerald-600 text-2xl">timeline</span>;
      case 'verified':
        return <span className="material-symbols-outlined text-emerald-600 text-2xl">verified</span>;
      case 'workspace_premium':
        return <span className="material-symbols-outlined text-emerald-600 text-2xl">workspace_premium</span>;
      case 'task_alt':
        return <span className="material-symbols-outlined text-emerald-600 text-2xl">task_alt</span>;
      case 'query_stats':
        return <span className="material-symbols-outlined text-emerald-600 text-2xl">query_stats</span>;
      case 'shopping_bag':
        return <span className="material-symbols-outlined text-emerald-600 text-2xl">shopping_bag</span>;
      case 'restaurant':
        return <span className="material-symbols-outlined text-emerald-600 text-2xl">restaurant</span>;
      default:
        return <CheckCircle className={baseClass} />;
    }
  };

  return (
    <div className="bg-[#f8fafc] text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden min-h-screen">
      
      {/* TopNavBar */}
      <header className="fixed top-0 w-full z-40 bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-100 transition-all duration-300">
        <div className="flex justify-between items-center max-w-7xl mx-auto px-6 h-16">
          <div className="flex items-center gap-3">
            <img 
              alt="Logo" 
              className="w-10 h-10 object-contain rounded-full shadow-sm bg-emerald-50 p-1" 
              src={data.header.logoUrl || 'https://i.ibb.co/zWNjs1sf/image-from-https-lean90-preview-preview-emergentagent-com-healthdecod-logo.png'} 
            />
            <span className="font-bold text-xl tracking-tight text-emerald-800">{data.header.name || 'Lean90'}</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#problem" className="text-sm font-semibold text-slate-600 hover:text-emerald-700 transition-colors">The Challenge</a>
            <a href="#system" className="text-sm font-semibold text-slate-600 hover:text-emerald-700 transition-colors">Lean90 System</a>
            <a href="#included" className="text-sm font-semibold text-slate-600 hover:text-emerald-700 transition-colors">What's Included</a>
            <a href="#results" className="text-sm font-semibold text-slate-600 hover:text-emerald-700 transition-colors">Results</a>
            <a href="#faq" className="text-sm font-semibold text-slate-600 hover:text-emerald-700 transition-colors">FAQ</a>
          </nav>
          
          <div className="flex items-center gap-3">
            {/* Quick Access Admin Toggle Button */}
            <button 
              onClick={onOpenAdmin}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                isAdminLoggedIn 
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                  : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
              }`}
              id="admin-toggle"
            >
              <Settings className="w-3.5 h-3.5 animate-spin-slow" />
              <span>{isAdminLoggedIn ? 'Admin Panel (Active)' : 'Customize Page (Admin)'}</span>
            </button>

            <button 
              onClick={scrollToPricing}
              className="bg-emerald-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-emerald-800 transition-colors shadow-lg shadow-emerald-700/15"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-28 pb-20 overflow-hidden bg-gradient-to-b from-emerald-50/40 via-white to-transparent">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="z-10 order-2 lg:order-1 space-y-6">
            <div className="flex items-center gap-3">
              <span className="inline-block bg-emerald-100/70 text-emerald-800 px-4 py-1.5 rounded-full font-semibold text-xs tracking-wide uppercase">
                {data.hero.badge || '90-Day Fat Loss Transformation'}
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {data.hero.title}
            </h1>
            
            <p className="text-lg text-slate-600 max-w-xl leading-relaxed">
              {data.hero.description}
            </p>
            
            <div className="pt-2">
              <button 
                onClick={scrollToPricing}
                className="w-full sm:w-auto bg-emerald-600 text-white font-bold text-base px-8 py-4.5 rounded-2xl hover:bg-emerald-700 transition-transform active:scale-95 shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2 group"
              >
                <span>{data.hero.ctaText}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 pt-4 border-t border-slate-100">
              {data.hero.bullets.map((bullet, idx) => (
                <div key={idx} className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{bullet}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative order-1 lg:order-2">
            <div className={`relative z-10 rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-300 ${imageAnimateClass}`} onClick={handleHeroImageClick}>
              <img 
                alt="Fit Couple Transformation" 
                className="w-full aspect-[4/3] object-cover cursor-pointer hover:scale-[1.02] transition-transform duration-500" 
                src={data.hero.imageUrl || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80'} 
              />
              <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur p-4 rounded-2xl flex items-center gap-3.5 shadow-lg border border-white/50">
                <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{data.hero.highlightTitle || 'Real Results'}</p>
                  <p className="font-semibold text-slate-900 text-sm">{data.hero.highlightSubtitle || '90-Day Transformation'}</p>
                </div>
              </div>
            </div>
            {/* Decorative background shapes */}
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-100 rounded-full blur-3xl -z-10 opacity-60"></div>
            <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-teal-100 rounded-full blur-3xl -z-10 opacity-60"></div>
          </div>

        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="py-24 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">The Dilemma</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              {data.problem.title}
            </h2>
            <div className="h-1 w-16 bg-emerald-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.problem.painPoints.map((point, idx) => (
              <div 
                key={idx} 
                className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/10 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-5 group-hover:bg-emerald-100 transition-colors">
                  {renderIcon(point.icon)}
                </div>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {point.text}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-emerald-50/50 rounded-3xl p-8 sm:p-12 border border-emerald-100/50 max-w-4xl mx-auto text-center space-y-4">
            <h3 className="text-2xl font-bold text-slate-900">{data.problem.highlightTitle}</h3>
            <p className="text-slate-600 text-lg leading-relaxed max-w-2xl mx-auto">{data.problem.highlightText1}</p>
            <p className="text-emerald-800 font-bold text-lg max-w-2xl mx-auto">{data.problem.highlightText2}</p>
          </div>
        </div>
      </section>

      {/* Bento Grid: Lean90 System */}
      <section id="system" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">The Framework</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {data.bento.title}
            </h2>
            <p className="text-slate-500 text-lg">{data.bento.description}</p>
          </div>

          {/* Dynamic Bento Box Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {data.bento.items.map((item, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-3xl p-4 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group h-full"
              >
                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 mb-4 flex-shrink-0">
                  <img 
                    src={item.imageUrl} 
                    alt={item.badge} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="px-2 pb-2 flex flex-col justify-between flex-1">
                  <div>
                    <span className="inline-block bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full mb-2">
                      {item.badge}
                    </span>
                    <p className="text-slate-600 text-xs font-medium leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* What's Included */}
      <section id="included" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">Deep Dive</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {data.included.title}
            </h2>
            <p className="text-slate-500 text-lg">{data.included.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.included.cards.map((card, idx) => (
              <div 
                key={idx} 
                className="group p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:border-emerald-200 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-6 text-emerald-700 group-hover:scale-110 transition-transform">
                  {renderIcon(card.icon)}
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">{card.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed">{card.description}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Bonuses Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-3xl mx-auto px-6">
          
          <div className="text-center mb-16 space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">Exclusive Value Add</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {data.bonuses.title}
            </h2>
            <p className="text-slate-500 text-md">{data.bonuses.description}</p>
          </div>

          <div className="space-y-4">
            {data.bonuses.items.map((bonus, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-400 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-700">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{bonus.label}</p>
                    <h5 className="font-bold text-slate-800 text-sm">{bonus.title}</h5>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Value</p>
                  <p className="font-extrabold text-emerald-600 text-sm">{bonus.value}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Testimonials / Results */}
      <section id="results" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">Social Proof</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {data.results.title}
            </h2>
            <p className="text-slate-500 text-lg">{data.results.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {data.results.testimonials.map((test, idx) => (
              <div 
                key={idx} 
                className="rounded-3xl border border-slate-100 bg-slate-50 p-8 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-500 mb-4">
                    {[...Array(test.stars)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-700 italic leading-relaxed mb-6">
                    {test.comment}
                  </p>
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">{test.name}</p>
                  <p className="text-xs text-slate-500">{test.details}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Pricing CTA */}
      <section id="pricing" className="py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 sm:p-16 relative overflow-hidden shadow-2xl border border-slate-800 text-center">
            
            {/* Ambient gradients */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/30 blur-[120px] rounded-full"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/30 blur-[120px] rounded-full"></div>
            </div>

            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>{data.pricing.valueBadge}</span>
              </div>
              
              <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                {data.pricing.header}
              </h2>
              
              <div className="text-emerald-400 font-extrabold text-7xl sm:text-8xl leading-none tracking-tight py-4">
                {data.pricing.price}
              </div>
              
              <div className="max-w-md mx-auto">
                <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-base py-5 rounded-2xl hover:scale-[1.02] transition-transform active:scale-98 shadow-xl shadow-emerald-500/20">
                  {data.pricing.ctaText}
                </button>
              </div>

              <div className="flex flex-wrap justify-center gap-4 text-xs text-slate-400 pt-4">
                {data.pricing.badges.map((b, i) => (
                  <div key={i} className="flex items-center gap-1.5 rounded-full bg-white/5 px-4 py-2 border border-white/5">
                    {i === 0 ? <Lock className="w-3.5 h-3.5 text-emerald-500" /> : <Bolt className="w-3.5 h-3.5 text-emerald-500" />}
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-3xl mx-auto px-6">
          
          <div className="text-center mb-16 space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">Got Questions?</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {data.faq.title}
            </h2>
            <p className="text-slate-500 text-lg">{data.faq.description}</p>
          </div>

          <div className="space-y-4">
            {data.faq.items.map((item, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={idx} className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/50">
                  <button 
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors font-semibold text-slate-800 text-sm"
                    onClick={() => toggleFaq(idx)}
                  >
                    <span>{item.question}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="p-6 pt-0 text-slate-600 text-sm leading-relaxed border-t border-slate-100 bg-white">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-white py-12 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center text-center space-y-6">
            <img 
              alt="Logo" 
              className="w-16 h-16 object-contain rounded-full bg-white/5 p-2" 
              src={data.footer.logoUrl || 'https://i.ibb.co/zWNjs1sf/image-from-https-lean90-preview-preview-emergentagent-com-healthdecod-logo.png'} 
            />
            
            <div className="flex gap-6 text-xs text-slate-400">
              <a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a>
              <span className="text-slate-700">•</span>
              <a href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</a>
              <span className="text-slate-700">•</span>
              <a href="#" className="hover:text-emerald-400 transition-colors">Refund Policy</a>
            </div>
            
            <p className="text-xs text-slate-500">
              {data.footer.copyright}
            </p>
          </div>
        </div>
      </footer>

      {/* Floating CTA */}
      <div className={`fixed bottom-8 right-8 z-30 transition-all duration-500 ${stickyCtaVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-20 opacity-0 scale-90 pointer-events-none'}`}>
        <button 
          onClick={scrollToPricing}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6 py-4 rounded-full shadow-2xl flex items-center gap-2 group transition-all"
        >
          <span>Get Lean90 Now</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

    </div>
  );
}
