import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth, signInAnonymously } from '../firebase';
import { collection, getDocs, addDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';

export default function CustomerMenu() {
  const { restaurantId, tableNumber, existingOrderId } = useParams();
  const navigate = useNavigate();
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [preferences, setPreferences] = useState({});
  const [showPrefFor, setShowPrefFor] = useState(null);
  const [isAddingMore, setIsAddingMore] = useState(false);

  useEffect(() => {
    signInAnonymously(auth);
    fetchMenu();
    // Check if coming back to add more items
    const savedOrderId = localStorage.getItem(`order_${restaurantId}_${tableNumber}`);
    const savedName = localStorage.getItem(`name_${restaurantId}_${tableNumber}`);
    if (savedOrderId && savedName) {
      setIsAddingMore(true);
      setCustomerName(savedName);
    }
  }, []);

  const fetchMenu = async () => {
    const snapshot = await getDocs(collection(db, `restaurants/${restaurantId}/menu`));
    const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    setMenu(items);
    const firstCat = [...new Set(items.map(i => i.category))][0];
    setActiveCategory(firstCat);
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
      const savedOrderId = localStorage.getItem(`order_${restaurantId}_${tableNumber}`);

      if (isAddingMore && savedOrderId) {
        // Add more items to existing order
        await updateDoc(doc(db, 'orders', savedOrderId), {
          items: arrayUnion(...cart),
          status: 'pending'
        });
        navigate(`/order-status/${savedOrderId}`);
      } else {
        // Place new order
        const orderRef = await addDoc(collection(db, 'orders'), {
          restaurantId,
          tableNumber: Number(tableNumber),
          customerName,
          items: cart,
          status: 'pending',
          createdAt: new Date(),
        });
        // Save order ID so customer can add more later
        localStorage.setItem(`order_${restaurantId}_${tableNumber}`, orderRef.id);
        localStorage.setItem(`name_${restaurantId}_${tableNumber}`, customerName);
        navigate(`/order-status/${orderRef.id}`);
      }
    } catch (e) {
      alert("Error placing order. Try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white font-sans pb-40">

      {/* Header */}
      <div className="relative bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f] px-5 pt-10 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-orange-400 text-xs font-bold uppercase tracking-widest mb-1">Table {tableNumber}</p>
            <h1 className="text-3xl font-black text-white leading-tight">
              {isAddingMore ? 'Add More Items' : 'Our Menu'}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {isAddingMore ? `Adding to ${customerName}'s order` : 'Fresh, made to order'}
            </p>
          </div>
          {cart.length > 0 && (
            <button onClick={() => setShowCart(true)}
              className="relative bg-orange-500 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-900">
              <span className="text-xl">🛒</span>
              <span className="absolute -top-1 -right-1 bg-white text-orange-500 text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            </button>
          )}
        </div>

        {/* Name Input — hide if adding more */}
        {!isAddingMore && (
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">👤</span>
            <input
              className="w-full bg-[#1f1f1f] border border-[#2a2a2a] rounded-2xl pl-10 pr-4 py-3.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors"
              placeholder="Your name to place order..."
              value={customerName}
              onChange={e => setCustomerName(e.target.value)} />
          </div>
        )}
      </div>

      {/* Category Pills */}
      <div className="sticky top-0 z-20 bg-[#0f0f0f] border-b border-[#1a1a1a] px-5 py-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeCategory === cat
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-900'
                  : 'bg-[#1a1a1a] text-gray-400 border border-[#2a2a2a]'
              }`}>
              {cat || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-5 pt-5 space-y-3">
        {menu.filter(i => i.category === activeCategory).map(item => {
          const qty = getQty(item.id);
          return (
            <div key={item.id}
              className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden transition-all hover:border-orange-500/30">

              {/* Food Photo */}
              {item.imageUrl && (
                <div className="w-full h-44 overflow-hidden">
                  <img src={item.imageUrl} alt={item.name}
                    className="w-full h-full object-cover" />
                </div>
              )}

              <div className="p-4">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-white text-base">{item.name}</h3>
                    <p className="text-orange-400 font-black text-xl mt-1">₹{item.price}</p>
                  </div>

                  {/* Quantity Control */}
                  {qty === 0 ? (
                    <button onClick={() => addToCart(item)}
                      className="shrink-0 bg-orange-500 hover:bg-orange-400 text-white font-black px-5 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-orange-900/50 active:scale-95">
                      ADD
                    </button>
                  ) : (
                    <div className="shrink-0 flex items-center gap-2 bg-orange-500 rounded-xl overflow-hidden">
                      <button onClick={() => removeFromCart(item.id)}
                        className="w-9 h-9 flex items-center justify-center font-black text-white text-lg hover:bg-orange-400 transition-colors">
                        −
                      </button>
                      <span className="text-white font-black text-sm w-4 text-center">{qty}</span>
                      <button onClick={() => addToCart(item)}
                        className="w-9 h-9 flex items-center justify-center font-black text-white text-lg hover:bg-orange-400 transition-colors">
                        +
                      </button>
                    </div>
                  )}
                </div>

                {/* Special Request */}
                <button onClick={() => setShowPrefFor(showPrefFor === item.id ? null : item.id)}
                  className="text-xs text-gray-600 hover:text-orange-400 mt-2 transition-colors flex items-center gap-1">
                  <span>{showPrefFor === item.id ? '▲' : '✏️'}</span>
                  <span>Special request</span>
                </button>
                {showPrefFor === item.id && (
                  <input
                    className="w-full mt-2 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors"
                    placeholder="e.g. No onion, extra spicy..."
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
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowCart(false)} />
          <div className="relative bg-[#1a1a1a] rounded-t-3xl border-t border-[#2a2a2a] p-5 max-h-[80vh] overflow-y-auto">
            <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto mb-5" />
            <h2 className="font-black text-xl text-white mb-1">
              {isAddingMore ? 'Adding to Order' : 'Your Order'}
            </h2>
            {isAddingMore && (
              <p className="text-orange-400 text-sm mb-4">These will be added to your existing order</p>
            )}

            <div className="space-y-3 mb-5 mt-4">
              {cart.map((item, i) => (
                <div key={i} className="flex justify-between items-center bg-[#0f0f0f] rounded-xl px-4 py-3">
                  <div>
                    <p className="font-bold text-white text-sm">{item.quantity}× {item.name}</p>
                    {item.preferences && <p className="text-orange-400 text-xs mt-0.5">{item.preferences}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white font-bold text-sm">₹{item.price * item.quantity}</span>
                    <button onClick={() => removeFromCart(item.id)}
                      className="text-gray-600 hover:text-red-400 transition-colors text-lg leading-none">×</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-[#2a2a2a] pt-4 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-semibold">Total</span>
                <span className="text-orange-400 font-black text-2xl">₹{totalPrice}</span>
              </div>
            </div>

            <button onClick={placeOrder} disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white py-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-orange-900/50 active:scale-95">
              {loading ? '⏳ Placing...' : isAddingMore ? `Add to Order — ₹${totalPrice}` : `Place Order — ₹${totalPrice}`}
            </button>
          </div>
        </div>
      )}

      {/* Bottom Cart Bar */}
      {cart.length > 0 && !showCart && (
        <div className="fixed bottom-6 left-4 right-4 z-40">
          <button onClick={() => setShowCart(true)}
            className="w-full bg-orange-500 text-white py-4 rounded-2xl font-black text-base shadow-2xl shadow-orange-900/60 flex justify-between items-center px-5 active:scale-95 transition-all">
            <span className="bg-orange-400 px-2.5 py-1 rounded-lg text-sm">{totalItems} items</span>
            <span>{isAddingMore ? 'Add to Order' : 'View Cart'}</span>
            <span className="font-black">₹{totalPrice}</span>
          </button>
        </div>
      )}
    </div>
  );
}