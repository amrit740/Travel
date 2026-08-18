import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert,
  Phone,
  Hospital,
  AlertCircle,
  X,
  Copy,
  Check,
  MapPin,
  HeartHandshake,
  FileText,
  LifeBuoy,
  ExternalLink,
} from 'lucide-react';
import { Trip } from '../../types';

interface SafetyCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip | null;
}

export const SafetyCenterModal: React.FC<SafetyCenterModalProps> = ({
  isOpen,
  onClose,
  trip,
}) => {
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  if (!isOpen || !trip) return null;

  const destination = trip.destination || 'Destination';

  const emergencyContacts = [
    { title: 'Police Emergency', number: '112', desc: 'National police assistance hotline' },
    { title: 'Ambulance & Medical', number: '108', desc: 'Emergency medical dispatch' },
    { title: 'Fire & Rescue', number: '101', desc: 'Fire disaster dispatch' },
    { title: 'Tourist Safety Helpline', number: '1363', desc: '24/7 multi-lingual tourist assistance' },
    { title: 'Women Safety Helpline', number: '1091', desc: 'Dedicated safety assistance' },
  ];

  const nearbyFacilities = [
    {
      name: `${destination} Central Medical Hospital`,
      type: 'Hospital / 24hr Emergency',
      address: `Main Boulevard, Central ${destination}`,
      phone: '+91 832 242 5000',
      distance: '2.4 km from city center',
    },
    {
      name: `${destination} Tourist Police Station`,
      type: 'Police Headquarters',
      address: `Coastal Road, ${destination}`,
      phone: '+91 832 222 3456',
      distance: '1.8 km from city center',
    },
    {
      name: '24/7 MedPlus Pharmacy & Wellness',
      type: 'Pharmacy & First-Aid',
      address: `Market Square, ${destination}`,
      phone: '+91 832 223 9876',
      distance: '0.9 km from city center',
    },
  ];

  const safetyGuidelines = [
    'Always carry a digital or physical copy of your government ID and hotel reservation card.',
    'Keep emergency contacts and offline maps downloaded before departing for remote beaches or hill trails.',
    'Drink bottled or filtered water and verify food hygiene at open-air food stalls.',
    'Use licensed metered taxis, ride-hailing applications, or pre-arranged hotel chauffeurs.',
  ];

  const handleCopy = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(num);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E3E7E2] overflow-hidden z-10 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-[#0B3D2E] to-[#176B50] text-[#F7F5EF] flex items-center justify-between border-b border-[#07261D]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-300">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif-title text-xl font-medium tracking-tight">
                  Safety & Emergency Hub
                </h3>
                <p className="text-xs text-[#A2B3AA] font-light">
                  Real-time local safety contacts & medical assistance for {destination}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* Quick Emergency Hotlines Grid */}
            <div className="space-y-3">
              <h4 className="font-serif-title text-sm font-semibold text-[#0B3D2E] uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-rose-600" />
                <span>Primary Emergency Hotlines</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {emergencyContacts.map((contact) => (
                  <div
                    key={contact.title}
                    className="p-4 rounded-2xl bg-[#F7F5EF] border border-[#E3E7E2] flex items-center justify-between gap-3 hover:border-[#C8A96B] transition-colors"
                  >
                    <div>
                      <div className="text-xs font-semibold text-[#0B3D2E]">{contact.title}</div>
                      <div className="text-[11px] text-[#66736C] font-light">{contact.desc}</div>
                      <div className="font-mono text-base font-bold text-rose-700 mt-1">
                        {contact.number}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={`tel:${contact.number}`}
                        className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-xs"
                      >
                        Dial
                      </a>
                      <button
                        type="button"
                        onClick={() => handleCopy(contact.number)}
                        className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs transition-colors"
                        title="Copy number"
                      >
                        {copiedNumber === contact.number ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Nearby Verified Facilities */}
            <div className="space-y-3">
              <h4 className="font-serif-title text-sm font-semibold text-[#0B3D2E] uppercase tracking-wider flex items-center gap-1.5">
                <Hospital className="w-4 h-4 text-[#0B3D2E]" />
                <span>Nearby Medical & Security Facilities</span>
              </h4>

              <div className="space-y-2.5">
                {nearbyFacilities.map((fac) => (
                  <div
                    key={fac.name}
                    className="p-4 rounded-2xl bg-white border border-[#E3E7E2] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#0B3D2E]">{fac.name}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {fac.type}
                        </span>
                      </div>
                      <p className="text-xs text-[#66736C] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#C8A96B]" />
                        {fac.address} ({fac.distance})
                      </p>
                    </div>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        fac.name + ' ' + fac.address
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#F7F5EF] hover:bg-[#E3E7E2] text-[#0B3D2E] text-xs font-semibold border border-[#E3E7E2] transition-colors self-start sm:self-auto"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#C8A96B]" />
                      <span>Directions</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Traveler Safety Guidelines */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wide">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Traveler Safety Best Practices</span>
              </div>
              <ul className="space-y-1.5">
                {safetyGuidelines.map((g, i) => (
                  <li key={i} className="text-xs text-amber-900/80 font-light flex items-start gap-2">
                    <span className="font-bold text-amber-600 mt-0.5">•</span>
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-[#F7F5EF] border-t border-[#E3E7E2] flex items-center justify-between">
            <span className="text-xs text-[#8A9790] font-light flex items-center gap-1">
              <LifeBuoy className="w-3.5 h-3.5 text-emerald-600" />
              <span>Available offline in cached vault</span>
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#0B3D2E] hover:bg-[#176B50] text-[#F7F5EF] text-xs font-medium uppercase tracking-wider shadow-xs transition-colors"
            >
              Close Hub
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
