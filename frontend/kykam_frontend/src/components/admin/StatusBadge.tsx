const StatusBadge = ({ status }: { status: string | null }) => {
  // Map 'null' to 'pending' for visual consistency
  const currentStatus = status || 'pending';

  const styles: any = {
    approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
    banned: 'bg-slate-700 text-slate-300 border-white/10',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${styles[currentStatus]}`}>
      {currentStatus}
    </span>
  );
};

export default StatusBadge;