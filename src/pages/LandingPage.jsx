import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const RESTAURANT_ID = "my-restaurant";

export default function LandingPage() {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen font-sans overflow-x-hidden"
      style={{ background: 'linear-gradient(135deg, #1a0f0a 0%, #2d1810 30%, #1a0f0a 70%, #0f0a06 100%)' }}>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33%      { transform: translateY(-15px) rotate(2deg); }
          66%      { transform: translateY(-8px) rotate(-1deg); }
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50%       { background-position: 100% 50%; }
        }
        @keyframes rotateSlow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        .fade-up-1 { animation: fadeUp 0.8s cubic-bezier(.22,.68,0,1.2) 0.1s both; }
        .fade-up-2 { animation: fadeUp 0.8s cubic-bezier(.22,.68,0,1.2) 0.25s both; }
        .fade-up-3 { animation: fadeUp 0.8s cubic-bezier(.22,.68,0,1.2) 0.4s both; }
        .fade-up-4 { animation: fadeUp 0.8s cubic-bezier(.22,.68,0,1.2) 0.55s both; }
        .fade-up-5 { animation: fadeUp 0.8s cubic-bezier(.22,.68,0,1.2) 0.7s both; }
        .fade-in   { animation: fadeIn 1.2s ease 0.2s both; }
        .float     { animation: floatSlow 6s ease-in-out infinite; }
        .float-2   { animation: floatSlow 8s ease-in-out 1s infinite; }
        .float-3   { animation: floatSlow 7s ease-in-out 2s infinite; }
        .gradient-text {
          background: linear-gradient(135deg, #f5e6c8, #e8c99a, #d4a96a, #e8c99a, #f5e6c8);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradientShift 4s ease infinite;
        }
        .card-hover {
          transition: all 0.4s cubic-bezier(.22,.68,0,1.2);
        }
        .card-hover:hover {
          transform: translateY(-8px) scale(1.02);
        }
        .btn-glow {
          position: relative;
          overflow: hidden;
        }
        .btn-glow::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -60%;
          width: 40%;
          height: 200%;
          background: rgba(255,255,255,0.15);
          transform: skewX(-20deg);
          transition: left 0.6s ease;
        }
        .btn-glow:hover::before {
          left: 120%;
        }
      `}</style>

      {/* Background texture */}
      <div className="fixed inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4a96a' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

      {/* Ambient glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(212,169,106,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <div className="fixed bottom-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(180,100,50,0.1) 0%, transparent 70%)', filter: 'blur(40px)' }} />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between fade-in"
        style={{ background: 'rgba(15,8,4,0.7)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(212,169,106,0.1)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
            style={{ background: 'linear-gradient(135deg, #d4a96a, #b8863a)' }}>
            ☕
          </div>
          <span className="font-black text-lg" style={{ color: '#f5e6c8' }}>Fort Cafe</span>
        </div>
        <button
          onClick={() => navigate(`/menu/${RESTAURANT_ID}/1`)}
          className="text-sm font-bold px-4 py-2 rounded-xl transition-all hover:scale-105 active:scale-95"
          style={{
            background: 'rgba(212,169,106,0.15)',
            border: '1px solid rgba(212,169,106,0.3)',
            color: '#d4a96a'
          }}>
          View Menu →
        </button>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-10 relative">

        {/* Floating food emojis */}
        <div className="absolute top-32 left-8 text-4xl float opacity-20">🍛</div>
        <div className="absolute top-48 right-10 text-3xl float-2 opacity-20">☕</div>
        <div className="absolute bottom-40 left-12 text-3xl float-3 opacity-20">🍕</div>
        <div className="absolute bottom-52 right-8 text-4xl float opacity-20">🍜</div>
        <div className="absolute top-1/3 left-4 text-2xl float-2 opacity-15">🥗</div>
        <div className="absolute top-1/3 right-4 text-2xl float-3 opacity-15">🍰</div>

        {/* Badge */}
        <div className="fade-up-1 mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest"
            style={{
              background: 'rgba(212,169,106,0.1)',
              border: '1px solid rgba(212,169,106,0.25)',
              color: '#d4a96a'
            }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
            Now Serving · Scan & Order
          </div>
        </div>

        {/* Main heading */}
        <div className="text-center mb-6 fade-up-2">
          <h1 className="font-black leading-none mb-3"
            style={{ fontSize: 'clamp(3rem, 12vw, 7rem)' }}>
            <span className="gradient-text">Fort</span>
            <br />
            <span style={{ color: 'rgba(245,230,200,0.9)' }}>Cafe</span>
          </h1>
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="h-px w-12" style={{ background: 'rgba(212,169,106,0.3)' }}></div>
            <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: 'rgba(212,169,106,0.6)' }}>
              Multi-Cuisine Experience
            </p>
            <div className="h-px w-12" style={{ background: 'rgba(212,169,106,0.3)' }}></div>
          </div>
        </div>

        {/* Tagline */}
        <p className="text-center max-w-sm mb-10 fade-up-3 leading-relaxed"
          style={{ color: 'rgba(245,230,200,0.45)', fontSize: '1rem' }}>
          From the first sip to the last bite — every dish tells a story worth savoring.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs fade-up-4">
          <button
            onClick={() => navigate(`/menu/${RESTAURANT_ID}/1`)}
            className="btn-glow w-full py-4 rounded-2xl font-black text-base transition-all active:scale-95 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #d4a96a, #b8863a)',
              color: '#1a0f0a',
              boxShadow: '0 8px 30px rgba(212,169,106,0.35)',
            }}>
            🍽️ View Our Menu
          </button>
        </div>

        {/* Trust badges */}
        <div className="flex items-center gap-6 mt-10 fade-up-5">
          {[
            { icon: '⚡', label: 'Quick Orders' },
            { icon: '🔥', label: 'Fresh Daily' },
            { icon: '❤️', label: 'Made with Love' },
          ].map(badge => (
            <div key={badge.label} className="flex flex-col items-center gap-1">
              <span className="text-xl">{badge.icon}</span>
              <span className="text-xs font-semibold" style={{ color: 'rgba(212,169,106,0.5)' }}>{badge.label}</span>
            </div>
          ))}
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 fade-in flex flex-col items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(212,169,106,0.3)' }}>Scroll</span>
          <div className="w-5 h-8 rounded-full border flex items-start justify-center p-1"
            style={{ borderColor: 'rgba(212,169,106,0.2)' }}>
            <div className="w-1 h-2 rounded-full animate-bounce" style={{ background: '#d4a96a' }}></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-16">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#d4a96a' }}>Why Fort Cafe</p>
            <h2 className="text-3xl font-black" style={{ color: '#f5e6c8' }}>The Fort Experience</h2>
          </div>

          <div className="space-y-4">
            {[
              {
                icon: '📱',
                title: 'Scan & Order',
                desc: 'Scan the QR code on your table and order directly from your phone. No waiting, no hassle.',
                color: 'rgba(212,169,106,0.08)',
                border: 'rgba(212,169,106,0.15)',
              },
              {
                icon: '⚡',
                title: 'Live Kitchen Updates',
                desc: 'Track your order in real time — from kitchen to table, you always know what\'s happening.',
                color: 'rgba(180,100,50,0.08)',
                border: 'rgba(180,100,50,0.15)',
              },
              {
                icon: '✏️',
                title: 'Your Way',
                desc: 'Add special requests to any dish. No onion? Extra spicy? We\'ve got you covered.',
                color: 'rgba(212,169,106,0.08)',
                border: 'rgba(212,169,106,0.15)',
              },
            ].map((feature, i) => (
              <div key={feature.title} className="card-hover rounded-2xl p-5 flex items-start gap-4"
                style={{
                  background: feature.color,
                  border: `1px solid ${feature.border}`,
                }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                  style={{ background: 'rgba(212,169,106,0.1)' }}>
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-black text-base mb-1" style={{ color: '#f5e6c8' }}>{feature.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(245,230,200,0.4)' }}>{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Categories Preview */}
      <section className="px-6 py-10">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#d4a96a' }}>What We Serve</p>
            <h2 className="text-3xl font-black" style={{ color: '#f5e6c8' }}>Something for Everyone</h2>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { emoji: '🍛', label: 'Indian' },
              { emoji: '☕', label: 'Beverages' },
              { emoji: '🍕', label: 'Italian' },
              { emoji: '🍜', label: 'Asian' },
              { emoji: '🥗', label: 'Healthy' },
              { emoji: '🍰', label: 'Desserts' },
            ].map((cat, i) => (
              <div key={cat.label}
                className="card-hover rounded-2xl py-4 flex flex-col items-center gap-2 cursor-pointer"
                style={{
                  background: 'rgba(212,169,106,0.05)',
                  border: '1px solid rgba(212,169,106,0.1)',
                }}
                onClick={() => navigate(`/menu/${RESTAURANT_ID}/1`)}>
                <span className="text-3xl">{cat.emoji}</span>
                <span className="text-xs font-bold" style={{ color: 'rgba(245,230,200,0.5)' }}>{cat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-16">
        <div className="max-w-md mx-auto">
          <div className="rounded-3xl p-8 text-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(212,169,106,0.12) 0%, rgba(180,100,50,0.08) 100%)',
              border: '1px solid rgba(212,169,106,0.2)',
            }}>
            {/* Decorative ring */}
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(212,169,106,0.08) 0%, transparent 70%)' }} />

            <div className="text-5xl mb-4">🍽️</div>
            <h2 className="text-2xl font-black mb-2" style={{ color: '#f5e6c8' }}>
              Ready to Order?
            </h2>
            <p className="text-sm mb-6 leading-relaxed" style={{ color: 'rgba(245,230,200,0.4)' }}>
              Scan the QR code on your table or tap below to browse our full menu.
            </p>
            <button
              onClick={() => navigate(`/menu/${RESTAURANT_ID}/1`)}
              className="btn-glow w-full py-4 rounded-2xl font-black text-base transition-all active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #d4a96a, #b8863a)',
                color: '#1a0f0a',
                boxShadow: '0 8px 30px rgba(212,169,106,0.3)',
              }}>
              Browse Menu →
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 text-center"
        style={{ borderTop: '1px solid rgba(212,169,106,0.08)' }}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center text-sm"
            style={{ background: 'linear-gradient(135deg, #d4a96a, #b8863a)' }}>
            ☕
          </div>
          <span className="font-black text-sm" style={{ color: '#f5e6c8' }}>Fort Cafe</span>
        </div>
        <p className="text-xs" style={{ color: 'rgba(245,230,200,0.2)' }}>
          Crafted with ❤️ · Powered by TableServe
        </p>
      </footer>

    </div>
  );
}