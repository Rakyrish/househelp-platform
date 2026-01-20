// import React, { useState, useEffect } from 'react';
// import { Card, Avatar, Tag, Button, Input, Row, Col, Spin, message, Modal, Empty } from 'antd';
// import { 
//   UserOutlined, 
//   EnvironmentOutlined, 
//   StarFilled, 
//   VerifiedOutlined,
//   FilterOutlined,
//   SearchOutlined
// } from '@ant-design/icons';
// import api from '../../api/axios'; // Use the secure instance

// const WorkerDirectory = () => {
//   const [workers, setWorkers] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState('');

//   useEffect(() => {
//     const fetchWorkers = async () => {
//       try {
//         // Assume your backend has this endpoint for listing verified workers
//         const res = await api.get('/users/workers/list/');
//         setWorkers(res.data);
//       } catch (err) {
//         message.error("Could not load worker directory");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchWorkers();
//   }, []);

//   const handleHire = (workerName: string) => {
//     Modal.confirm({
//       title: `Send Hire Request?`,
//       content: `Would you like to send a booking request to ${workerName}? They will be notified immediately.`,
//       onOk: () => {
//         message.success(`Request sent to ${workerName}!`);
//         // Here you would call api.post('/bookings/create/', { worker_id: ... })
//       }
//     });
//   };

//   const filteredWorkers = workers.filter(w => 
//     w.full_name?.toLowerCase().includes(search.toLowerCase()) ||
//     w.worker_type?.toLowerCase().includes(search.toLowerCase())
//   );

//   if (loading) return <div className="h-screen flex justify-center items-center"><Spin tip="Loading specialized help..." size="large" /></div>;

//   return (
//     <div className="min-h-screen bg-[#f1f5f9] p-4 md:p-8">
//       <div className="max-w-7xl mx-auto">
//         <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
//           <h2 className="text-3xl font-bold text-slate-800">Available Workers</h2>
//           <Input 
//             placeholder="Search by name or skill (e.g. Nanny)" 
//             prefix={<SearchOutlined />} 
//             className="max-w-md h-12 rounded-xl shadow-sm"
//             onChange={(e) => setSearch(e.target.value)}
//           />
//         </div>

//         <Row gutter={[24, 24]}>
//           {filteredWorkers.map((worker) => (
//             <Col xs={24} sm={12} lg={8} key={worker.id}>
//               <Card 
//                 className="rounded-2xl border-none shadow-sm hover:shadow-md transition-all overflow-hidden"
//                 bodyStyle={{ padding: 0 }}
//               >
//                 <div className="bg-orange-400 h-20" /> {/* Profile header accent */}
//                 <div className="px-6 pb-6 -mt-10">
//                   <Avatar 
//                     size={80} 
//                     src={worker.avatar_url} 
//                     icon={<UserOutlined />} 
//                     className="border-4 border-white shadow-md bg-white"
//                   />
//                   <div className="mt-4 flex justify-between items-start">
//                     <div>
//                       <h3 className="text-xl font-bold text-slate-800">
//                         {worker.full_name} {worker.is_verified && <VerifiedOutlined className="text-blue-500 text-sm ml-1" />}
//                       </h3>
//                       <p className="text-slate-500 capitalize">{worker.worker_type?.replace('_', ' ')}</p>
//                     </div>
//                     <Tag color="orange" className="mr-0 rounded-full">KES {worker.rate || 'Negotiable'}</Tag>
//                   </div>

//                   <div className="mt-4 space-y-2">
//                     <div className="flex items-center gap-2 text-slate-500 text-sm">
//                       <EnvironmentOutlined /> {worker.location}
//                     </div>
//                     <div className="flex items-center gap-2 text-amber-500 text-sm">
//                       <StarFilled /> 4.8 (12 Reviews)
//                     </div>
//                   </div>

//                   <div className="mt-6 flex gap-2">
//                     <Button block className="rounded-lg h-10 font-medium">View Profile</Button>
//                     <Button 
//                       block 
//                       type="primary" 
//                       className="bg-[#f3a82f] hover:bg-orange-600 border-none rounded-lg h-10 font-bold"
//                       onClick={() => handleHire(worker.full_name)}
//                     >
//                       Hire Now
//                     </Button>
//                   </div>
//                 </div>
//               </Card>
//             </Col>
//           ))}
//         </Row>

//         {filteredWorkers.length === 0 && (
//           <Empty description="No workers found matching your search." className="mt-20" />
//         )}
//       </div>
//     </div>
//   );
// };

// export default WorkerDirectory;
import React, { useState, useEffect } from 'react';
import { Card, Tag, Badge, Input, Select, Row, Col, Avatar, Button, Spin } from 'antd';
import { 
  CheckCircleFilled, 
  ClockCircleOutlined, 
  SearchOutlined, 
  EnvironmentOutlined,
  FilterOutlined 
} from '@ant-design/icons';
import axios from 'axios';

const { Search } = Input;
const { Option } = Select;

// Placeholder Image if profile photo is missing
const DEFAULT_AVATAR = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";

const WorkerDirectory = () => {
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Replace with your actual API endpoint
    const fetchWorkers = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:8000/users/workers/');
        setWorkers(res.data);
        
        // --- PLACEHOLDER DATA FOR NOW ---
        setTimeout(() => {
          setWorkers([
            { id: 1, full_name: "Jane Wambui", worker_type: "nanny", location: "Kilimani", is_verified: true, phone: "0712..." },
            { id: 2, full_name: "Peter Otieno", worker_type: "gardener", location: "Westlands", is_verified: false, phone: "0722..." },
            { id: 3, full_name: "Mary Atieno", worker_type: "cook", location: "Karen", is_verified: true, phone: "0733..." },
            { id: 4, full_name: "David Kimani", worker_type: "house_cleaner", location: "Roysambu", is_verified: false, phone: "0744..." },
          ]);
          setLoading(false);
        }, 800);
      } catch (err) {
        console.error("Error fetching workers");
        setLoading(false);
      }
    };
    fetchWorkers();
  }, []);

  const filteredWorkers = workers.filter(w => {
    if (filter === 'verified') return w.is_verified;
    if (filter === 'unverified') return !w.is_verified;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Available Workers</h1>
          
          <div className="flex gap-3 w-full md:w-auto">
            <Search 
              placeholder="Search by name or location" 
              className="w-full md:w-64" 
              prefix={<SearchOutlined />} 
            />
            <Select defaultValue="all" onChange={setFilter} className="w-40">
              <Option value="all">All Workers</Option>
              <Option value="verified">Verified Only</Option>
              <Option value="unverified">Pending Only</Option>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spin size="large" tip="Loading workers..." /></div>
        ) : (
          <Row gutter={[24, 24]}>
            {filteredWorkers.map(worker => (
              <Col xs={24} sm={12} md={8} lg={6} key={worker.id}>
                <Card 
                  hoverable 
                  className="rounded-xl overflow-hidden border-none shadow-sm hover:shadow-md transition-all"
                  cover={
                    <div className="h-32 bg-gradient-to-r from-orange-100 to-amber-100 relative">
                       {/* VERIFICATION BADGE POSITIONED ON COVER */}
                       <div className="absolute top-3 right-3">
                        {worker.is_verified ? (
                          <Tag color="success" className="flex items-center gap-1 border-none px-3 py-1 rounded-full shadow-sm">
                            <CheckCircleFilled /> Verified
                          </Tag>
                        ) : (
                          <Tag color="default" className="flex items-center gap-1 border-none px-3 py-1 rounded-full shadow-sm bg-gray-200 text-gray-600">
                            <ClockCircleOutlined /> Pending
                          </Tag>
                        )}
                       </div>
                    </div>
                  }
                >
                  <div className="flex flex-col items-center -mt-16 mb-4">
                    <Badge dot={worker.is_verified} color="#52c41a" offset={[-10, 70]}>
                      <Avatar 
                        size={80} 
                        src={DEFAULT_AVATAR} 
                        className="border-4 border-white shadow-md bg-gray-300" 
                      />
                    </Badge>
                    <h3 className="text-lg font-bold text-gray-800 mt-2">{worker.full_name}</h3>
                    <p className="text-[#f3a82f] font-semibold text-sm capitalize">
                      {worker.worker_type.replace('_', ' ')}
                    </p>
                  </div>

                  <div className="space-y-2 text-gray-500 text-sm">
                    <div className="flex items-center gap-2">
                      <EnvironmentOutlined className="text-gray-400" />
                      <span>{worker.location}</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button 
                      block 
                      type={worker.is_verified ? "primary" : "default"}
                      className={worker.is_verified ? "bg-[#f3a82f] border-none" : ""}
                    >
                      {worker.is_verified ? "View Profile" : "Awaiting Verification"}
                    </Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
};

export default WorkerDirectory;