import React, { useState } from 'react';
import {
  Users,
  X,
  Plus,
  DollarSign,
  Vote,
  UserPlus,
  CheckCircle2,
  Share2,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { useCurrentTrip } from '../../contexts/TripContext';
import { formatCurrency } from '../../lib/utils';
import { Collaborator, GroupExpense } from '../../types';

interface GroupTripModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GroupTripModal: React.FC<GroupTripModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    currentTrip,
    collaborators,
    addCollaborator,
    groupExpenses,
    addGroupExpense,
    tripPolls,
    createTripPoll,
    voteTripPoll,
  } = useCurrentTrip();

  const [activeTab, setActiveTab] = useState<'members' | 'split' | 'polls'>('members');

  // Invite state
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // New Expense state
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState<number>(0);
  const [paidBy, setPaidBy] = useState('You (Organizer)');

  // New Poll state
  const [pollQuestion, setPollQuestion] = useState('');
  const [opt1, setOpt1] = useState('');
  const [opt2, setOpt2] = useState('');

  if (!isOpen || !currentTrip) return null;

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim()) return;
    addCollaborator(inviteName.trim(), inviteEmail.trim() || `${inviteName.toLowerCase().replace(/\s+/g, '')}@travelwise.com`);
    setInviteName('');
    setInviteEmail('');
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle.trim() || expAmount <= 0) return;
    addGroupExpense({
      title: expTitle.trim(),
      amount: expAmount,
      paid_by_person: paidBy,
      split_between: collaborators.map((c) => c.name),
      category: 'Dining',
      date: new Date().toISOString().split('T')[0],
    });
    setExpTitle('');
    setExpAmount(0);
  };

  const handleCreatePoll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pollQuestion.trim() || !opt1.trim() || !opt2.trim()) return;
    createTripPoll(pollQuestion.trim(), [opt1.trim(), opt2.trim()], 'restaurant');
    setPollQuestion('');
    setOpt1('');
    setOpt2('');
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Compute Expense Splitting Balances
  const totalGroupExpenses = groupExpenses.reduce((sum, e) => sum + e.amount, 0);
  const perPersonShare = collaborators.length > 0 ? totalGroupExpenses / collaborators.length : 0;

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
              <Users className="w-5 h-5 text-[#C8A96B]" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#C8A96B] font-medium block">
                Group Travel Coordination Hub
              </span>
              <h2 className="font-serif-title text-2xl text-[#F7F5EF] font-medium tracking-tight">
                Co-Travelers, Splits & Polls
              </h2>
            </div>
          </div>
          <p className="text-xs text-[#E3E7E2]/80 font-light mt-1">
            Coordinate with friends & family traveling to {currentTrip.destination}, split shared bills, and vote on activities.
          </p>

          {/* Sub Navigation */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/10">
            {[
              { id: 'members', label: `Travelers (${collaborators.length})` },
              { id: 'split', label: 'Expense Splitter' },
              { id: 'polls', label: `Group Polls (${tripPolls.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#C8A96B] text-[#0B3D2E] font-semibold shadow-sm'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-7 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* TAB 1: MEMBERS */}
          {activeTab === 'members' && (
            <div className="space-y-5">
              {/* Share Link Banner */}
              <div className="p-4 rounded-2xl bg-white border border-[#E3E7E2] flex items-center justify-between gap-3 shadow-sm">
                <div>
                  <span className="text-xs font-semibold text-[#0B3D2E] block">Group Invitation Link</span>
                  <span className="text-[11px] text-[#66736C] font-light">
                    Share this link so your group can view and vote on plans.
                  </span>
                </div>
                <button
                  onClick={copyShareLink}
                  className="px-4 py-2 rounded-xl bg-[#0B3D2E] hover:bg-[#176B50] text-[#F7F5EF] text-xs font-medium flex items-center gap-1.5 transition-colors flex-shrink-0"
                >
                  {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-[#C8A96B]" />}
                  <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>

              {/* Members List */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#0B3D2E] uppercase tracking-wider block">
                  Active Party Members
                </span>
                {collaborators.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-2xl bg-white border border-[#E3E7E2] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={c.avatar}
                        alt={c.name}
                        className="w-10 h-10 rounded-full object-cover border border-[#C8A96B]"
                      />
                      <div>
                        <span className="text-xs font-semibold text-[#0B3D2E] block">{c.name}</span>
                        <span className="text-[11px] text-[#66736C] font-light">{c.email}</span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] uppercase font-semibold px-2.5 py-1 rounded-full ${
                        c.role === 'owner'
                          ? 'bg-[#0B3D2E] text-[#F7F5EF]'
                          : 'bg-[#176B50]/10 text-[#176B50]'
                      }`}
                    >
                      {c.role === 'owner' ? 'Trip Leader' : 'Co-Traveler'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Add Member Form */}
              <form onSubmit={handleAddMember} className="p-4 rounded-2xl bg-white border border-[#E3E7E2] space-y-3">
                <span className="text-xs font-semibold text-[#0B3D2E] block">Invite by Name / Email</span>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    required
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="Traveler name..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-[#F7F5EF] border border-[#E3E7E2] text-xs text-[#2C3531] focus:outline-none focus:border-[#0B3D2E]"
                  />
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="email@example.com (optional)"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-[#F7F5EF] border border-[#E3E7E2] text-xs text-[#2C3531] focus:outline-none focus:border-[#0B3D2E]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#0B3D2E] hover:bg-[#176B50] text-[#F7F5EF] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: EXPENSE SPLIT */}
          {activeTab === 'split' && (
            <div className="space-y-5">
              {/* Summary Card */}
              <div className="p-4 rounded-2xl bg-white border border-[#E3E7E2] shadow-sm grid grid-cols-2 gap-3 text-center">
                <div className="p-3 rounded-xl bg-[#F7F5EF]">
                  <span className="text-[10px] text-[#66736C] uppercase font-semibold block">Total Shared Bills</span>
                  <span className="font-serif-title text-base font-bold text-[#0B3D2E]">
                    {formatCurrency(totalGroupExpenses, currentTrip.currency)}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#F7F5EF]">
                  <span className="text-[10px] text-[#66736C] uppercase font-semibold block">Per-Person Split</span>
                  <span className="font-serif-title text-base font-bold text-[#176B50]">
                    {formatCurrency(Math.round(perPersonShare), currentTrip.currency)}
                  </span>
                </div>
              </div>

              {/* Settlement Insight */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <span>
                  <strong>Settlement Summary:</strong> Aarav Sharma owes You (Organizer){' '}
                  <strong>{formatCurrency(Math.round(perPersonShare), currentTrip.currency)}</strong> for shared transport & group dining.
                </span>
              </div>

              {/* Expenses Log */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#0B3D2E] uppercase tracking-wider block">
                  Logged Group Expenses
                </span>
                {groupExpenses.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-3.5 rounded-2xl bg-white border border-[#E3E7E2] flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-semibold text-[#0B3D2E] block">{exp.title}</span>
                      <span className="text-[11px] text-[#66736C] font-light">
                        Paid by {exp.paid_by_person} • Split equally between {exp.split_between.length} members
                      </span>
                    </div>
                    <span className="font-serif-title text-sm font-bold text-[#0B3D2E]">
                      {formatCurrency(exp.amount, currentTrip.currency)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Add Expense Form */}
              <form onSubmit={handleAddExpense} className="p-4 rounded-2xl bg-white border border-[#E3E7E2] space-y-3">
                <span className="text-xs font-semibold text-[#0B3D2E] block">Log Shared Bill</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    value={expTitle}
                    onChange={(e) => setExpTitle(e.target.value)}
                    placeholder="e.g. Seafood Dinner / Scooter Rental"
                    className="px-3.5 py-2 rounded-xl bg-[#F7F5EF] border border-[#E3E7E2] text-xs text-[#2C3531] focus:outline-none focus:border-[#0B3D2E]"
                  />
                  <input
                    type="number"
                    required
                    value={expAmount || ''}
                    onChange={(e) => setExpAmount(Number(e.target.value))}
                    placeholder="Amount (₹)"
                    className="px-3.5 py-2 rounded-xl bg-[#F7F5EF] border border-[#E3E7E2] text-xs text-[#2C3531] focus:outline-none focus:border-[#0B3D2E]"
                  />
                  <select
                    value={paidBy}
                    onChange={(e) => setPaidBy(e.target.value)}
                    className="px-3.5 py-2 rounded-xl bg-[#F7F5EF] border border-[#E3E7E2] text-xs text-[#2C3531] focus:outline-none focus:border-[#0B3D2E]"
                  >
                    {collaborators.map((c) => (
                      <option key={c.id} value={c.name}>
                        Paid by: {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-[#0B3D2E] hover:bg-[#176B50] text-[#F7F5EF] text-xs font-medium transition-colors"
                >
                  Record Shared Bill
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: POLLS */}
          {activeTab === 'polls' && (
            <div className="space-y-5">
              <div className="space-y-3">
                {tripPolls.map((poll) => {
                  const totalVotes = poll.options.reduce((s, o) => s + o.votes.length, 0);

                  return (
                    <div key={poll.id} className="p-4 rounded-2xl bg-white border border-[#E3E7E2] space-y-3 shadow-sm">
                      <div className="flex items-center gap-2">
                        <Vote className="w-4 h-4 text-[#C8A96B]" />
                        <h4 className="text-xs font-semibold text-[#0B3D2E]">{poll.question}</h4>
                      </div>

                      <div className="space-y-2">
                        {poll.options.map((opt) => {
                          const hasMyVote = opt.votes.includes('You (Organizer)');
                          const votePct = totalVotes > 0 ? Math.round((opt.votes.length / totalVotes) * 100) : 0;

                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => voteTripPoll(poll.id, opt.id, 'You (Organizer)')}
                              className={`w-full p-3 rounded-xl border text-left text-xs transition-all relative overflow-hidden flex items-center justify-between ${
                                hasMyVote
                                  ? 'border-[#176B50] bg-[#176B50]/5 font-medium'
                                  : 'border-[#E3E7E2] hover:border-[#C8A96B]'
                              }`}
                            >
                              <div
                                className="absolute left-0 top-0 bottom-0 bg-[#C8A96B]/15 pointer-events-none transition-all"
                                style={{ width: `${votePct}%` }}
                              />
                              <span className="relative z-10 text-[#0B3D2E]">
                                {hasMyVote ? '✓ ' : ''}{opt.text}
                              </span>
                              <span className="relative z-10 text-[11px] text-[#66736C] font-semibold">
                                {opt.votes.length} votes ({votePct}%)
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Create Poll Form */}
              <form onSubmit={handleCreatePoll} className="p-4 rounded-2xl bg-white border border-[#E3E7E2] space-y-3">
                <span className="text-xs font-semibold text-[#0B3D2E] block">Create Group Poll</span>
                <input
                  type="text"
                  required
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="e.g. Which sunset cruise should we book?"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F7F5EF] border border-[#E3E7E2] text-xs text-[#2C3531] focus:outline-none focus:border-[#0B3D2E]"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    value={opt1}
                    onChange={(e) => setOpt1(e.target.value)}
                    placeholder="Option 1..."
                    className="px-3.5 py-2 rounded-xl bg-[#F7F5EF] border border-[#E3E7E2] text-xs text-[#2C3531] focus:outline-none focus:border-[#0B3D2E]"
                  />
                  <input
                    type="text"
                    required
                    value={opt2}
                    onChange={(e) => setOpt2(e.target.value)}
                    placeholder="Option 2..."
                    className="px-3.5 py-2 rounded-xl bg-[#F7F5EF] border border-[#E3E7E2] text-xs text-[#2C3531] focus:outline-none focus:border-[#0B3D2E]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-[#0B3D2E] hover:bg-[#176B50] text-[#F7F5EF] text-xs font-medium transition-colors"
                >
                  Launch Group Poll
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#EAE6DD] p-4 sm:p-5 flex items-center justify-between border-t border-[#E3E7E2]">
          <span className="text-xs text-[#66736C]">Syncing in real-time with group</span>
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
