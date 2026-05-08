'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { signInWithGoogle, signOutUser } from '../lib/auth';
import { Search, PlusCircle, Heart, LogIn, LogOut } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = [
    { href: '/', label: '探す', icon: Search },
    { href: user ? '/recipes/new' : null, label: '追加', icon: PlusCircle },
    { href: '/favorites', label: '好き！', icon: Heart },
  ];

  return (
   <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FDFAF5] border-t border-[#E8DDD0] flex justify-around items-center h-16 pb-safe">
     {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href;
        const handleClick = !user && label === '追加' ? (e) => { e.preventDefault(); signInWithGoogle() } : undefined;
        return (
          <Link
            key={label}
            href={href ?? '/'}
            onClick={handleClick}
            className="flex flex-col items-center justify-center flex-1 h-full gap-0.5"
          >
            <Icon
              size={22}
              className={isActive ? 'text-[#C07048]' : 'text-[#A89880]'}
              strokeWidth={isActive ? 2.5 : 1.8}
            />
            <span
              className={`text-[10px] ${isActive ? 'text-[#C07048] font-semibold' : 'text-[#A89880]'}`}
            >
              {label}
            </span>
            {!user && label === '追加' && (
              <span className="text-[8px] text-[#A89880]">要ログイン</span>
            )}
          </Link>
        );
      })}
      {user ? (
        <button
          onClick={signOutUser}
          className="flex flex-col items-center justify-center flex-1 h-full gap-0.5"
        >
          <LogOut size={22} className="text-[#A89880]" strokeWidth={1.8} />
          <span className="text-[10px] text-[#A89880]">ログアウト</span>
        </button>
      ) : (
        <button
          onClick={signInWithGoogle}
          className="flex flex-col items-center justify-center flex-1 h-full gap-0.5"
        >
          <LogIn size={22} className="text-[#A89880]" strokeWidth={1.8} />
          <span className="text-[10px] text-[#A89880]">ログイン</span>
        </button>
      )}
    </nav>
  );
}
