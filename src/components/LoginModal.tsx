import React, { useState } from 'react';
import { useStore } from '../store';
import { LogIn, X } from 'lucide-react';
import { cn } from '../lib/utils';

export default function LoginModal() {
  const { user, users, login } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (user) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check against real users from Google Sheets
    const foundUser = users.find(u => u.username === username && u.password === password);
    
    if (foundUser) {
      login(foundUser);
      setIsOpen(false);
      setError('');
    } else {
      // Fallback for initial setup if no users exist yet
      if (users.length === 0 && username === 'admin' && password === 'admin') {
        login({
          id: '1',
          username: 'admin',
          name: 'Admin User',
          role: 'Admin',
          profilePic: 'https://picsum.photos/seed/admin/100/100',
        });
        setIsOpen(false);
        setError('');
      } else {
        setError('รหัสผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }
    }
  };

  return (
    <>
      {/* Hidden button bottom right */}
      <div className="fixed bottom-4 right-4 z-40 group">
        <div className="w-12 h-12 rounded-full bg-transparent flex items-center justify-center transition-all duration-300 group-hover:bg-leica-red/20">
          <button
            onClick={() => setIsOpen(true)}
            className="opacity-0 group-hover:opacity-100 p-3 bg-leica-red text-white rounded-full shadow-lg transition-opacity duration-300 hover:bg-red-700"
            title="เข้าสู่ระบบ"
          >
            <LogIn size={20} />
          </button>
        </div>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-8 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
            
            <div className="text-center mb-8">
              <img
                className="h-16 w-16 mx-auto rounded-full object-cover border-2 border-leica-red mb-4"
                src="https://storage.googleapis.com/fastwork-static/9e655c37-68b0-4138-b523-552b064374dd.jpg"
                alt="Logo"
                referrerPolicy="no-referrer"
              />
              <h2 className="text-2xl font-bold text-white tracking-wider uppercase">Shutterhunters</h2>
              <p className="text-sm text-gray-400 mt-2">เข้าสู่ระบบสำหรับพนักงาน</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">ID</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-leica-gray/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-leica-red focus:ring-1 focus:ring-leica-red transition-colors"
                  placeholder="Enter your ID"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-leica-gray/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-leica-red focus:ring-1 focus:ring-leica-red transition-colors"
                  placeholder="Enter your password"
                  required
                />
              </div>
              
              {error && <p className="text-leica-red text-sm text-center">{error}</p>}

              <button
                type="submit"
                className="w-full bg-leica-red hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors uppercase tracking-wider text-sm"
              >
                Sign In
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
