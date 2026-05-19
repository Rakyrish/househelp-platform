import { useEffect, useState } from 'react';
import api from '../../api/axios';
import UserTable from '../../components/admin/UserTable';

const UserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get(`/admin/manage-users/`);
        const data = response.data.results || response.data;
        setUsers(Array.isArray(data) ? data : []);
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