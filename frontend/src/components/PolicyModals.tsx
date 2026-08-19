import React from 'react';
import { X, FileText, AlertCircle, ShoppingCart, ShieldCheck } from 'lucide-react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

export type PolicyType = 'terms' | 'refund' | 'privacy' | 'dmca' | 'reseller' | 'how-it-works' | null;

interface PolicyModalsProps {
  activePolicy: PolicyType;
  onClose: () => void;
}

export const PolicyModals: React.FC<PolicyModalsProps> = ({ activePolicy, onClose }) => {
  useBodyScrollLock(Boolean(activePolicy));

  if (!activePolicy) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="white-card bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl relative p-6 sm:p-8 space-y-6"
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
                <h3 className="text-xl font-extrabold text-slate-900">Seller & Sourcing Disclosure</h3>
                <p className="text-xs text-slate-500">Business Model & Source Transparency</p>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
              <p>
                <strong>Systum OTT India</strong> operates as both a direct digital subscription facilitator and secondary-market license aggregator.
              </p>
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">How We Source Subscriptions:</h4>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Global Digital Marketplaces:</strong> We acquire legitimate retail keys, regional passes, and gift activations from verified global distributors.
                </li>
                <li>
                  <strong>Corporate & Multi-seat Volume Licenses:</strong> We procure high-volume enterprise and educational seats that are distributed to individual subscribers.
                </li>
                <li>
                  <strong>Group & Family Organizers:</strong> We organize private slots in authorized family streaming plans (e.g. Spotify, YouTube Premium, Netflix Multi-Screen) ensuring every user receives an isolated profile with dedicated PIN security.
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Warranty, Refund & Replacement Policy */}
        {activePolicy === 'refund' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Warranty, Replacement & Refund Policy</h3>
                <p className="text-xs text-slate-500">Covered vs Non-Warranty Subscriptions</p>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
              
              {/* Category 1: Warranty Products */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-slate-800 space-y-2">
                <h4 className="font-extrabold text-emerald-900 text-sm flex items-center gap-1.5">
                  <span>🛡️</span> Covered Products — 100% Full-Term Replacement Warranty
                </h4>
                <p className="text-xs text-slate-700">
                  All standard subscriptions (e.g., Netflix, Amazon Prime Video, Disney+ Hotstar, Spotify Premium, YouTube Premium, Canva Pro) that list <strong>Replacement Warranty</strong> in their product details are 100% covered for the entire duration of your purchased validity.
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700">
                  <li><strong>Fast-Track Replacement:</strong> If credentials stop working or face access issues, our WhatsApp team will troubleshoot or replace your login within 15–30 minutes of reporting.</li>
                  <li><strong>Full-Term Validity:</strong> If a plan is for 30, 90, or 365 days, warranty coverage remains active for the full period.</li>
                </ul>
              </div>

              {/* Category 2: Non-Warranty Products */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-slate-800 space-y-2">
                <h4 className="font-extrabold text-amber-900 text-sm flex items-center gap-1.5">
                  <span>⚠️</span> Non-Warranty / As-Is Digital Products
                </h4>
                <p className="text-xs text-slate-700">
                  Certain promotional clearance codes, one-time trial keys, student activation credits, or items explicitly labeled as <em>"No Warranty"</em> or <em>"As-Is"</em> do not include recurring replacement after initial delivery and successful first-time activation.
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700">
                  <li>Initial activation is guaranteed (if a key fails on first redemption, we will replace it immediately upon receipt).</li>
                  <li>After successful initial verification, non-warranty items are non-refundable and non-replaceable.</li>
                </ul>
              </div>

              {/* How to Claim */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">How to Claim a Replacement:</h4>
                <ol className="list-decimal pl-5 space-y-1 text-xs">
                  <li>Message our official WhatsApp helpline at <strong>+91 93060 22703</strong>.</li>
                  <li>Provide your numeric <strong>Order ID (e.g. #45432)</strong> and screenshot/description of the issue.</li>
                  <li>Our support team will verify and dispatch new working credentials right away.</li>
                </ol>
              </div>

              {/* Void Conditions */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-rose-700">Conditions That Void Warranty:</h4>
                <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
                  <li>Attempting to change master email or password on shared profile accounts.</li>
                  <li>Exceeding the allowed concurrent device limit specified in your plan.</li>
                  <li>Reselling or sharing private screen PINs with unauthorized third parties.</li>
                </ul>
              </div>

              {/* Refunds */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Refund Policy:</h4>
                <p className="text-xs">
                  If our team cannot resolve a technical issue with a warranty-covered product within 24 hours of reporting, a pro-rated or full refund will be sent directly to your original UPI account.
                </p>
              </div>

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
              <p>By placing an order on Systum OTT India, you agree to the following terms:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Subscriptions are intended for personal, household, and educational use.</li>
                <li>For shared profile subscriptions, users must only access their assigned PIN-locked profile.</li>
                <li>Digital credentials are delivered via WhatsApp / Email. No physical goods are shipped.</li>
                <li>Each order receives a unique numeric Order ID (`#XXXXX`) which serves as proof of purchase and warranty reference.</li>
                <li>Warranty applicability is clearly stated on each subscription page (Warranty Covered vs Non-Warranty).</li>
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
                <p className="text-xs text-slate-500">Independent Seller Notice</p>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
              <p>
                <strong>Systum OTT India</strong> operates as an independent digital subscription facilitator, group-subscription organizer, and retail key seller.
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
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-colors"
          >
            I Understand & Close
          </button>
        </div>

      </div>
    </div>
  );
};
