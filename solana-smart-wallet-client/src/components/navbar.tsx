import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';

function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-white backdrop-blur-md backdrop-brightness-150 bg-opacity-20 shadow rounded-md">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <div className="flex items-center">
          <Link className="text-blue-500 font-bold text-xl" href="/">
            Solana Smart Wallet
          </Link>
        </div>
        <div className="hidden md:flex space-x-4">
          <Link className="hover:text-blue-500" href="/about">
            About
          </Link>
          <Link className="hover:text-blue-500" href="/contact">
            Contact
          </Link>
        </div>
        <div className="flex items-center">
          {session ? (
            <>
              <span className="mr-4 text-white">Welcome, {session.user?.name}</span>
              <button onClick={() => signOut()} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                Sign Out
              </button>
            </>
          ) : (
            <button onClick={() => signIn('google')} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

