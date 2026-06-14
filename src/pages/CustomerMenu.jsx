import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth, signInAnonymously } from '../firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import LoadingScreen from '../components/LoadingScreen';

export default function CustomerMenu() {
  const { restaurantId, tableNumber } = useParams();
  const navigate = useNavigate();
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [preferences, setPreferences] = useState({});
  const [showPrefFor, setShowPrefFor] = useState(null);
  const [addedItems, setAddedItems] = useState({});
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);
  const [visibleItems, setVisibleItems] = useState({});
  const itemRefs = useRef({});

  useEffect(() => {
    signInAnonymously(auth);
    fetchMenu();
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisibleItems(prev => ({ ...prev, [entry.target.dataset.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );
    Object.values(itemRefs.current).forEach(ref => {
      if (ref) observer.observe(ref);
    });
    return () => observer.disconnect();
  }, [menu, activeCategory]);

  const fetchMenu = async () => {
    setPageLoading(true);

    // Check cache first — load instantly if available
    const cacheKey = `menu_${restaurantId}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const items = JSON.parse(cached);
      setMenu(items);
      const firstCat = [...new Set(items.map(i => i.category))][0];
      setActiveCategory(firstCat);
      setPageLoading(false);
      return;
    }

    // No cache — fetch from Firebase
    const snapshot = await getDocs(collection(db, `restaurants/${restaurantId}/menu`));
    const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    setMenu(items);

    // Save to cache for next time
    sessionStorage.setItem(cacheKey, JSON.stringify(items));

    const firstCat = [...new Set(items.map(i => i.category))][0];
    setActiveCategory(firstCat);
    setPageLoading(false);
  };

  const showToastMessage = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const categories = [...new Set(menu.map(i => i.category))];

  const getQty = (itemId) => {
    const found = cart.find(c => c.id === itemId);
    return found ? found.quantity : 0;
  };

  const addToCart = (item) => {
    const pref = preferences[item.id] || '';
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) return prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { ...item, preferences: pref, quantity: 1 }];
    });
    setAddedItems(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => setAddedItems(prev => ({ ...prev, [item.id]: false })), 800);
    setCartBounce(true);
    setTimeout(() => setCartBounce(false), 500);
    showToastMessage(`${item.name} added to order`);
  };

  const removeFromCart = (itemId) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === itemId);
      if (existing?.quantity === 1) return prev.filter(c => c.id !== itemId);
      return prev.map(c => c.id === itemId ? { ...c, quantity: c.quantity - 1 } : c);
    });
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const placeOrder = async () => {
    if (cart.length === 0) return alert("Your cart is empty!");
    if (!customerName.trim()) return alert("Please enter your name!");
    setLoading(true);
    try {
      const orderRef = await addDoc(collection(db, 'orders'), {
        restaurantId,
        tableNumber: Number(tableNumber),
        customerName,
        items: cart,
        status: 'pending',
        createdAt: new Date(),
      });
      navigate(`/order-status/${orderRef.id}`);
    } catch (e) {
      alert("Error placing order. Try again.");
    }
    setLoading(false);
  };

  if (pageLoading) return <LoadingScreen message="Loading menu..." />;

  return (
    <div className="min-h-screen text-white font-sans pb-40"
      style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #0d0d0d 100%)' }}>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes toastIn {
          0%   { opacity: 0; transform: translateX(-50%) translateY(12px); }
          15%  { opacity: 1; transform: translateX(-50%) translateY(0); }
          85%  { opacity: 1; transform: translateX(-50%) translateY(0); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-8px); }
        }
        @keyframes cartPop {
          0%,100% { transform: scale(1); }
          40%     { transform: scale(1.25); }
          70%     { transform: scale(0.92); }
        }
        @keyframes checkPop {
          0%   { transform: scale(0) rotate(-10deg); opacity: 0; }
          60%  { transform: scale(1.2) rotate(3deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes shimmerMove {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(249,115,22,0.15); }
          50%       { box-shadow: 0 0 35px rgba(249,115,22,0.35); }
        }
        .fade-slide-up  { animation: fadeSlideUp 0.5s cubic-bezier(.22,.68,0,1.2) forwards; }
        .scale-in       { animation: scaleIn 0.4s cubic-bezier(.22,.68,0,1.2) forwards; }
        .toast-anim     { animation: toastIn 2s ease forwards; }
        .cart-pop       { animation: cartPop 0.5s cubic-bezier(.22,.68,0,1.2); }
        .check-pop      { animation: checkPop 0.4s cubic-bezier(.22,.68,0,1.2) forwards; }
        .glow-pulse     { animation: glowPulse 2.5s ease-in-out infinite; }
        .item-hidden    { opacity: 0; transform: translateY(20px); }
        .item-visible   { animation: fadeSlideUp 0.5s cubic-bezier(.22,.68,0,1.2) forwards; }
        .shimmer {
          background: linear-gradient(90deg, transparent 0%, rgba(249,115,22,0.08) 50%, transparent 100%);
          background-size: 400px 100%;
          animation: shimmerMove 2.5s infinite;
        }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-6 left-1/2 z-[100] toast-anim pointer-events-none"
          style={{ transform: 'translateX(-50%)' }}>
          <div className="bg-[#1a1a1a] border border-orange-500/30 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 whitespace-nowrap backdrop-blur-sm">
            <span className="text-orange-400">✓</span>
            {toastMsg}
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="relative overflow-hidden px-5 pt-12 pb-8"
        style={{ background: 'linear-gradient(180deg, #1a1a1a 0%, transparent 100%)' }}>

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(249,115,22,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />

        {/* Glow orb */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #f97316 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-start gap-3">
              <button onClick={() => window.history.back()}
                className="mt-1 w-9 h-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all hover:border-orange-500/40 backdrop-blur-sm">
                <span className="text-white/70 text-base">←</span>
              </button>
              <div className="fade-slide-up">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div>
                  <p className="text-orange-400/80 text-xs font-semibold uppercase tracking-widest">Table {tableNumber}</p>
                </div>
                <h1 className="text-4xl font-black text-white leading-none tracking-tight">Our<br/>
                  <span style={{ background: 'linear-gradient(135deg, #f97316, #fb923c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Menu
                  </span>
                </h1>
                <p className="text-white/30 text-sm mt-2 font-medium">Crafted fresh, served with care</p>
              </div>
            </div>

            {/* Cart Button */}
            {cart.length > 0 && (
              <button onClick={() => setShowCart(true)}
                className={`relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${cartBounce ? 'cart-pop' : ''} glow-pulse`}
                style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                <span className="text-xl">🛒</span>
                <span className="absolute -top-1.5 -right-1.5 bg-white text-orange-600 text-xs font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg">
                  {totalItems}
                </span>
              </button>
            )}
          </div>

          {/* Name Input */}
          <div className="relative fade-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm font-medium">👤</div>
            <input
              className="w-full rounded-2xl pl-10 pr-4 py-4 text-white text-sm font-medium placeholder-white/20 focus:outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(10px)',
              }}
              onFocus={e => {
                e.target.style.border = '1px solid rgba(249,115,22,0.5)';
                e.target.style.background = 'rgba(249,115,22,0.05)';
              }}
              onBlur={e => {
                e.target.style.border = '1px solid rgba(255,255,255,0.08)';
                e.target.style.background = 'rgba(255,255,255,0.04)';
              }}
              placeholder="Your name to place order..."
              value={customerName}
              onChange={e => setCustomerName(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="sticky top-0 z-30 px-5 py-3"
        style={{ background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex gap-2 overflow-x-auto pb-0.5">
          {categories.map((cat, i) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              style={{ animationDelay: `${i * 0.06}s` }}
              className={`shrink-0 px-5 py-2 rounded-xl text-sm font-bold transition-all fade-slide-up ${
                activeCategory === cat
                  ? 'text-white scale-105'
                  : 'text-white/40 hover:text-white/70'
              }`}
              style={{
                background: activeCategory === cat
                  ? 'linear-gradient(135deg, #f97316, #ea580c)'
                  : 'rgba(255,255,255,0.04)',
                border: activeCategory === cat
                  ? 'none'
                  : '1px solid rgba(255,255,255,0.06)',
                boxShadow: activeCategory === cat ? '0 4px 15px rgba(249,115,22,0.3)' : 'none',
              }}>
              {cat || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Section label */}
      <div className="px-5 pt-6 pb-3 fade-slide-up">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }}></div>
          <span className="text-white/20 text-xs font-bold uppercase tracking-widest">{activeCategory}</span>
          <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }}></div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-5 space-y-3">
        {menu.filter(i => i.category === activeCategory).map((item, index) => {
          const qty = getQty(item.id);
          const isAdded = addedItems[item.id];
          const isVisible = visibleItems[item.id];
          return (
            <div
              key={item.id}
              ref={el => itemRefs.current[item.id] = el}
              data-id={item.id}
              className={`rounded-2xl overflow-hidden transition-all duration-300 cursor-default
                ${isVisible ? 'item-visible' : 'item-hidden'}`}
              style={{
                animationDelay: `${index * 0.07}s`,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.border = '1px solid rgba(249,115,22,0.2)';
                e.currentTarget.style.background = 'rgba(249,115,22,0.04)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>

              <div className="flex items-center gap-4 p-4">
                {/* Food Image */}
                <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 relative"
                  style={{ background: 'rgba(255,255,255,0.04)' }}>
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">🍽️</div>
                  )}
                  {/* Shimmer overlay */}
                  <div className="absolute inset-0 shimmer opacity-0 hover:opacity-100 transition-opacity"></div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-base leading-snug mb-1">{item.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-lg"
                      style={{ background: 'linear-gradient(135deg, #f97316, #fb923c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      ₹{item.price}
                    </span>
                    {item.category && (
                      <span className="text-xs text-white/25 font-medium">{item.category}</span>
                    )}
                  </div>
                </div>

                {/* Add / Qty Control */}
                {qty === 0 ? (
                  <button onClick={() => addToCart(item)}
                    className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-black text-xl transition-all active:scale-90 hover:scale-110"
                    style={{
                      background: isAdded
                        ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                        : 'linear-gradient(135deg, #f97316, #ea580c)',
                      boxShadow: isAdded
                        ? '0 4px 15px rgba(34,197,94,0.3)'
                        : '0 4px 15px rgba(249,115,22,0.3)',
                    }}>
                    {isAdded
                      ? <span className="check-pop text-white text-base">✓</span>
                      : <span className="text-white text-xl font-black">+</span>
                    }
                  </button>
                ) : (
                  <div className="shrink-0 flex items-center gap-1 rounded-xl overflow-hidden scale-in"
                    style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                    <button onClick={() => removeFromCart(item.id)}
                      className="w-9 h-9 flex items-center justify-center font-black text-white text-lg hover:bg-black/10 transition-colors active:scale-90">
                      −
                    </button>
                    <span className="text-white font-black text-sm w-5 text-center">{qty}</span>
                    <button onClick={() => addToCart(item)}
                      className="w-9 h-9 flex items-center justify-center font-black text-white text-lg hover:bg-black/10 transition-colors active:scale-90">
                      +
                    </button>
                  </div>
                )}
              </div>

              {/* Special Request */}
              <div className="px-4 pb-3">
                <button onClick={() => setShowPrefFor(showPrefFor === item.id ? null : item.id)}
                  className="text-xs font-semibold transition-all flex items-center gap-1.5 group"
                  style={{ color: showPrefFor === item.id ? '#f97316' : 'rgba(255,255,255,0.2)' }}>
                  <span className="transition-transform group-hover:rotate-12">✏️</span>
                  <span>{showPrefFor === item.id ? 'Hide note' : 'Add special request'}</span>
                </button>
                {showPrefFor === item.id && (
                  <input
                    className="w-full mt-2 px-3 py-2.5 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none transition-all scale-in"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(249,115,22,0.3)',
                    }}
                    placeholder="e.g. No onion, less spicy..."
                    value={preferences[item.id] || ''}
                    onChange={e => {
                      setPreferences(prev => ({ ...prev, [item.id]: e.target.value }));
                      setCart(prev => prev.map(c => c.id === item.id ? { ...c, preferences: e.target.value } : c));
                    }}
                    autoFocus />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cart Drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 backdrop-blur-sm"
            style={{ background: 'rgba(0,0,0,0.75)' }}
            onClick={() => setShowCart(false)} />
          <div className="relative rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto scale-in"
            style={{
              background: 'linear-gradient(180deg, #1c1c1c 0%, #141414 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderBottom: 'none',
            }}>

            {/* Handle */}
            <div className="w-10 h-1 rounded-full mx-auto mb-6"
              style={{ background: 'rgba(255,255,255,0.15)' }} />

            <h2 className="font-black text-2xl text-white mb-1">Your Order</h2>
            <p className="text-white/30 text-sm mb-6">{totalItems} item{totalItems > 1 ? 's' : ''} · Table {tableNumber}</p>

            <div className="space-y-2 mb-6">
              {cart.map((item, i) => (
                <div key={i}
                  className="flex justify-between items-center rounded-2xl px-4 py-3 fade-slide-up"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    animationDelay: `${i * 0.05}s`
                  }}>
                  <div className="flex items-center gap-3">
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={item.name}
                        className="w-10 h-10 rounded-xl object-cover shrink-0" />
                    )}
                    <div>
                      <p className="font-bold text-white text-sm">{item.quantity}× {item.name}</p>
                      {item.preferences && (
                        <p className="text-xs mt-0.5 font-medium" style={{ color: '#f97316' }}>{item.preferences}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white font-bold text-sm">₹{item.price * item.quantity}</span>
                    <button onClick={() => removeFromCart(item.id)}
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-900/20 transition-all text-lg leading-none">
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="rounded-2xl p-4 mb-4"
              style={{ background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.12)' }}>
              <div className="flex justify-between items-center">
                <span className="text-white/60 font-semibold text-sm">Order Total</span>
                <span className="font-black text-2xl"
                  style={{ background: 'linear-gradient(135deg, #f97316, #fb923c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  ₹{totalPrice}
                </span>
              </div>
            </div>

            {/* Place Order Button */}
            <button onClick={placeOrder} disabled={loading}
              className="w-full py-4 rounded-2xl font-black text-lg text-white transition-all active:scale-95 disabled:opacity-50"
              style={{
                background: loading ? '#666' : 'linear-gradient(135deg, #f97316, #ea580c)',
                boxShadow: '0 8px 30px rgba(249,115,22,0.4)',
              }}>
              {loading ? '⏳ Placing Order...' : `Place Order — ₹${totalPrice}`}
            </button>
          </div>
        </div>
      )}

      {/* Bottom Cart Bar */}
      {cart.length > 0 && !showCart && (
        <div className="fixed bottom-6 left-4 right-4 z-40 fade-slide-up">
          <button onClick={() => setShowCart(true)}
            className="w-full py-4 rounded-2xl font-black text-base text-white flex justify-between items-center px-5 active:scale-95 transition-all"
            style={{
              background: 'linear-gradient(135deg, #f97316, #ea580c)',
              boxShadow: '0 8px 30px rgba(249,115,22,0.45)',
            }}>
            <span className="bg-white/20 px-3 py-1 rounded-xl text-sm backdrop-blur-sm">
              {totalItems} item{totalItems > 1 ? 's' : ''}
            </span>
            <span>View Order</span>
            <span>₹{totalPrice}</span>
          </button>
        </div>
      )}
    </div>
  );
}