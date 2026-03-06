import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-auto py-6 border-t border-white/10 text-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs text-gray-500">
          ©Dev.Dil{' '}
          <a
            href="https://lin.ee/stQjk0XK"
            target="_blank"
            rel="noopener noreferrer"
            className="text-leica-red hover:underline ml-1"
          >
            ติดต่อนักพัฒนา
          </a>
        </p>
      </div>
    </footer>
  );
}
