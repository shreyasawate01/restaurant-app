import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

export default function QRCodeGenerator({ restaurantId, tableNumber }) {
  const canvasRef = useRef(null);
  const url = `${window.location.origin}/menu/${restaurantId}/${tableNumber}`;

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 130,
        margin: 2,
        color: {
          dark: '#1e293b',
          light: '#ffffff',
        },
      });
    }
  }, [url]);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center hover:border-orange-300 hover:shadow-md transition-all">
      <div className="w-full bg-orange-500 rounded-xl py-2 mb-3 text-center">
        <p className="text-white font-bold text-sm tracking-wide">TABLE {tableNumber}</p>
      </div>
      <div className="p-2 bg-white border-2 border-slate-100 rounded-xl">
        <canvas ref={canvasRef} />
      </div>
      <p className="text-xs text-slate-400 mt-3 text-center break-all leading-relaxed px-1">{url}</p>
      <button onClick={() => window.print()}
        className="mt-3 w-full text-xs bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold px-3 py-2 rounded-xl transition-colors border border-slate-200">
        🖨️ Print QR
      </button>
    </div>
  );
}