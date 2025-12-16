import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, MessageSquare, User, Search } from 'lucide-react';
import { useStore } from '../store';

const Header: React.FC = () => {
  const { currentUser, setCurrentUser, conversations } = useStore();
  const location = useLocation();

  const unreadTotal = conversations.reduce((acc, curr) => acc + curr.unreadCount, 0);

  const navItemClass = (path: string) => `
    flex flex-col items-center justify-center px-4 md:px-6 py-1 text-xs md:text-sm font-normal transition-colors cursor-pointer
    ${location.pathname === path 
      ? 'text-[#1A1A1A] border-b-2 border-[#1A1A1A]' 
      : 'text-[#666666] hover:text-[#1A1A1A]'}
  `;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E6E6E6]">
      <div className="max-w-7xl mx-auto px-4 h-[52px] flex items-center justify-between">
        {/* Left: Logo & Search */}
        <div className="flex items-center gap-2 md:gap-4">
          <Link to="/" className="flex-shrink-0">
            <div className="w-8 h-8 bg-[#0A66C2] rounded-md flex items-center justify-center text-white font-bold text-lg">
              SM
            </div>
          </Link>
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1.5 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search" 
              className="bg-[#EDF3F8] pl-10 pr-4 py-1.5 rounded-md text-sm w-64 focus:w-80 transition-all outline-none border border-transparent focus:border-[#0A66C2]"
            />
          </div>
        </div>

        {/* Center: Navigation */}
        <nav className="flex h-full items-stretch overflow-x-auto scrollbar-hide">
          <Link to="/" className={navItemClass('/')}>
            <Home className="w-5 h-5 md:w-6 md:h-6 mb-0.5" />
            <span className="hidden md:inline">Home</span>
          </Link>
          <div className="border-r border-gray-200 h-8 my-auto mx-2 hidden md:block"></div>
          
          {currentUser === 'owner' ? (
            <>
               <Link to="/messages" className={navItemClass('/messages')}>
                <div className="relative">
                  <MessageSquare className="w-5 h-5 md:w-6 md:h-6 mb-0.5" />
                  {unreadTotal > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] px-1 rounded-full">{unreadTotal}</span>
                  )}
                </div>
                <span className="hidden md:inline">Messaging</span>
              </Link>
               <Link to="/admin" className={navItemClass('/admin')}>
                <User className="w-5 h-5 md:w-6 md:h-6 mb-0.5" />
                <span className="hidden md:inline">Admin</span>
              </Link>
            </>
          ) : (
             <button 
              onClick={() => setCurrentUser('owner')}
              className={navItemClass('#login')}
            >
              <Users className="w-5 h-5 md:w-6 md:h-6 mb-0.5" />
              <span className="hidden md:inline">Login (Sim)</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;