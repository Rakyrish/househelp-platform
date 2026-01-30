import { useEffect, useState } from 'react';
import axios from 'axios';
import UserTable from '../../components/admin/UserTable';
const API = import.meta.env.VITE_API_BASE_URL;
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Replace with your login token logic
        const token = localStorage.getItem('token'); 
        const response = await axios.get(`${API}/api/admin/manage-users/`, {
          headers: { Authorization: `Token ${token}` }
        });
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <div className="p-10 text-white">Loading users...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Member Directory</h2>
      <UserTable users={users} />
    </div>
  );
};

export default UserManagement;