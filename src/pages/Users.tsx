import React, { useState } from 'react';
import { useStore } from '../store';
import { User } from '../types';
import { Users as UsersIcon, Plus, Edit2, Trash2, X, CheckCircle2 } from 'lucide-react';

export default function Users() {
  const { user, users, addUser, updateUser, deleteUser } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [formData, setFormData] = useState<Partial<User>>({
    username: '',
    password: '',
    name: '',
    role: 'User',
    profilePic: ''
  });

  if (!user || user.role !== 'Admin') {
    return <div className="text-center py-20 text-gray-400">เฉพาะผู้ดูแลระบบเท่านั้น</div>;
  }

  const handleOpenModal = (u?: User) => {
    if (u) {
      setEditingUser(u);
      setFormData(u);
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        password: '',
        name: '',
        role: 'User',
        profilePic: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUser(editingUser.id, formData);
    } else {
      const newUser: User = {
        id: `USR-${Date.now()}`,
        username: formData.username || '',
        password: formData.password || '',
        name: formData.name || '',
        role: formData.role as 'Admin' | 'User',
        profilePic: formData.profilePic || `https://picsum.photos/seed/${formData.username}/100/100`
      };
      addUser(newUser);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้งานนี้?')) {
      deleteUser(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-white/10 pb-6">
        <h1 className="text-3xl font-bold uppercase tracking-wider flex items-center gap-3">
          <span className="w-2 h-8 bg-leica-red inline-block"></span>
          จัดการผู้ใช้งาน
        </h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-leica-red hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          เพิ่มผู้ใช้ใหม่
        </button>
      </div>

      <div className="glass-panel rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-gray-500 font-mono uppercase tracking-wider text-xs">
            <tr>
              <th className="px-4 py-3">โปรไฟล์</th>
              <th className="px-4 py-3">ชื่อ-สกุล</th>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">รหัสผ่าน</th>
              <th className="px-4 py-3">สิทธิ์</th>
              <th className="px-4 py-3 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-gray-400">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-white/5">
                <td className="px-4 py-3">
                  <img src={u.profilePic} alt={u.name} className="w-10 h-10 rounded-full object-cover border border-white/10" referrerPolicy="no-referrer" />
                </td>
                <td className="px-4 py-3 font-bold text-gray-300">{u.name}</td>
                <td className="px-4 py-3 font-mono">{u.username}</td>
                <td className="px-4 py-3 font-mono">
                  <span className="bg-black/50 px-2 py-1 rounded text-xs">••••••••</span>
                  <span className="ml-2 text-xs text-gray-500" title={u.password}>(Hover to view)</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${u.role === 'Admin' ? 'bg-leica-red/20 text-leica-red' : 'bg-white/10 text-gray-300'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleOpenModal(u)} className="p-2 bg-white/10 hover:bg-white/20 rounded text-gray-300 transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(u.id)} 
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded text-red-500 transition-colors"
                      disabled={u.id === user.id} // ห้ามลบตัวเอง
                      title={u.id === user.id ? "ไม่สามารถลบตัวเองได้" : "ลบผู้ใช้"}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">ไม่มีข้อมูลผู้ใช้งาน</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
            
            <h2 className="text-xl font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
              <UsersIcon size={20} className="text-leica-red" />
              {editingUser ? 'แก้ไขผู้ใช้งาน' : 'เพิ่มผู้ใช้งานใหม่'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">ชื่อ-สกุล</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-white focus:border-leica-red focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-white focus:border-leica-red focus:outline-none"
                  disabled={!!editingUser} // ไม่ให้แก้ Username ถ้าเป็นการอัพเดท
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">รหัสผ่าน</label>
                <input
                  type="text"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-white focus:border-leica-red focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">สิทธิ์การใช้งาน</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value as 'Admin' | 'User'})}
                  className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-white focus:border-leica-red focus:outline-none"
                >
                  <option value="User">User (พนักงานขาย)</option>
                  <option value="Admin">Admin (ผู้ดูแลระบบ)</option>
                </select>
              </div>
              
              <button
                type="submit"
                className="w-full bg-leica-red hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors uppercase tracking-wider mt-4 flex justify-center items-center gap-2"
              >
                <CheckCircle2 size={20} />
                บันทึกข้อมูล
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
