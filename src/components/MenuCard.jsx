import { useState } from 'react';

export default function MenuCard({ item, onAdd }) {
  const [preferences, setPreferences] = useState('');
  const [added, setAdded] = useState(false);
  const [showNote, setShowNote] = useState(false);

  const handleAdd = () => {
    onAdd(item, preferences);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm mb-3 border border-slate-100 hover:border-orange-200 hover:shadow-md transition-all">
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-800">{item.name}</h3>
          <p className="text-orange-500 font-bold mt-1">₹{item.price}</p>
        </div>
        <button onClick={handleAdd}
          className={`shrink-0 px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-sm ${
            added
              ? 'bg-green-500 text-white shadow-green-100'
              : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-100'
          }`}>
          {added ? '✓ Added' : '+ Add'}
        </button>
      </div>

      <button onClick={() => setShowNote(!showNote)}
        className="text-xs text-slate-400 hover:text-orange-500 mt-2 transition-colors">
        {showNote ? '▲ Hide note' : '✏️ Add special request'}
      </button>

      {showNote && (
        <input
          className="w-full border border-slate-200 rounded-xl p-2.5 mt-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-200"
          placeholder="e.g. No onion, less spicy, extra sauce..."
          value={preferences}
          onChange={e => setPreferences(e.target.value)}
          autoFocus
        />
      )}
    </div>
  );
}