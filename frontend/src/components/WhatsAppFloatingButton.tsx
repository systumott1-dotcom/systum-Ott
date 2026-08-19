import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { WHATSAPP_PHONE } from '../context/CartContext';

export const WhatsAppFloatingButton: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(true);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-end gap-3 pointer-events-auto">
      {/* Tooltip speech bubble */}
      {showTooltip && (
        <div className="hidden sm:flex items-center gap-2 bg-white border border-slate-200 text-slate-800 text-xs font-semibold px-3.5 py-2 rounded-2xl shadow-xl animate-in fade-in slide-in-from-right-4 duration-300 relative">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Need help? Chat on <strong>+91 93060 22703</strong></span>
          <button
            onClick={() => setShowTooltip(false)}
            className="text-slate-400 hover:text-slate-700 ml-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Action Button */}
      <a
        href={`https://wa.me/${WHATSAPP_PHONE}?text=Hello!+I+need+assistance+with+a+subscription+order.`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white flex items-center justify-center shadow-2xl shadow-emerald-500/40 hover:scale-110 active:scale-95 transition-all duration-300 relative group"
      >
        {/* Pulsing ring */}
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-30"></span>
        <MessageCircle className="w-7 h-7 text-white group-hover:rotate-12 transition-transform duration-300" />
      </a>
    </div>
  );
};
