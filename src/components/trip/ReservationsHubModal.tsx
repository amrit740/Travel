import React, { useState, useRef } from 'react';
import {
  Ticket,
  X,
  Plus,
  Building2,
  Plane,
  Car,
  Utensils,
  Camera,
  Download,
  Trash2,
  CheckCircle2,
  Calendar,
  DollarSign,
  FileText,
  Upload,
  Paperclip,
} from 'lucide-react';
import { useCurrentTrip } from '../../contexts/TripContext';
import { formatCurrency } from '../../lib/utils';
import { Reservation } from '../../types';

interface ReservationsHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReservationsHubModal: React.FC<ReservationsHubModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentTrip, reservations, addReservation, removeReservation } = useCurrentTrip();

  const [isAdding, setIsAdding] = useState(false);
  const [category, setCategory] = useState<Reservation['category']>('Hotel');
  const [title, setTitle] = useState('');
  const [provider, setProvider] = useState('');
  const [date, setDate] = useState(currentTrip?.start_date || '');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState(currentTrip?.destination || '');
  const [confirmationNumber, setConfirmationNumber] = useState('');
  const [cost, setCost] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<Array<{ name: string; url: string; size?: string }>>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !currentTrip) return null;

  const handleFileUpload = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      const sizeStr = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;
      setAttachedFiles((prev) => [
        ...prev,
        {
          name: file.name,
          url,
          size: sizeStr,
        },
      ]);
    };
    reader.readAsDataURL(file);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addReservation({
      category,
      title: title.trim(),
      provider: provider.trim() || 'Direct Provider',
      date: date || currentTrip.start_date || '2026-11-15',
      time: time || 'Confirmed',
      location: location.trim() || currentTrip.destination,
      confirmation_number: confirmationNumber.trim() || `TW-${Math.floor(100000 + Math.random() * 900000)}`,
      cost: Number(cost) || 0,
      currency: currentTrip.currency || 'INR',
      status: 'confirmed',
      notes: notes.trim(),
      attachments: attachedFiles,
    });

    setTitle('');
    setProvider('');
    setConfirmationNumber('');
    setCost(0);
    setNotes('');
    setAttachedFiles([]);
    setIsAdding(false);
  };

  const getCategoryIcon = (cat: Reservation['category']) => {
    switch (cat) {
      case 'Flight':
        return <Plane className="w-4 h-4 text-sky-600" />;
      case 'Hotel':
        return <Building2 className="w-4 h-4 text-[#176B50]" />;
      case 'Transport':
        return <Car className="w-4 h-4 text-amber-600" />;
      case 'Restaurant':
        return <Utensils className="w-4 h-4 text-rose-600" />;
      case 'Experience':
      default:
        return <Camera className="w-4 h-4 text-[#C8A96B]" />;
    }
  };

  const totalCommitted = reservations.reduce((acc, r) => acc + (r.cost || 0), 0);

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
              <Ticket className="w-5 h-5 text-[#C8A96B]" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#C8A96B] font-medium block">
                Centralized Booking Ledger
              </span>
              <h2 className="font-serif-title text-2xl text-[#F7F5EF] font-medium tracking-tight">
                Reservations & Pass Vault
              </h2>
            </div>
          </div>
          <p className="text-xs text-[#E3E7E2]/80 font-light mt-1">
            Track flights, luxury boutique stays, beach shack reservations, and activity permits for {currentTrip.destination}.
          </p>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-[#C8A96B] font-medium">
              {reservations.length} Active Booking{reservations.length === 1 ? '' : 's'}
            </span>
            <span className="text-[#F7F5EF]">
              Committed Total: <span className="font-serif-title font-bold text-[#C8A96B]">{formatCurrency(totalCommitted, currentTrip.currency)}</span>
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-7 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#0B3D2E] uppercase tracking-wider">
              Confirmed Vouchers & Passes
            </span>
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="px-3.5 py-1.5 rounded-full bg-[#0B3D2E] hover:bg-[#176B50] text-[#F7F5EF] text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAdding ? 'Cancel' : 'Add Reservation'}</span>
            </button>
          </div>

          {/* Add Reservation Form */}
          {isAdding && (
            <form onSubmit={handleCreate} className="p-5 rounded-2xl bg-white border border-[#E3E7E2] space-y-4 animate-fade-in">
              <h4 className="text-xs font-semibold text-[#0B3D2E]">New Booking Entry</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#66736C] block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F7F5EF] border border-[#E3E7E2] text-xs text-[#2C3531] focus:outline-none focus:border-[#0B3D2E]"
                  >
                    <option value="Hotel">Hotel / Luxury Stay</option>
                    <option value="Flight">Flight / Air Ticket</option>
                    <option value="Restaurant">Restaurant Table</option>
                    <option value="Experience">Experience / Pass</option>
                    <option value="Transport">Transport / Scooter Rental</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-[#66736C] block mb-1">Title / Description</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Taj Holiday Village Deluxe Villa"
                    className="w-full px-3 py-2 rounded-xl bg-[#F7F5EF] border border-[#E3E7E2] text-xs text-[#2C3531] focus:outline-none focus:border-[#0B3D2E]"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#66736C] block mb-1">Provider / Airline / Hotel</label>
                  <input
                    type="text"
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    placeholder="e.g. IndiGo Airlines / Marriott"
                    className="w-full px-3 py-2 rounded-xl bg-[#F7F5EF] border border-[#E3E7E2] text-xs text-[#2C3531] focus:outline-none focus:border-[#0B3D2E]"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#66736C] block mb-1">Confirmation / PNR</label>
                  <input
                    type="text"
                    value={confirmationNumber}
                    onChange={(e) => setConfirmationNumber(e.target.value)}
                    placeholder="e.g. 6E-849204"
                    className="w-full px-3 py-2 rounded-xl bg-[#F7F5EF] border border-[#E3E7E2] text-xs text-[#2C3531] focus:outline-none focus:border-[#0B3D2E]"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#66736C] block mb-1">Date & Time</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="e.g. 2026-11-15 at 02:00 PM"
                    className="w-full px-3 py-2 rounded-xl bg-[#F7F5EF] border border-[#E3E7E2] text-xs text-[#2C3531] focus:outline-none focus:border-[#0B3D2E]"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#66736C] block mb-1">Cost ({currentTrip.currency})</label>
                  <input
                    type="number"
                    value={cost || ''}
                    onChange={(e) => setCost(Number(e.target.value))}
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-xl bg-[#F7F5EF] border border-[#E3E7E2] text-xs text-[#2C3531] focus:outline-none focus:border-[#0B3D2E]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[#66736C] block mb-1">Notes / Instructions</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Show confirmation QR at check-in desk"
                  className="w-full px-3 py-2 rounded-xl bg-[#F7F5EF] border border-[#E3E7E2] text-xs text-[#2C3531] focus:outline-none focus:border-[#0B3D2E]"
                />
              </div>

              {/* Upload Document / PDF / Ticket Attachment */}
              <div className="space-y-2">
                <label className="text-[11px] text-[#66736C] block">
                  Attach Ticket / PDF / Voucher (Optional)
                </label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleFileUpload(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-3.5 rounded-xl border-2 border-dashed transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isDragging
                      ? 'border-[#0B3D2E] bg-[#0B3D2E]/10'
                      : 'border-[#E3E7E2] hover:border-[#0B3D2E]/50 bg-[#F7F5EF]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#0B3D2E]/10 text-[#0B3D2E] flex items-center justify-center">
                      <Upload className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-medium text-[#0B3D2E]">
                        Drag & drop voucher or click to upload
                      </p>
                      <p className="text-[10px] text-[#66736C]">PDF, PNG, JPG files up to 10MB</p>
                    </div>
                  </div>
                  <Paperclip className="w-4 h-4 text-[#66736C]" />
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />

                {/* Attached files list */}
                {attachedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {attachedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-[#0B3D2E]/5 border border-[#0B3D2E]/20 text-[11px] text-[#0B3D2E] flex items-center gap-2"
                      >
                        <FileText className="w-3 h-3 text-[#C8A96B]" />
                        <span className="font-medium truncate max-w-[150px]">{file.name}</span>
                        {file.size && <span className="text-[9px] text-[#66736C]">({file.size})</span>}
                        <button
                          type="button"
                          onClick={() => setAttachedFiles((prev) => prev.filter((_, i) => i !== idx))}
                          className="text-rose-500 hover:text-rose-700 ml-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 rounded-xl bg-transparent hover:bg-black/5 text-xs text-[#66736C]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0B3D2E] hover:bg-[#176B50] text-[#F7F5EF] text-xs font-medium"
                >
                  Save Reservation
                </button>
              </div>
            </form>
          )}

          {/* Reservations List */}
          <div className="space-y-3">
            {reservations.map((res) => (
              <div
                key={res.id}
                className="p-4 rounded-2xl bg-white border border-[#E3E7E2] shadow-sm hover:border-[#C8A96B]/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#F7F5EF] border border-[#E3E7E2] flex items-center justify-center flex-shrink-0 mt-0.5">
                    {getCategoryIcon(res.category)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-semibold text-[#0B3D2E]">{res.title}</h4>
                      <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-medium">
                        {res.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#66736C] font-light mt-0.5">
                      {res.provider} • {res.time} • {res.location}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-[#66736C]">
                      <span>
                        PNR / Ref: <strong className="text-[#0B3D2E] font-mono">{res.confirmation_number}</strong>
                      </span>
                      {res.notes && <span>• {res.notes}</span>}
                    </div>

                    {/* Attached files badge */}
                    {res.attachments && res.attachments.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {res.attachments.map((att, attIdx) => (
                          <a
                            key={attIdx}
                            href={att.url}
                            download={att.name}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F7F5EF] hover:bg-[#E3E7E2] text-[10px] text-[#0B3D2E] font-medium border border-[#E3E7E2] transition-colors"
                          >
                            <Download className="w-3 h-3 text-[#C8A96B]" />
                            <span>{att.name}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E3E7E2]">
                  {res.cost > 0 && (
                    <span className="font-serif-title text-sm font-bold text-[#0B3D2E]">
                      {formatCurrency(res.cost, res.currency || currentTrip.currency)}
                    </span>
                  )}
                  <button
                    onClick={() => removeReservation(res.id)}
                    className="p-2 rounded-xl text-[#66736C] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete booking"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {reservations.length === 0 && !isAdding && (
              <div className="p-8 text-center rounded-2xl bg-white border border-[#E3E7E2] space-y-2">
                <Ticket className="w-8 h-8 text-[#C8A96B] mx-auto opacity-70" />
                <h4 className="text-xs font-semibold text-[#0B3D2E]">No reservations recorded yet</h4>
                <p className="text-[11px] text-[#66736C] max-w-sm mx-auto font-light">
                  Add your flight tickets, resort booking vouchers, and table reservations to keep all confirmation codes handy.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#EAE6DD] p-4 sm:p-5 flex items-center justify-between border-t border-[#E3E7E2]">
          <span className="text-xs text-[#66736C]">All vouchers synced offline & cloud</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#0B3D2E] hover:bg-[#176B50] text-[#F7F5EF] text-xs font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
