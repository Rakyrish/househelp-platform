import { useEffect, useState } from 'react';
import axios from 'axios';
import { message } from 'antd';
import { SyncOutlined } from '@ant-design/icons';

const API = import.meta.env.VITE_API_BASE_URL;

interface Payment {
    id: number;
    user_name: string;
    user_email: string;
    phone_number: string;
    mpesa_transaction_code: string;
    amount: string;
    status: string;
    created_at: string;
    reviewed_at: string | null;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    pending_verification: { label: 'Pending', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    approved: { label: 'Approved', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    rejected: { label: 'Rejected', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
};

const PaymentReview = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Token ${token}` };

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API}/api/admin/payments/`, { headers });
            setPayments(res.data);
        } catch (err) {
            message.error("Failed to load payments.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const handleAction = async (id: number, action: 'approve' | 'reject') => {
        setActionLoading(id);
        try {
            const res = await axios.post(`${API}/api/admin/payments/${id}/${action}/`, {}, { headers });
            message.success(res.data.message);
            fetchPayments();
        } catch (err: any) {
            message.error(err.response?.data?.error || `Failed to ${action}.`);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <SyncOutlined spin className="text-4xl text-cyan-500 mb-4" />
            <div className="text-cyan-500 font-mono tracking-widest animate-pulse text-sm">LOADING PAYMENTS...</div>
        </div>
    );

    const pending = payments.filter(p => p.status === 'pending_verification');
    const reviewed = payments.filter(p => p.status !== 'pending_verification');

    return (
        <div className="space-y-8 p-6 lg:p-0">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Payment Verification</h2>
                    <p className="text-slate-400">Review and manage manual M-Pesa payment submissions</p>
                </div>
                <button
                    onClick={fetchPayments}
                    className="px-6 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-[10px] font-bold text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all"
                >
                    REFRESH
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                    <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Pending Review</p>
                    <p className="text-3xl font-bold text-white mt-1">{pending.length}</p>
                </div>
                <div className="p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Approved</p>
                    <p className="text-3xl font-bold text-white mt-1">{payments.filter(p => p.status === 'approved').length}</p>
                </div>
                <div className="p-5 bg-red-500/5 border border-red-500/10 rounded-2xl">
                    <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest">Rejected</p>
                    <p className="text-3xl font-bold text-white mt-1">{payments.filter(p => p.status === 'rejected').length}</p>
                </div>
            </div>

            {/* Pending Payments */}
            {pending.length > 0 && (
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/5">
                        <h3 className="text-sm font-bold text-amber-400 uppercase tracking-widest">⏳ Awaiting Review</h3>
                    </div>
                    <div className="divide-y divide-white/5">
                        {pending.map((p) => (
                            <PaymentRow
                                key={p.id}
                                payment={p}
                                onApprove={() => handleAction(p.id, 'approve')}
                                onReject={() => handleAction(p.id, 'reject')}
                                isLoading={actionLoading === p.id}
                            />
                        ))}
                    </div>
                </div>
            )}

            {pending.length === 0 && (
                <div className="text-center py-12 bg-white/[0.02] border border-white/5 rounded-3xl">
                    <p className="text-4xl mb-2">✨</p>
                    <p className="text-slate-400 text-sm">No pending payments to review</p>
                </div>
            )}

            {/* Reviewed Payments */}
            {reviewed.length > 0 && (
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/5">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">📋 History</h3>
                    </div>
                    <div className="divide-y divide-white/5">
                        {reviewed.map((p) => (
                            <PaymentRow key={p.id} payment={p} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const PaymentRow = ({ payment, onApprove, onReject, isLoading }: {
    payment: Payment;
    onApprove?: () => void;
    onReject?: () => void;
    isLoading?: boolean;
}) => {
    const config = statusConfig[payment.status] || statusConfig.pending_verification;
    const isPending = payment.status === 'pending_verification';

    return (
        <div className="px-6 py-4 flex flex-col md:flex-row md:items-center gap-4">
            {/* User Info */}
            <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">{payment.user_name}</p>
                <p className="text-slate-500 text-xs truncate">{payment.user_email}</p>
            </div>

            {/* Phone */}
            <div className="md:w-32">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">Phone</p>
                <p className="text-slate-300 text-sm font-mono">{payment.phone_number}</p>
            </div>

            {/* Transaction Code */}
            <div className="md:w-36">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">Txn Code</p>
                <p className="text-cyan-400 text-sm font-mono font-bold">{payment.mpesa_transaction_code}</p>
            </div>

            {/* Amount */}
            <div className="md:w-20">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">Amount</p>
                <p className="text-white text-sm font-bold">KES {payment.amount}</p>
            </div>

            {/* Date */}
            <div className="md:w-28">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">Date</p>
                <p className="text-slate-400 text-xs">{new Date(payment.created_at).toLocaleDateString()}</p>
            </div>

            {/* Status / Actions */}
            <div className="flex items-center gap-2 md:w-48 justify-end">
                {isPending && onApprove && onReject ? (
                    <>
                        <button
                            onClick={onApprove}
                            disabled={isLoading}
                            className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-bold hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50"
                        >
                            Approve
                        </button>
                        <button
                            onClick={onReject}
                            disabled={isLoading}
                            className="px-4 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-xs font-bold hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                        >
                            Reject
                        </button>
                    </>
                ) : (
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${config.bg} ${config.color}`}>
                        {config.label}
                    </span>
                )}
            </div>
        </div>
    );
};

export default PaymentReview;
