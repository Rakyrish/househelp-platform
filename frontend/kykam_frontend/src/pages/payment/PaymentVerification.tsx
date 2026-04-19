import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { message } from "antd";
import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL || "";

const PaymentVerification = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [loading, setLoading] = useState(false);
    const [phone, setPhone] = useState(state?.phone || "");
    const [transactionCode, setTransactionCode] = useState("");
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        if (searchParams.get("expired") === "true") {
            message.error("Your temporary access has expired. Please complete verification.");
            setSearchParams({});
        }
    }, [searchParams, setSearchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phone.trim() || !transactionCode.trim()) {
            message.error("Please fill in all fields.");
            return;
        }
        setLoading(true);
        try {
            await axios.post(`${API}/api/payment/submit/`, {
                payment_token: state?.payment_token,
                phone_number: phone,
                mpesa_transaction_code: transactionCode,
            });
            setStep(3);
        } catch (err: any) {
            const msg =
                err.response?.data?.error ||
                err.response?.data?.mpesa_transaction_code?.[0] ||
                err.response?.data?.phone_number?.[0] ||
                "Submission failed. Please try again.";
            message.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#fdf6e9] to-[#f8fafc] flex items-center justify-center px-4 py-10">
            <div className="bg-white rounded-3xl shadow-lg border border-slate-100 max-w-md w-full overflow-hidden">
                {/* Progress Bar */}
                <div className="flex h-1.5">
                    <div className={`flex-1 transition-all duration-500 ${step >= 1 ? 'bg-[#f3a82f]' : 'bg-slate-100'}`} />
                    <div className={`flex-1 transition-all duration-500 ${step >= 2 ? 'bg-[#f3a82f]' : 'bg-slate-100'}`} />
                    <div className={`flex-1 transition-all duration-500 ${step >= 3 ? 'bg-[#28a745]' : 'bg-slate-100'}`} />
                </div>

                <div className="p-8 md:p-10">
                    {/* ─── STEP 1: Payment Instructions ─── */}
                    {step === 1 && (
                        <div className="text-center">
                            <div className="text-5xl mb-3">📱</div>
                            <h2 className="text-2xl font-extrabold text-slate-800 mb-1">Complete Your Payment</h2>
                            <p className="text-slate-500 text-sm mb-6">
                                Pay <span className="font-bold text-[#f3a82f]">KES 99</span> to activate your account
                            </p>

                            {/* Payment Details Card */}
                            <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] text-white rounded-2xl p-6 mb-6 text-left">
                                <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">Payment Method</p>
                                <p className="font-bold text-lg mb-3">M-Pesa — Buy Goods</p>
                                <div className="flex justify-between items-center mb-3 bg-white/10 rounded-xl px-4 py-3">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest text-slate-400">Till Number</p>
                                        <p className="text-2xl font-extrabold tracking-wider text-[#f3a82f]">5403228</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase tracking-widest text-slate-400">Amount</p>
                                        <p className="text-2xl font-extrabold text-emerald-400">KES 99</p>
                                    </div>
                                </div>
                            </div>

                            {/* Step-by-Step Instructions */}
                            <div className="text-left space-y-3 mb-8">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">How to Pay</h3>
                                {[
                                    "Go to M-Pesa on your phone",
                                    'Select "Lipa na M-Pesa"',
                                    'Select "Buy Goods and Services"',
                                    <>Enter Till Number: <strong className="text-[#f3a82f]">5403228</strong></>,
                                    <>Enter Amount: <strong className="text-[#f3a82f]">99</strong></>,
                                    "Enter your M-Pesa PIN and confirm",
                                ].map((text, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#f3a82f]/10 text-[#f3a82f] flex items-center justify-center text-xs font-bold">
                                            {i + 1}
                                        </span>
                                        <span className="text-sm text-slate-600">{text}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                className="w-full py-4 bg-[#f3a82f] text-white font-bold rounded-2xl hover:bg-orange-600 transition-all text-sm"
                            >
                                I've Made the Payment →
                            </button>
                        </div>
                    )}

                    {/* ─── STEP 2: Transaction Form ─── */}
                    {step === 2 && (
                        <div>
                            <button
                                onClick={() => setStep(1)}
                                className="text-sm text-slate-400 hover:text-slate-600 mb-4 flex items-center gap-1"
                            >
                                ← Back to instructions
                            </button>
                            <div className="text-center mb-6">
                                <div className="text-4xl mb-2">✅</div>
                                <h2 className="text-xl font-extrabold text-slate-800">Confirm Your Payment</h2>
                                <p className="text-slate-500 text-sm mt-1">
                                    Enter the details from your M-Pesa confirmation SMS
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                        Phone Number Used to Pay
                                    </label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="e.g. 0712345678"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#f3a82f]/40 focus:border-[#f3a82f] transition-all text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                        M-Pesa Transaction Code
                                    </label>
                                    <input
                                        type="text"
                                        value={transactionCode}
                                        onChange={(e) => setTransactionCode(e.target.value.toUpperCase())}
                                        placeholder="e.g. SLK4H7R2T0"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#f3a82f]/40 focus:border-[#f3a82f] transition-all text-sm font-mono tracking-wider"
                                        required
                                    />
                                    <p className="text-xs text-slate-400 mt-1">
                                        Find this in your M-Pesa confirmation message
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-[#f3a82f] text-white font-bold rounded-2xl flex justify-center items-center hover:bg-orange-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm mt-2"
                                >
                                    {loading ? (
                                        <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        "Submit for Verification"
                                    )}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* ─── STEP 3: Success ─── */}
                    {step === 3 && (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">🎉</span>
                            </div>
                            <h2 className="text-xl font-extrabold text-slate-800 mb-2">Payment Submitted!</h2>
                            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                                Your payment has been received and is under review.
                            </p>
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
                                <p className="text-amber-800 text-sm font-medium">
                                    ⚠️ You have <strong>1 minute</strong> to log in and access your dashboard. After that, access is suspended until admin approval.
                                </p>
                            </div>
                            <button
                                onClick={() => navigate("/login/worker")}
                                className="w-full py-3 bg-slate-800 text-white font-bold rounded-2xl hover:bg-slate-900 transition-all text-sm"
                            >
                                Go to Login
                            </button>
                        </div>
                    )}

                    {/* Footer */}
                    {step !== 3 && (
                        <p className="text-xs text-slate-400 mt-6 text-center">
                            Registered as <strong>{state?.email || "User"}</strong>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentVerification;