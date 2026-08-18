import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
  X,
  Luggage,
  Sparkles,
  RotateCcw,
  Sun,
} from 'lucide-react';
import { useCurrentTrip } from '../../contexts/TripContext';
import { PackingItem } from '../../types';

interface SmartPackingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SmartPackingModal: React.FC<SmartPackingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentTrip, destinationData, packingList, togglePackingItem, addCustomPackingItem, resetPackingList } = useCurrentTrip();

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState<PackingItem['category']>('Essentials');

  if (!isOpen || !currentTrip) return null;

  const categories: Array<'All' | PackingItem['category']> = [
    'All',
    'Essentials',
    'Clothing',
    'Toiletries',
    'Gear',
    'Documents',
    'Destination',
  ];

  const filteredItems = activeCategory === 'All'
    ? packingList
    : packingList.filter((item) => item.category === activeCategory);

  const packedCount = packingList.filter((item) => item.packed).length;
  const totalCount = packingList.length;
  const progressPct = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0;

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    addCustomPackingItem(customName.trim(), customCategory);
    setCustomName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B3D2E]/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-[#F7F5EF] border border-[#E3E7E2] rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-[#0B3D2E] text-[#F7F5EF] p-6 sm:p-7 relative border-b border-[#C8A96B]/30">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-[#F7F5EF] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-[#C8A96B]/20 border border-[#C8A96B]/40 flex items-center justify-center">
              <Luggage className="w-5 h-5 text-[#C8A96B]" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#C8A96B] font-medium block">
                Destination-Aware Intelligence
              </span>
              <h2 className="font-serif-title text-2xl text-[#F7F5EF] font-medium tracking-tight">
                Smart Packing Masterlist
              </h2>
            </div>
          </div>
          <p className="text-xs text-[#E3E7E2]/80 font-light mt-1">
            Dynamically adapted for {currentTrip.destination}’s coastal weather ({destinationData.best_season || 'Tropical'}), activities, and local regulations.
          </p>

          {/* Progress Bar in Header */}
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-[11px] font-medium mb-1">
                <span className="text-[#C8A96B]">Packed Progress</span>
                <span className="text-[#F7F5EF]">
                  {packedCount} / {totalCount} items ({progressPct}%)
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#C8A96B] h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            <button
              onClick={resetPackingList}
              title="Reset to AI Recommended default"
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-[#E3E7E2] transition-colors text-xs flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="text-[10px] hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-7 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Weather & Climate Tip */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs flex items-center gap-3">
            <Sun className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <span className="font-semibold text-amber-900 block">Climate Advisory: {destinationData.climate || destinationData.best_season || 'Tropical & Coastal'}</span>
              <p className="text-amber-800/80 text-[11px] font-light mt-0.5">
                Expect warm daytime sun. Sunscreen (SPF 50+), UV sunglasses, and breathable linen or cotton are highly advised.
              </p>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-[#0B3D2E] text-[#F7F5EF] shadow-sm'
                    : 'bg-white text-[#66736C] border border-[#E3E7E2] hover:border-[#0B3D2E]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Packing Items List */}
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => togglePackingItem(item.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  item.packed
                    ? 'bg-[#176B50]/5 border-[#176B50]/30 text-[#66736C]'
                    : 'bg-white border-[#E3E7E2] hover:border-[#C8A96B]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors ${
                      item.packed ? 'text-[#176B50]' : 'text-[#66736C]'
                    }`}
                  >
                    {item.packed ? (
                      <CheckSquare className="w-5 h-5" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                  <div>
                    <span
                      className={`text-xs font-medium block ${
                        item.packed ? 'line-through opacity-70 text-[#66736C]' : 'text-[#0B3D2E]'
                      }`}
                    >
                      {item.name}
                    </span>
                    {item.reason && (
                      <span className="text-[10px] text-[#66736C] font-light block">
                        {item.reason}
                      </span>
                    )}
                  </div>
                </div>

                <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#F7F5EF] text-[#66736C] border border-[#E3E7E2] flex-shrink-0">
                  {item.category}
                </span>
              </div>
            ))}
          </div>

          {/* Add Custom Item Form */}
          <form onSubmit={handleAddCustom} className="p-4 rounded-2xl bg-white border border-[#E3E7E2] space-y-3">
            <span className="text-xs font-semibold text-[#0B3D2E] block">Add Custom Item</span>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g., Waterproof action camera, travel pillow..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-[#F7F5EF] border border-[#E3E7E2] text-xs text-[#2C3531] focus:outline-none focus:border-[#0B3D2E]"
              />
              <select
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-[#F7F5EF] border border-[#E3E7E2] text-xs text-[#2C3531] focus:outline-none focus:border-[#0B3D2E]"
              >
                <option value="Essentials">Essentials</option>
                <option value="Clothing">Clothing</option>
                <option value="Toiletries">Toiletries</option>
                <option value="Gear">Gear</option>
                <option value="Documents">Documents</option>
                <option value="Destination">Destination</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#0B3D2E] hover:bg-[#176B50] text-[#F7F5EF] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-[#EAE6DD] p-4 sm:p-5 flex items-center justify-between border-t border-[#E3E7E2]">
          <span className="text-xs text-[#66736C]">
            {progressPct === 100 ? '🎉 Everything packed and ready!' : `${totalCount - packedCount} items remaining`}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#0B3D2E] hover:bg-[#176B50] text-[#F7F5EF] text-xs font-medium transition-colors"
          >
            Save & Done
          </button>
        </div>
      </div>
    </div>
  );
};
