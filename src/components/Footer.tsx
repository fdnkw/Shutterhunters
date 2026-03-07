import { Link } from 'react-router-dom';
import { Instagram, Facebook, Phone, MapPin, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto py-8 border-t border-white/10 text-center bg-black/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-400 mb-8">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-white">
              <MessageCircle size={16} />
              <span className="font-bold">Contact</span>
            </div>
            <p>Line: @shutterhunters.bkk</p>
            <p>Tel: 099-173-9999, 099-176-9999</p>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-white">
              <MapPin size={16} />
              <span className="font-bold">Location</span>
            </div>
            <p>The PRIDE Pattanakarn 30</p>
            <p>Home Office</p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-white">
              <span className="font-bold">Social Media</span>
            </div>
            <a href="https://instagram.com/ShutterHunters.bkk" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-leica-red transition-colors">
              <Instagram size={16} />
              IG: ShutterHunters.bkk
            </a>
            <a href="https://facebook.com/ShutterHuntersBKK" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-leica-red transition-colors">
              <Facebook size={16} />
              Facebook: ShutterHunters BKK
            </a>
          </div>
        </div>

        <p className="text-xs text-gray-500 pt-4 border-t border-white/10">
          <a
            href="https://lin.ee/stQjk0XK"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-leica-red transition-colors"
          >
            ©Dev.Dil
          </a>
        </p>
      </div>
    </footer>
  );
}
