import { useState } from 'react';

interface RejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reasons: string[], comment: string) => void;
  userName: string;
}

const REJECTION_OPTIONS = [
  "Document is blurry or unreadable",
  "Expired document",
  "Name does not match profile",
  "Invalid document type"
];

const RejectionModal = ({ isOpen, onClose, onConfirm, userName }: RejectionModalProps) => {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  const toggleReason = (reason: string) => {
    setSelectedReasons(prev => 
      prev.includes(reason) ? prev.filter(r => r !== reason) : [...prev, reason]
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0a0f1a] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-2">Reject {userName}</h3>
        <p className="text-slate-400 text-xs mb-6">Select the reasons for document rejection.</p>
        
        <div className="space-y-2 mb-4">
          {REJECTION_OPTIONS.map(reason => (
            <button
              key={reason}
              onClick={() => toggleReason(reason)}
              className={`w-full text-left px-4 py-3 rounded-xl border text-xs transition-all ${
                selectedReasons.includes(reason) 
                ? 'border-red-500 bg-red-500/10 text-red-400' 
                : 'border-white/5 bg-white/5 text-slate-400'
              }`}
            >
              {reason}
            </button>
          ))}
        </div>

        {/* Added: Comment Textarea */}
        <div className="mb-6">
          <label className="text-[10px] text-slate-500 uppercase font-bold mb-2 block">Additional Instructions</label>
          <textarea 
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="e.g. Please retake the photo in a brighter room..."
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs h-24 focus:border-cyan-500/50 outline-none transition-all"
          />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 text-white bg-white/5 rounded-xl text-xs font-bold">Cancel</button>
          <button 
            onClick={() => onConfirm(selectedReasons, comment)}
            disabled={selectedReasons.length === 0}
            className="flex-[2] py-3 bg-red-600 text-white rounded-xl text-xs font-bold disabled:opacity-50 hover:bg-red-500 transition-colors"
          >
            Confirm & Send Email
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectionModal;