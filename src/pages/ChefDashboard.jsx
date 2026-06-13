import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import LoadingScreen from '../components/LoadingScreen';

const STATUS_STYLES = {
  pending:  { border: 'border-amber-400',  bg: 'bg-amber-50',  badge: 'bg-amber-100 text-amber-700',  label: 'New Order' },
  preparing:{ border: 'border-blue-400',   bg: 'bg-blue-50',   badge: 'bg-blue-100 text-blue-700',    label: 'Cooking' },
  ready:    { border: 'border-green-400',  bg: 'bg-green-50',  badge: 'bg-green-100 text-green-700',  label: 'Ready' },
};

export default function ChefDashboard() {
  const { restaurantId } = useParams();
  const [orders, setOrders] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const q = query(
      collection(db, 'orders'),
      where('restaurantId', '==', restaurantId),
      where('status', 'in', ['pending', 'preparing', 'ready'])
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => a.createdAt?.seconds - b.createdAt?.seconds);
      setOrders(data);
      setTimeout(() => setPageLoading(false), 1500);
    });
    return () => unsubscribe();
  }, [restaurantId]);

  const updateStatus = async (orderId, newStatus) => {
    await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
  };

  const pending = orders.filter(o => o.status === 'pending');
  const preparing = orders.filter(o => o.status === 'preparing');
  const ready = orders.filter(o => o.status === 'ready');

  if (pageLoading) return <LoadingScreen message="Loading kitchen display..." />;

  return (
    <div className="min-h-screen bg-[#0f0f0f] font-sans">
      {/* Header */}
      <div className="bg-[#1a1a1a] border-b border-[#2a2a2a] px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">

          {/* Back Button */}
          <button onClick={() => window.history.back()}
            className="w-9 h-9 bg-[#2a2a2a] hover:bg-[#333] rounded-xl flex items-center justify-center transition-colors shrink-0">
            <span className="text-white text-lg">←</span>
          </button>

          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-orange-900/50">👨‍🍳</div>
          <div>
            <h1 className="text-white font-black text-lg leading-none">Kitchen Display</h1>
            <p className="text-gray-500 text-xs mt-0.5">{currentTime.toLocaleTimeString()}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="text-center bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2">
            <p className="text-amber-400 font-black text-xl leading-none">{pending.length}</p>
            <p className="text-amber-400 text-xs mt-0.5">New</p>
          </div>
          <div className="text-center bg-blue-500/10 border border-blue-500/30 rounded-xl px-3 py-2">
            <p className="text-blue-400 font-black text-xl leading-none">{preparing.length}</p>
            <p className="text-blue-400 text-xs mt-0.5">Cooking</p>
          </div>
          <div className="text-center bg-green-500/10 border border-green-500/30 rounded-xl px-3 py-2">
            <p className="text-green-400 font-black text-xl leading-none">{ready.length}</p>
            <p className="text-green-400 text-xs mt-0.5">Ready</p>
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-96 text-gray-600">
          <p className="text-5xl mb-4">🎉</p>
          <p className="text-xl font-black text-gray-400">All caught up!</p>
          <p className="text-sm mt-1 text-gray-600">No pending orders right now</p>
        </div>
      ) : (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map(order => {
            const s = STATUS_STYLES[order.status];
            return (
              <div key={order.id} className={`border-2 ${s.border} ${s.bg} rounded-2xl p-4 shadow-sm`}>
                {/* Order Header */}
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-slate-700 shadow-sm border border-slate-100">
                      T{order.tableNumber}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{order.customerName}</p>
                      <p className="text-xs text-slate-500">{order.items.length} item(s)</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${s.badge}`}>
                    {s.label}
                  </span>
                </div>

                {/* Divider */}
                <div className="border-t border-white border-opacity-60 my-3"></div>

                {/* Items */}
                <div className="space-y-2 mb-4">
                  {order.items.map((item, i) => (
                    <div key={i} className="bg-white bg-opacity-70 rounded-xl px-3 py-2">
                      <div className="flex justify-between items-center gap-2">
                        {item.imageUrl && (
                          <img src={item.imageUrl} alt={item.name}
                            className="w-8 h-8 rounded-lg object-cover shrink-0" />
                        )}
                        <span className="font-semibold text-slate-700 text-sm flex-1">{item.quantity}× {item.name}</span>
                        <span className="text-slate-500 text-xs shrink-0">₹{item.price * item.quantity}</span>
                      </div>
                      {item.preferences && (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-red-500 text-xs">⚠️</span>
                          <p className="text-red-600 text-xs font-medium">{item.preferences}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                {order.status === 'pending' && (
                  <button onClick={() => updateStatus(order.id, 'preparing')}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-xl font-black text-sm transition-colors shadow-sm active:scale-95">
                    👨‍🍳 Start Cooking
                  </button>
                )}
                {order.status === 'preparing' && (
                  <button onClick={() => updateStatus(order.id, 'ready')}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-xl font-black text-sm transition-colors shadow-sm active:scale-95">
                    ✅ Mark as Ready
                  </button>
                )}
                {order.status === 'ready' && (
                  <button onClick={() => updateStatus(order.id, 'served')}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2.5 rounded-xl font-black text-sm transition-colors shadow-sm active:scale-95">
                    🍽️ Mark as Served
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}