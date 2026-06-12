import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import QRCodeGenerator from '../components/QRCodeGenerator';

const RESTAURANT_ID = "my-restaurant";

export default function AdminDashboard() {
  const [menuItems, setMenuItems] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [tableCount, setTableCount] = useState(5);
  const [activeTab, setActiveTab] = useState('menu');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchMenu(); }, []);

  const fetchMenu = async () => {
    const snapshot = await getDocs(collection(db, `restaurants/${RESTAURANT_ID}/menu`));
    setMenuItems(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const addItem = async () => {
    if (!name || !price) return alert("Please fill in name and price!");
    setLoading(true);
    await addDoc(collection(db, `restaurants/${RESTAURANT_ID}/menu`), {
      name, price: Number(price), category, available: true
    });
    setName(''); setPrice(''); setCategory('');
    await fetchMenu();
    setLoading(false);
  };

  const deleteItem = async (id) => {
    await deleteDoc(doc(db, `restaurants/${RESTAURANT_ID}/menu`, id));
    fetchMenu();
  };

  const categories = [...new Set(menuItems.map(i => i.category).filter(Boolean))];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center text-white text-lg">🍽️</div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 leading-none">TableServe</h1>
            <p className="text-xs text-slate-400 mt-0.5">Restaurant Dashboard</p>
          </div>
        </div>
        <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">● Live</span>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b border-slate-100 px-6 py-3 flex gap-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-slate-800">{menuItems.length}</p>
          <p className="text-xs text-slate-400">Menu Items</p>
        </div>
        <div className="w-px bg-slate-100"></div>
        <div className="text-center">
          <p className="text-2xl font-bold text-slate-800">{tableCount}</p>
          <p className="text-xs text-slate-400">Tables</p>
        </div>
        <div className="w-px bg-slate-100"></div>
        <div className="text-center">
          <p className="text-2xl font-bold text-slate-800">{categories.length}</p>
          <p className="text-xs text-slate-400">Categories</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-5 pb-0 flex gap-2">
        {['menu', 'qr'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab
                ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                : 'bg-white text-slate-500 border border-slate-200 hover:border-orange-300'
            }`}>
            {tab === 'menu' ? '🍴 Menu Items' : '📱 QR Codes'}
          </button>
        ))}
      </div>

      <div className="p-6 max-w-4xl mx-auto">
        {activeTab === 'menu' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Add Item Form */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <h2 className="font-bold text-slate-700 mb-4 text-base">Add New Item</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Item Name</label>
                  <input
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent"
                    placeholder="e.g. Butter Chicken"
                    value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Price (₹)</label>
                  <input
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent"
                    placeholder="e.g. 280"
                    type="number" value={price} onChange={e => setPrice(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Category</label>
                  <input
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent"
                    placeholder="e.g. Main Course, Drinks"
                    value={category} onChange={e => setCategory(e.target.value)} />
                </div>
                <button onClick={addItem} disabled={loading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold text-sm transition-colors shadow-md shadow-orange-100 mt-1">
                  {loading ? 'Adding...' : '+ Add to Menu'}
                </button>
              </div>
            </div>

            {/* Menu List */}
            <div>
              <h2 className="font-bold text-slate-700 mb-3 text-base">
                Current Menu
                <span className="ml-2 text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{menuItems.length} items</span>
              </h2>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {menuItems.length === 0 && (
                  <div className="text-center py-10 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                    <p className="text-3xl mb-2">🍽️</p>
                    <p className="text-sm">No items yet. Add your first dish!</p>
                  </div>
                )}
                {menuItems.map(item => (
                  <div key={item.id} className="bg-white rounded-xl px-4 py-3 border border-slate-100 flex justify-between items-center hover:border-orange-200 transition-colors">
                    <div>
                      <p className="font-semibold text-slate-700 text-sm">{item.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-orange-500 font-bold text-sm">₹{item.price}</span>
                        {item.category && <span className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{item.category}</span>}
                      </div>
                    </div>
                    <button onClick={() => deleteItem(item.id)}
                      className="text-xs text-red-400 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors font-medium">
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'qr' && (
          <div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-5 flex items-center gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Number of Tables</label>
                <input type="number" value={tableCount} min={1} max={50}
                  onChange={e => setTableCount(Number(e.target.value))}
                  className="border border-slate-200 rounded-xl p-2.5 w-24 text-center font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-300" />
              </div>
              <div className="text-sm text-slate-400 pt-4">
                Each QR code links directly to that table's menu
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: tableCount }, (_, i) => (
                <QRCodeGenerator key={i + 1} restaurantId={RESTAURANT_ID} tableNumber={i + 1} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}