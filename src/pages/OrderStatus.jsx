import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const STEPS = ['pending', 'preparing', 'ready', 'served'];

const STEP_INFO = {
  pending:   { emoji: '📋', label: 'Order Received',  desc: 'Your order has been sent to the kitchen!', color: 'text-amber-500' },
  preparing: { emoji: '👨‍🍳', label: 'Being Prepared', desc: 'The chef is cooking your food right now!', color: 'text-blue-500' },
  ready:     { emoji: '🔔', label: 'Ready to Serve!', desc: 'Your food is ready — waiter is on the way!', color: 'text-green-500' },
  served:    { emoji: '🍽️', label: 'Enjoy your meal!', desc: 'Your food has been served. Bon appétit!', color: 'text-purple-500' },
};

export default function OrderStatus() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'orders', orderId), (d) => {
      if (d.exists()) setOrder(d.data());
    });
    return () => unsubscribe();
  }, [orderId]);

  if (!order) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="text-4xl mb-3 animate-pulse">⏳</div>
        <p className="text-slate-400">Loading your order...</p>
      </div>
    </div>
  );

  const currentStep = STEPS.indexOf(order.status);
  const info = STEP_INFO[order.status];
  const total = order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-5 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center text-white">🍽️</div>
          <div>
            <h1 className="font-bold text-slate-800">Order Status</h1>
            <p className="text-xs text-slate-400">Table {order.tableNumber} · {order.customerName}</p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-5 space-y-4">
        {/* Big Status Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 text-center">
          <div className="text-5xl mb-3">{info.emoji}</div>
          <h2 className={`text-2xl font-bold ${info.color}`}>{info.label}</h2>
          <p className="text-slate-500 text-sm mt-2">{info.desc}</p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
          <h3 className="font-bold text-slate-600 text-sm mb-3 uppercase tracking-wide">Progress</h3>
          {STEPS.map((step, i) => (
            <div key={step} className="flex items-center gap-3 py-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all
                ${i < currentStep ? 'bg-green-500 text-white' :
                  i === currentStep ? 'bg-orange-500 text-white shadow-md shadow-orange-200' :
                  'bg-slate-100 text-slate-400'}`}>
                {i < currentStep ? '✓' : STEP_INFO[step].emoji}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-semibold ${
                  i === currentStep ? 'text-orange-500' :
                  i < currentStep ? 'text-green-500' : 'text-slate-400'}`}>
                  {STEP_INFO[step].label}
                </p>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-px h-4 ml-4 ${i < currentStep ? 'bg-green-300' : 'bg-slate-200'}`}></div>
              )}
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
          <h3 className="font-bold text-slate-600 text-sm mb-3 uppercase tracking-wide">Your Order</h3>
          <div className="space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between items-start py-2 border-b border-slate-50 last:border-0">
                <div>
                  <p className="text-sm font-semibold text-slate-700">{item.quantity}× {item.name}</p>
                  {item.preferences && (
                    <p className="text-xs text-orange-400 mt-0.5">Note: {item.preferences}</p>
                  )}
                </div>
                <span className="text-sm font-bold text-slate-600">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-slate-100 mt-2">
            <span className="font-bold text-slate-700">Total</span>
            <span className="font-bold text-orange-500 text-lg">₹{total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}