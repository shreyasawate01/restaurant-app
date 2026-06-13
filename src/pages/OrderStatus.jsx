import { useState, useEffect, useRef } from 'react';
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

const NOTIFICATION_MESSAGES = {
  preparing: { title: '👨‍🍳 Chef is Cooking!', body: 'Your order is being prepared right now!' },
  ready:     { title: '🔔 Food is Ready!',    body: 'Your food is ready — waiter is bringing it!' },
  served:    { title: '🍽️ Enjoy your meal!',  body: 'Your food has been served. Bon appétit!' },
};

export default function OrderStatus() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [notifGranted, setNotifGranted] = useState(false);
  const prevStatus = useRef(null);

  const requestNotifications = async () => {
    if (window.OneSignalDeferred) {
      window.OneSignalDeferred.push(async function(OneSignal) {
        await OneSignal.Notifications.requestPermission();
        await OneSignal.User.addTag('orderId', orderId);
        setNotifGranted(true);
      });
    }
  };

  useEffect(() => {
    if (window.OneSignalDeferred) {
      window.OneSignalDeferred.push(function(OneSignal) {
        const granted = OneSignal.Notifications.permission;
        setNotifGranted(granted);
      });
    }

    const unsubscribe = onSnapshot(doc(db, 'orders', orderId), (d) => {
      if (d.exists()) {
        const data = d.data();
        if (prevStatus.current && prevStatus.current !== data.status) {
          const msg = NOTIFICATION_MESSAGES[data.status];
          if (msg && Notification.permission === 'granted') {
            new Notification(msg.title, { body: msg.body, icon: '/favicon.svg' });
          }
        }
        prevStatus.current = data.status;
        setOrder(data);
      }
    });
    return () => unsubscribe();
  }, [orderId]);

  if (!order) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
      <div className="text-center">
        <div className="text-4xl mb-3 animate-pulse">⏳</div>
        <p className="text-gray-500">Loading your order...</p>
      </div>
    </div>
  );

  const currentStep = STEPS.indexOf(order.status);
  const info = STEP_INFO[order.status];
  const total = order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white font-sans">

      {/* Header */}
      <div className="bg-[#1a1a1a] border-b border-[#2a2a2a] px-5 py-4">
        <div className="flex items-center gap-3">

          {/* Back Button */}
          <button onClick={() => window.history.back()}
            className="w-9 h-9 bg-[#2a2a2a] hover:bg-[#333] rounded-xl flex items-center justify-center transition-colors shrink-0">
            <span className="text-white text-lg">←</span>
          </button>

          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-orange-900/50">🍽️</div>
          <div>
            <h1 className="font-black text-white text-lg">Order Status</h1>
            <p className="text-xs text-gray-500">Table {order.tableNumber} · {order.customerName}</p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-5 space-y-4">

        {/* Notification Banner */}
        {!notifGranted ? (
          <button onClick={requestNotifications}
            className="w-full bg-[#1a1a1a] border border-orange-500/40 rounded-2xl p-4 flex items-center gap-3 hover:border-orange-500 transition-colors active:scale-95">
            <span className="text-2xl">🔔</span>
            <div className="text-left">
              <p className="font-black text-white text-sm">Enable Notifications</p>
              <p className="text-gray-500 text-xs mt-0.5">Get notified when your food is ready!</p>
            </div>
            <span className="ml-auto text-orange-400 font-bold text-sm shrink-0">Turn On →</span>
          </button>
        ) : (
          <div className="w-full bg-green-900/20 border border-green-800/40 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-black text-green-400 text-sm">Notifications On</p>
              <p className="text-gray-500 text-xs mt-0.5">You'll be notified when your order is ready!</p>
            </div>
          </div>
        )}

        {/* Big Status Card */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 text-center">
          <div className="text-5xl mb-3">{info.emoji}</div>
          <h2 className={`text-2xl font-black ${info.color}`}>{info.label}</h2>
          <p className="text-gray-500 text-sm mt-2">{info.desc}</p>
        </div>

        {/* Progress Steps */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4">
          <h3 className="font-bold text-gray-500 text-xs mb-4 uppercase tracking-widest">Progress</h3>
          {STEPS.map((step, i) => (
            <div key={step} className="flex items-center gap-3 py-2">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0 transition-all
                ${i < currentStep ? 'bg-green-500 text-white' :
                  i === currentStep ? 'bg-orange-500 text-white shadow-lg shadow-orange-900/50' :
                  'bg-[#0f0f0f] text-gray-600 border border-[#2a2a2a]'}`}>
                {i < currentStep ? '✓' : STEP_INFO[step].emoji}
              </div>
              <p className={`text-sm font-bold ${
                i === currentStep ? 'text-orange-400' :
                i < currentStep ? 'text-green-400' : 'text-gray-600'}`}>
                {STEP_INFO[step].label}
              </p>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4">
          <h3 className="font-bold text-gray-500 text-xs mb-4 uppercase tracking-widest">Your Order</h3>
          <div className="space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between items-start py-2 border-b border-[#2a2a2a] last:border-0">
                <div className="flex items-center gap-3">
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover shrink-0" />
                  )}
                  <div>
                    <p className="text-sm font-bold text-white">{item.quantity}× {item.name}</p>
                    {item.preferences && (
                      <p className="text-xs text-orange-400 mt-0.5">Note: {item.preferences}</p>
                    )}
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-400">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-[#2a2a2a] mt-2">
            <span className="font-black text-white">Total</span>
            <span className="font-black text-orange-400 text-xl">₹{total}</span>
          </div>
        </div>

        {/* Add More Items */}
        {order.status !== 'served' && (
          <a href={`/menu/${order.restaurantId}/${order.tableNumber}`}
            className="block w-full bg-[#1a1a1a] border border-[#2a2a2a] hover:border-orange-500/50 text-white py-4 rounded-2xl font-black text-base text-center transition-all active:scale-95">
            + Add More Items to Order
          </a>
        )}

      </div>
    </div>
  );
}