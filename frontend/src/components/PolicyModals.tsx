import React from 'react';
import { X, FileText, AlertCircle, RefreshCw, ShoppingCart } from 'lucide-react';

export type PolicyType = 'terms' | 'refund' | 'privacy' | 'dmca' | 'reseller' | 'how-it-works' | null;

interface PolicyModalsProps {
  activePolicy: PolicyType;
  onClose: () => void;
}

export const PolicyModals: React.FC<PolicyModalsProps> = ({ activePolicy, onClose }) => {
  if (!activePolicy) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="white-card bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl relative p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Reseller & Sourcing Model Disclosure */}
        {activePolicy === 'reseller' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Seller & Reseller Disclosure</h3>
                <p className="text-xs text-slate-500">Business Model & Source Transparency</p>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
              <p>
                <strong>Systum OTT India</strong> operates as both a direct seller of digital facilitation services and an authorized secondary-market license aggregator.
              </p>
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">How We Source Subscriptions:</h4>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Global Digital Marketplaces:</strong> We acquire legitimate retail keys, regional passes, and gift activations from verified global marketplaces such as <em>Eneba, Gamivo, Kinguin</em>, and authorized global key distributors.
                </li>
                <li>
                  <strong>Corporate & Multi-seat Volume Licenses:</strong> We procure high-volume enterprise and educational seats (e.g. Adobe Creative Cloud, MS Office 365, Canva Pro) that are legally distributed to individual subscribers.
                </li>
                <li>
                  <strong>Group & Family Organizers:</strong> We organize and manage private slots in authorized family streaming plans (e.g. Spotify Family, YouTube Premium, Netflix Multi-Screen) ensuring every user receives an isolated profile with dedicated PIN security.
                </li>
                <li>
                  <strong>100% Replacement Warranty:</strong> Because we curate licenses only from established suppliers, every purchase is backed by our direct WhatsApp support replacement warranty for its entire validity period.
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Refund Policy */}
        {activePolicy === 'refund' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Refund & Replacement Policy</h3>
                <p className="text-xs text-slate-500">100% Full-Term Replacement Warranty</p>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
              <p>
                At <strong>Systum OTT India</strong>, customer satisfaction is our top priority. We offer a comprehensive replacement guarantee across all subscriptions:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Replacement Guarantee:</strong> If any subscription credentials, screen login, or license encounters an issue during the validity period, we will troubleshoot or replace it within 15 minutes of receiving your WhatsApp message.
                </li>
                <li>
                  <strong>Refunds:</strong> If a technical issue cannot be resolved by our support team within 24 hours of reporting, a pro-rated or full refund will be initiated via original UPI transfer.
                </li>
                <li>
                  <strong>Non-Eligible Cases:</strong> Violations of account terms (such as changing master passwords on shared screens, sharing private screens with unauthorized third parties) void the warranty.
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Terms of Service */}
        {activePolicy === 'terms' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center border border-brand-200">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Terms of Service</h3>
                <p className="text-xs text-slate-500">Rules & Usage Guidelines</p>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
              <p>By placing an order on Systum OTT, you agree to the following terms:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Subscriptions are intended for personal and educational use.</li>
                <li>For shared profile subscriptions, users must only access their designated profile and not alter account email or master security settings.</li>
                <li>Credentials are delivered digitally via WhatsApp/Email. Physical goods are not shipped.</li>
                <li>All prices listed are in Indian Rupees (INR) and are inclusive of digital service facilitation.</li>
              </ul>
            </div>
          </div>
        )}

        {/* DMCA & Trademark Disclaimer */}
        {(activePolicy === 'dmca' || activePolicy === 'privacy') && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center border border-cyan-200">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">DMCA & Trademark Disclaimer</h3>
                <p className="text-xs text-slate-500">Independent Reseller Notice</p>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
              <p>
                <strong>Systum OTT India</strong> operates as an independent digital subscription facilitator, group-subscription organizer, and retail licensee.
              </p>
              <p>
                All product names, logos, brands, and registered trademarks (e.g. Netflix, Amazon Prime, Disney+ Hotstar, Adobe, Spotify, Canva, Microsoft, ChatGPT) mentioned on this website are the property of their respective trademark holders.
              </p>
              <p>
                The use of these names, logos, and brands does not imply endorsement, affiliation, or direct partnership unless explicitly stated.
              </p>
              <p>
                If you believe any content on our platform infringes upon your copyright or intellectual property, please contact us at <span className="text-brand-700 font-mono font-bold">support@systumott.in</span> with relevant verification details, and we will promptly review and take appropriate action.
              </p>
            </div>
          </div>
        )}

        {/* Close footer */}
        <div className="pt-4 border-t border-slate-100 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-colors"
          >
            I Understand & Close
          </button>
        </div>

      </div>
    </div>
  );
};
