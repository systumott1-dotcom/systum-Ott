import React, { useState } from 'react';
import { X } from 'lucide-react';
import { WHATSAPP_PHONE } from '../context/CartContext';
import { WhatsAppIcon } from './WhatsAppIcon';

interface WhatsAppFloatingButtonProps {
  isElevated?: boolean;
}

export const WhatsAppFloatingButton: React.FC<WhatsAppFloatingButtonProps> = ({ isElevated = false }) => {
  const [showTooltip, setShowTooltip] = useState(true);

  // Fallback auto-detection for product / checkout routes if prop not passed
  const shouldElevate = isElevated || (typeof window !== 'undefined' && (
    window.location.pathname.startsWith('/product') ||
    window.location.pathname.startsWith('/checkout')
  ));

  return (
    <div
      className={`fixed ${
        shouldElevate ? 'bottom-20 sm:bottom-24' : 'bottom-6'
      } right-4 sm:right-6 z-50 flex items-end gap-3 pointer-events-auto transition-all duration-300`}
    >
      {/* Tooltip speech bubble */}
      {showTooltip && (
        <div className="hidden sm:flex items-center gap-2 bg-white border border-slate-200 text-slate-800 text-xs font-semibold px-3.5 py-2 rounded-2xl shadow-xl animate-in fade-in slide-in-from-right-4 duration-300 relative">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Need help? Chat on <strong>+91 93060 22703</strong></span>
          <button
            onClick={() => setShowTooltip(false)}
            className="text-slate-400 hover:text-slate-700 ml-1 cursor-pointer"
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
        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center shadow-2xl shadow-emerald-500/40 hover:scale-110 active:scale-95 transition-all duration-300 relative group cursor-pointer"
      >
        {/* Pulsing ring */}
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-30"></span>
        <WhatsAppIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white fill-white group-hover:rotate-6 transition-transform duration-300" />
      </a>
    </div>
  );
};
