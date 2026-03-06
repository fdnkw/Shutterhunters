import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../store';
import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';

export default function Navbar() {
  const { user, logout } = useStore();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'หน้าแรก', path: '/' },
    ...(user ? [
      { name: 'สต๊อกสินค้า', path: '/stock' },
      { name: 'ขายสินค้า', path: '/sell' },
    ] : []),
    ...(user?.role === 'Admin' ? [
      { name: 'Dashboard', path: '/dashboard' },
    ] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-3">
              <img
                className="h-10 w-10 rounded-full object-cover border-2 border-leica-red"
                src="https://storage.googleapis.com/fastwork-static/9e655c37-68b0-4138-b523-552b064374dd.jpg"
                alt="Shutterhunters Logo"
                referrerPolicy="no-referrer"
              />
              <span className="text-white font-bold text-xl tracking-wider uppercase">Shutterhunters</span>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    location.pathname === link.path
                      ? "bg-leica-red text-white"
                      : "text-gray-300 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              
              {user && (
                <div className="flex items-center gap-4 ml-4 pl-4 border-l border-white/20">
                  <div className="flex items-center gap-2">
                    <img src={user.profilePic} alt={user.name} className="w-8 h-8 rounded-full border border-white/20" referrerPolicy="no-referrer" />
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-white">{user.name}</span>
                      <span className="text-[10px] text-leica-red">{user.role}</span>
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    className="p-2 text-gray-400 hover:text-leica-red transition-colors"
                    title="ออกจากระบบ"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/10 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass-panel border-b border-white/10">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "block px-3 py-2 rounded-md text-base font-medium",
                  location.pathname === link.path
                    ? "bg-leica-red text-white"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                )}
              >
                {link.name}
              </Link>
            ))}
            {user && (
              <button
                onClick={() => { logout(); setIsOpen(false); }}
                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-leica-red hover:bg-white/10"
              >
                ออกจากระบบ
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
