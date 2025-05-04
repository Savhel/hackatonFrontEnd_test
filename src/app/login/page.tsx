'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService, LoginCredentials } from '@/services/authService';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (!email || !password) {
        setError('Veuillez remplir tous les champs');
        return;
      }
      
      const credentials: LoginCredentials = { email, password };
      const user = await authService.login(credentials);
      
      if (user) {
        // Redirection vers la page d'accueil après connexion
        router.push('/');
      } else {
        setError('Email ou mot de passe incorrect');
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la connexion');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4">
      <div className="w-full max-w-md rounded-lg border-2 border-orange-500 bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-3xl font-bold text-black">Connexion</h1>
        
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-red-500">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-black">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-orange-300 px-3 py-2 text-black shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              placeholder="votre@email.com"
              disabled={loading}
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-black">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-orange-300 px-3 py-2 text-black shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              placeholder="••••••••"
              disabled={loading}
              required
            />
          </div>
          
          <div>
            <button
              type="submit"
              className="w-full rounded-md bg-orange-500 px-4 py-2 text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-70"
              disabled={loading}
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center text-sm text-black">
          <p className="mb-2">Utilisez ces identifiants pour tester :</p>
          <p className="text-xs text-gray-600">Email: admin@example.com / Mot de passe: admin123</p>
          <div className="mt-4">
            <Link href="/" className="text-orange-500 hover:text-orange-600 font-medium">
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}