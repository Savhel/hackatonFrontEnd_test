'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Tableau de bord', path: '/finance/dashboard' },
    { name: 'Transactions', path: '/finance/transactions' },
    { name: 'Cotisations', path: '/finance/contributions' },
    { name: 'Bilans financiers', path: '/finance/reports' },
    { name: 'Bilan par entité', path: '/finance/entity-report' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold text-orange-600">Finances</h2>
        </div>
        <nav className="mt-4">
          <ul>
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`block px-4 py-2 text-sm ${pathname === item.path ? 'bg-orange-100 text-orange-600 font-medium' : 'text-gray-600 hover:bg-orange-50'}`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}