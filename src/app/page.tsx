'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { authService, User } from '../services/authService';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-white">
      <div className="max-w-2xl w-full text-center p-8 rounded-lg border-2 border-orange-500 shadow-lg">
        <h1 className="text-4xl font-bold mb-6 text-black">Gestion des Organisations Académiques</h1>
        
        {currentUser ? (
          <>
            <div className="mb-6">
              <p className="text-xl text-black mb-2">Bienvenue, {currentUser.name}</p>
              <p className="text-md text-gray-600 mb-4">Rôle: {currentUser.role}</p>
              
              <div className="flex flex-col space-y-4 items-center">
                {currentUser.role === 'admin' && (
                  <>
                    <Link 
                      href="/admin/membres" 
                      className="inline-block rounded-md bg-orange-500 px-4 py-2 text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 w-64"
                    >
                      Gestion des membres
                    </Link>
                    <Link 
                      href="/admin/evenements" 
                      className="inline-block rounded-md bg-orange-500 px-4 py-2 text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 w-64"
                    >
                      Gestion des événements
                    </Link>
                    <Link 
                      href="/admin/projets" 
                      className="inline-block rounded-md bg-orange-500 px-4 py-2 text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 w-64"
                    >
                      Gestion des projets
                    </Link>
                    <Link 
                      href="/finance/dashboard" 
                      className="inline-block rounded-md bg-orange-500 px-4 py-2 text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 w-64"
                    >
                      Gestion financière
                    </Link>
                  </>
                )}
                
                <button 
                  onClick={() => {
                    authService.logout();
                    setCurrentUser(null);
                  }}
                  className="inline-block rounded-md border border-orange-500 px-4 py-2 text-orange-500 hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 w-64"
                >
                  Se déconnecter
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <p className="mb-8 text-lg text-gray-800">
              Bienvenue sur la plateforme de gestion des organisations en milieu académique.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login" className="inline-block rounded-md bg-orange-500 px-4 py-2 text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
                Se connecter
              </Link>
              
              <Link href="/about" className="inline-block rounded-md border border-orange-500 px-4 py-2 text-orange-500 hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
                En savoir plus
              </Link>
            </div>
          </>
        )}
        
        <div className="mt-12 text-sm text-gray-600">
          <p>Application développée pour la gestion des organisations académiques</p>
        </div>
      </div>
    </main>
  );

}
