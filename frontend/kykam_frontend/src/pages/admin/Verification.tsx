import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DocumentPreview from '../../components/admin/DocumentPreview';
import RejectionModal from '../../components/admin/RejectionModal';
import {message} from 'antd'

const VerificationPage = () => {
  const { userId } = useParams(); // Gets '17' from /admin/verify/17
  const navigate = useNavigate();
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:8000/api/admin/manage-users/${userId}/`, {
          headers: { Authorization: `Token ${token}` }
        });
        setUser(response.data);
        message.success("worker rejected successfully")
      } catch (error) {
        message.error("error rejecting worker")
        console.error("Error fetching worker details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetails();
  }, [userId]);

  const handleApprove = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:8000/api/admin/manage-users/${userId}/approve_worker/`, {}, {
        headers: { Authorization: `Token ${token}` }
      });
      navigate('/admin/users'); // Go back to list after approval
    } catch (err) {
      alert("Approval failed");
    }
  };
  const handleReject = async (reasons: string[], comment: string) => {
  try {
    const token = localStorage.getItem('token');
    
    // This calls your combined Django ViewSet action
    await axios.post(
      `http://localhost:8000/api/admin/manage-users/${userId}/reject_worker/`, 
      { reasons, comment }, 
      { headers: { Authorization: `Token ${token}` } }
    );

    setIsModalOpen(false);
    navigate('/admin/users'); // Redirect back to list

  } catch (err) {
    console.error("Rejection failed", err);
    alert("Could not process rejection. Check backend logs.");
  }
};

  if (loading) return <div className="p-10 text-white font-mono">Loading Worker Data...</div>;
  if (!user) return <div className="p-10 text-red-400">Worker not found.</div>;

  return (
    <div className="min-h-screen bg-[#050b14] p-8">
      {/* Header Info */}
      <div className="flex justify-between items-end mb-8 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">{user.first_name} {user.last_name}</h1>
          <p className="text-slate-400 font-mono text-sm">ID Number: {user.id_number} | Phone: {user.phone}</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all"
          >
            Reject
          </button>
          <button 
            onClick={handleApprove}
            className="px-8 py-2 bg-cyan-500 text-[#050b14] rounded-xl font-bold hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20"
          >
            Approve Worker
          </button>
        </div>
      </div>

      {/* Split Screen Document Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[70vh]">
        <DocumentPreview 
          url={user.id_photo_front} 
          title="ID Card - Front" 
          type="National Identity" 
        />
        <DocumentPreview 
          url={user.id_photo_back} 
          title="ID Card - Back" 
          type="National Identity" 
        />
      </div>

      <RejectionModal 
      isOpen={isModalOpen} 
      onClose={() => setIsModalOpen(false)} 
      onConfirm={handleReject} // Pass the new function here
      userName={user.first_name} 
    />
    </div>
  );
};

export default VerificationPage;