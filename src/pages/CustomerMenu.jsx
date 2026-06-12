import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth, signInAnonymously } from '../firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import MenuCard from '../components/MenuCard';

export default function CustomerMenu() {
  const { restaurantId, tableNumber } = useParams();
  const navigate = useNavigate();
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    signInAnonymously(auth);
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    const snapshot = await getDocs(collection(db, `restaurants/${restaurantId}/menu`));
    setMenu(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const addToCart = (item, preferences) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id && c.preferences === preferences);
      if (existing) {
        return prev.map(c => c.id === item.id && c.preferences === preferences
          ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { ...item, preferences, quantity: 1 }];
    });
  };

  const removeFromCart = (index) => {
    setCart(prev => prev.filter((_, i) => i !== index));
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

  const categories = [...new Set(menu.map(i => i.category))];

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-36">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-800">🍽️ Our Menu</h1>
            <p className="text-xs text-slate-400 mt-0.5">Table {tableNumber}</p>
          </div>
          {cart.length > 0 && (
            <div className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
              {totalItems} in cart
            </div>
          )}
        </div>
        {/* Name input */}
        <input
          className="w-full mt-3 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-slate-50"
          placeholder="Enter your name to place order..."
          value={customerName}
          onChange={e => setCustomerName(e.target.value)} />
      </div>

      {/* Menu */}
      <div className="px-4 pt-4">
        {menu.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <p className="text-4xl mb-3">🍽️</p>
            <p>Loading menu...</p>
          </div>
        )}
        {categories.map(cat => (
          <div key={cat} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="font-bold text-slate-700">{cat || 'Menu'}</h2>
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="text-xs text-slate-400">{menu.filter(i => i.category === cat).length} items</span>
            </div>
            {menu.filter(i => i.category === cat).map(item => (
              <MenuCard key={item.id} item={item} onAdd={addToCart} />
            ))}
          </div>
        ))}
      </div>

      {/* Cart Footer */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-2xl">
          <button onClick={() => setShowCart(!showCart)}
            className="w-full flex justify-between items-center px-5 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-lg">🛒</span>
              <span className="font-bold text-slate-700">{totalItems} item{totalItems > 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-orange-500">₹{totalPrice}</span>
              <span className="text-slate-400 text-sm">{showCart ? '▼' : '▲'}</span>
            </div>
          </button>

          {showCart && (
            <div className="max-h-44 overflow-y-auto px-5 py-2 bg-slate-50">
              {cart.map((item, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                  <div>
                    <span className="text-sm font-semibold text-slate-700">{item.quantity}× {item.name}</span>
                    {item.preferences && <p className="text-xs text-orange-500 mt-0.5">{item.preferences}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-500">₹{item.price * item.quantity}</span>
                    <button onClick={() => removeFromCart(i)} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="px-5 py-3">
            <button onClick={placeOrder} disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white py-3.5 rounded-2xl font-bold text-base transition-colors shadow-lg shadow-orange-200">
              {loading ? '⏳ Placing Order...' : '✅ Place Order — ₹' + totalPrice}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}