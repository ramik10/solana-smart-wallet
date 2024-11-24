import { useRouter } from 'next/router';
import { useState } from 'react';

const Header = () => {
const router = useRouter()
  // State to manage the visibility of the mobile menu
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Function to toggle the mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="flex justify-between items-center p-4 sm:p-6">
      {/* Logo or Brand Name */}
      <div className="text-white text-xl sm:text-2xl md:text-3xl xl:text-4xl font-bold">SoonBoard</div>
      
      {/* Navigation Links - visible on larger screens */}
      <nav className="hidden sm:flex space-x-4 sm:space-x-6 md:space-x-8 text-white">
        <a href="https://ramiks-organization.gitbook.io/soonboard" className="hover:underline">Dev Support</a>
        <a href="https://discord.gg/DrZqJvFzHS" className="hover:underline">Community</a>
        <a href="https://t.me/+2tYZ8Tb1fKA4Nzdl" className="hover:underline">Telegram</a>
      </nav>
      
      {/* Get Started Button - visible on larger screens */}
      <button onClick={()=>router.push("/wallet")} className=" bg-green-950 bg-opacity-90 border border-green-700 text-white py-2 px-4 sm:px-6 rounded hidden md:block">
        Get Started
      </button>

      {/* Mobile Menu Icon - visible on smaller screens */}
      <button className="text-white sm:hidden" onClick={toggleMenu}>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
        </svg>
      </button>

      {/* Mobile Navigation Menu - shown when menu is open */}
      {isMenuOpen && (
        <nav className="absolute top-full left-0 right-0 bg-green-950 bg-opacity-95 text-white flex flex-col space-y-4 p-4 sm:hidden">
          <a href="https://ramiks-organization.gitbook.io/soonboard" className="hover:underline">Dev Support</a>
          <a href="https://discord.gg/DrZqJvFzHS" className="hover:underline">Community</a>
          <a href="https://t.me/+2tYZ8Tb1fKA4Nzdl" className="hover:underline">Telegram</a>
          <button onClick={()=>router.push("/wallet")} className="border border-white text-white py-2 px-4 rounded">
            Get Started
          </button>
        </nav>
      )}
    </header>
  );
};

export default Header;



