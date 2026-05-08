'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { Home, Search, PlusCircle, Heart } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = [
    { href: '/', label: 'ホーム', icon: Home },
    { href: '/explore', label: '検索', icon: Search },
    ...(user ? [{ href: '/recipes/new', label: '追加', icon: PlusCircle }] : []),
    { href: '/favorites', label: '好き！', icon: Heart },
  ];

  return (
   <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FDFAF5] border-t border-[#E8DDD0] flex justify-around items-center h-16 pb-safe">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
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
          </Link>
        );
      })}
    </nav>
  );
}
