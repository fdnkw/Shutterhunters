import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { useStore } from '../store';
import Navbar from './Navbar';
import Footer from './Footer';
import LoginModal from './LoginModal';

export default function Layout() {
  const { fetchData, isLoading } = useStore();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="min-h-screen flex flex-col bg-leica-black text-white relative">
      <Navbar />
      
      {isLoading && (
        <div className="fixed top-0 left-0 w-full h-1 bg-white/10 z-50">
          <div className="h-full bg-leica-red animate-pulse w-1/3 rounded-r-full"></div>
        </div>
      )}

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <Footer />
      <LoginModal />

      {/* Floating Line Button */}
      <a
        href="https://line.me/R/ti/p/@shutterhunters.bkk"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 z-40 transition-transform hover:scale-110 flex items-center justify-center drop-shadow-lg"
        title="ติดต่อทาง Line"
      >
        <img 
          src="https://static.vecteezy.com/system/resources/previews/023/986/890/original/line-app-logo-line-app-logo-transparent-line-app-icon-transparent-free-free-png.png" 
          alt="Line" 
          className="w-14 h-14 object-contain"
          referrerPolicy="no-referrer"
        />
      </a>
    </div>
  );
}
