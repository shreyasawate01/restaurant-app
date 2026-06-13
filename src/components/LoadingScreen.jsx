export default function LoadingScreen({ message = "Loading..." }) {
  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center">
      {/* Animated Logo */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-3xl bg-orange-500 flex items-center justify-center shadow-2xl shadow-orange-900/50 animate-bounce">
          <span className="text-5xl">🍽️</span>
        </div>
        {/* Rotating ring */}
        <div className="absolute inset-0 rounded-3xl border-4 border-orange-500/20 border-t-orange-500 animate-spin"></div>
      </div>

      {/* Food emoji parade */}
      <div className="flex gap-4 mb-8">
        {['🍗', '🍕', '🍜', '🍱', '🍛'].map((emoji, i) => (
          <span key={i} className="text-2xl animate-bounce"
            style={{ animationDelay: `${i * 0.15}s`, animationDuration: '1s' }}>
            {emoji}
          </span>
        ))}
      </div>

      {/* Brand */}
      <h1 className="text-white font-black text-2xl mb-2">TableServe</h1>
      <p className="text-gray-500 text-sm">{message}</p>

      {/* Loading bar */}
      <div className="mt-6 w-48 h-1 bg-[#2a2a2a] rounded-full overflow-hidden">
        <div className="h-full bg-orange-500 rounded-full animate-pulse"
          style={{ width: '60%' }}></div>
      </div>
    </div>
  );
}