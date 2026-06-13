import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import QRCodeGenerator from '../components/QRCodeGenerator';

const RESTAURANT_ID = "my-restaurant";
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export default function AdminDashboard() {
  const [menuItems, setMenuItems] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [tableCount, setTableCount] = useState(5);
  const [activeTab, setActiveTab] = useState('menu');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  useEffect(() => { fetchMenu(); }, []);

  const fetchMenu = async () => {
    const snapshot = await getDocs(collection(db, `restaurants/${RESTAURANT_ID}/menu`));
    setMenuItems(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async () => {
    if (!imageFile) return null;
    setUploadProgress('Uploading image...');
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('upload_preset', UPLOAD_PRESET);
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    );
    const data = await res.json();
    setUploadProgress('');
    return data.secure_url;
  };

  const addItem = async () => {
    if (!name || !price) return alert("Please fill in name and price!");
    setLoading(true);
    try {
      const imageUrl = await uploadImage();
      await addDoc(collection(db, `restaurants/${RESTAURANT_ID}/menu`), {
        name,
        price: Number(price),
        category,
        imageUrl: imageUrl || null,
        available: true
      });
      setName(''); setPrice(''); setCategory('');
      setImageFile(null); setImagePreview(null);
      await fetchMenu();
    } catch (e) {
      alert("Error adding item. Try again.");
    }
    setLoading(false);
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    await deleteDoc(doc(db, `restaurants/${RESTAURANT_ID}/menu`, id));
    fetchMenu();
  };

  const categories = [...new Set(menuItems.map(i => i.category).filter(Boolean))];

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white font-sans">
      {/* Header */}
      <div className="bg-[#1a1a1a] border-b border-[#2a2a2a] px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-orange-900/50">🍽️</div>
          <div>
            <h1 className="text-lg font-black text-white leading-none">TableServe</h1>
            <p className="text-xs text-gray-500 mt-0.5">Admin Dashboard</p>
          </div>
        </div>
        <span className="text-xs bg-green-900/40 text-green-400 border border-green-800 px-3 py-1 rounded-full font-bold">● Live</span>
      </div>

      {/* Stats */}
      <div className="bg-[#1a1a1a] border-b border-[#2a2a2a] px-6 py-4 flex gap-6">
        {[
          { label: 'Menu Items', value: menuItems.length },
          { label: 'Tables', value: tableCount },
          { label: 'Categories', value: categories.length },
        ].map(stat => (
          <div key={stat.label} className="text-center">
            <p className="text-2xl font-black text-white">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="px-6 pt-5 flex gap-2">
        {[
          { id: 'menu', label: '🍴 Menu Items' },
          { id: 'qr', label: '📱 QR Codes' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-900/50'
                : 'bg-[#1a1a1a] text-gray-400 border border-[#2a2a2a] hover:border-orange-500/50'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6 max-w-5xl mx-auto">
        {activeTab === 'menu' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Add Item Form */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5">
              <h2 className="font-black text-white text-lg mb-4">Add New Item</h2>

              {/* Image Upload */}
              <div className="mb-4">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Food Photo</label>
                <div
                  onClick={() => document.getElementById('imageInput').click()}
                  className="relative w-full h-40 border-2 border-dashed border-[#2a2a2a] rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-orange-500/50 transition-colors overflow-hidden">
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <p className="text-white font-bold text-sm">Change Photo</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="text-3xl mb-2">📷</span>
                      <p className="text-gray-500 text-sm font-semibold">Click to upload food photo</p>
                      <p className="text-gray-600 text-xs mt-1">JPG, PNG up to 5MB</p>
                    </>
                  )}
                </div>
                <input
                  id="imageInput"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden" />
              </div>

              {/* Item Details */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Item Name</label>
                  <input
                    className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors"
                    placeholder="e.g. Butter Chicken"
                    value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Price (₹)</label>
                  <input
                    className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors"
                    placeholder="e.g. 280"
                    type="number" value={price} onChange={e => setPrice(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5">Category</label>
                  <input
                    className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors"
                    placeholder="e.g. Main Course, Drinks, Starters"
                    value={category} onChange={e => setCategory(e.target.value)} />
                </div>

                <button onClick={addItem} disabled={loading}
                  className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white py-3.5 rounded-xl font-black text-sm transition-all shadow-lg shadow-orange-900/40 mt-2 active:scale-95">
                  {loading ? (uploadProgress || 'Adding...') : '+ Add to Menu'}
                </button>
              </div>
            </div>

            {/* Menu List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-black text-white text-lg">Current Menu</h2>
                <span className="text-xs bg-[#1a1a1a] border border-[#2a2a2a] text-gray-400 px-3 py-1 rounded-full font-bold">
                  {menuItems.length} items
                </span>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {menuItems.length === 0 && (
                  <div className="text-center py-16 bg-[#1a1a1a] border border-dashed border-[#2a2a2a] rounded-2xl">
                    <p className="text-4xl mb-3">🍽️</p>
                    <p className="text-gray-500 text-sm font-semibold">No items yet</p>
                    <p className="text-gray-600 text-xs mt-1">Add your first dish!</p>
                  </div>
                )}
                {menuItems.map(item => (
                  <div key={item.id}
                    className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden flex hover:border-orange-500/30 transition-colors">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name}
                        className="w-20 h-20 object-cover shrink-0" />
                    ) : (
                      <div className="w-20 h-20 bg-[#0f0f0f] shrink-0 flex items-center justify-center text-2xl">🍽️</div>
                    )}
                    <div className="flex-1 px-4 py-3 flex justify-between items-center min-w-0">
                      <div className="min-w-0">
                        <p className="font-bold text-white text-sm truncate">{item.name}</p>
                        <p className="text-orange-400 font-black">₹{item.price}</p>
                        {item.category && <p className="text-xs text-gray-600 mt-0.5">{item.category}</p>}
                      </div>
                      <button onClick={() => deleteItem(item.id)}
                        className="shrink-0 ml-3 text-xs text-red-500 hover:text-red-400 hover:bg-red-900/20 px-3 py-1.5 rounded-lg transition-colors font-bold">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'qr' && (
          <div>
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5 mb-5 flex items-center gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Number of Tables</label>
                <input type="number" value={tableCount} min={1} max={50}
                  onChange={e => setTableCount(Number(e.target.value))}
                  className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-2.5 w-24 text-center font-black text-white focus:outline-none focus:border-orange-500 transition-colors" />
              </div>
              <p className="text-gray-600 text-sm pt-5">Each QR links directly to that table's menu</p>
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