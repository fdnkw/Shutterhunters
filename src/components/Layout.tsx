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
    <div className="min-h-screen flex flex-col bg-leica-black text-white">
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
    </div>
  );
}
