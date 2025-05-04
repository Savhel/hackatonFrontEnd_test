'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService, User } from '../../../services/authService';

interface UserFormData {
  email: string;
  password: string;
  name: string;
  role: string;
}

export default function GestionMembres() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    password: '',
    name: '',
    role: 'membre'
  });
  
  const router = useRouter();
  const currentUser = authService.getCurrentUser();
  
  // Rediriger si l'utilisateur n'est pas admin
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      router.push('/');
    }
  }, [currentUser, router]);

  // Charger les utilisateurs
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        // Dans un vrai projet, ceci serait un appel API
        // Pour ce prototype, on utilise directement les données du JSON
        const allUsers = await import('../../../data/users.json')
          .then(module => module.default)
          .then(data => data.map(({ ...user }: User) => user));
        
        setUsers(allUsers);
      } catch (err) {
        setError('Erreur lors du chargement des membres');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadUsers();
  }, []);

  const handleToggleStatus = (userId: number) => {
    setUsers(prevUsers => 
      prevUsers.map(user => {
        if (user.id === userId) {
          const newStatus = user.status === 'active' ? 'blocked' : 'active';
          return { ...user, status: newStatus };
        }
        return user;
      })
    );
    // Dans un vrai projet, on ferait un appel API pour mettre à jour le statut
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation simple
    if (!formData.email || !formData.password || !formData.name) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    // Créer un nouvel utilisateur
    const newUser: User = {
      id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
      email: formData.email,
      name: formData.name,
      role: formData.role,
      status: 'active'
    };
    
    // Ajouter à la liste
    setUsers(prev => [...prev, newUser]);
    
    // Réinitialiser le formulaire
    setFormData({
      email: '',
      password: '',
      name: '',
      role: 'membre'
    });
    
    setShowAddForm(false);
    setError('');
    
    // Dans un vrai projet, on ferait un appel API pour créer l'utilisateur
  };

  const handleViewProfile = (user: User) => {
    setSelectedUser(user);
  };

  const closeProfile = () => {
    setSelectedUser(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-t-2 border-orange-500 mx-auto"></div>
          <p className="text-black">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-black">Gestion des Membres</h1>
          <div className="flex space-x-4">
            <Link 
              href="/"
              className="rounded-md bg-gray-200 px-4 py-2 text-black hover:bg-gray-300"
            >
              Retour à l&#39;accueil
            </Link>
            <button
              onClick={() => setShowAddForm(true)}
              className="rounded-md bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
            >
              Ajouter un membre
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-red-500">
            {error}
          </div>
        )}

        {/* Tableau des membres */}
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
          <table className="w-full border-collapse bg-white text-left text-sm text-black">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 font-medium text-gray-900">ID</th>
                <th className="px-6 py-4 font-medium text-gray-900">Nom</th>
                <th className="px-6 py-4 font-medium text-gray-900">Email</th>
                <th className="px-6 py-4 font-medium text-gray-900">Rôle</th>
                <th className="px-6 py-4 font-medium text-gray-900">Statut</th>
                <th className="px-6 py-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 border-t border-gray-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{user.id}</td>
                  <td className="px-6 py-4 font-medium">{user.name}</td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                      user.status === 'active' 
                        ? 'bg-green-50 text-green-700' 
                        : 'bg-red-50 text-red-700'
                    }`}>
                      {user.status === 'active' ? 'Actif' : 'Bloqué'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewProfile(user)}
                        className="rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-200"
                      >
                        Voir profil
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user.id)}
                        className={`rounded px-2 py-1 text-xs font-semibold ${
                          user.status === 'active'
                            ? 'bg-red-100 text-red-600 hover:bg-red-200'
                            : 'bg-green-100 text-green-600 hover:bg-green-200'
                        }`}
                      >
                        {user.status === 'active' ? 'Bloquer' : 'Débloquer'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal d'ajout d'utilisateur */}
        {showAddForm && (
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
                <form onSubmit={handleAddUser} className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="mb-4 text-lg font-medium leading-6 text-gray-900">Ajouter un nouveau membre</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nom complet</label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mot de passe</label>
                      <input
                        type="password"
                        name="password"
                        id="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="role" className="block text-sm font-medium text-gray-700">Rôle</label>
                      <select
                        name="role"
                        id="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500"
                      >
                        <option value="membre">Membre</option>
                        <option value="trésorier">Trésorier</option>
                        <option value="secrétaire">Secrétaire</option>
                        <option value="admin">Administrateur</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 sm:text-sm"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="inline-flex w-full justify-center rounded-md border border-transparent bg-orange-500 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 sm:text-sm"
                    >
                      Ajouter
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal de profil utilisateur */}
        {selectedUser && (
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Profil de {selectedUser.name}</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-500">ID</p>
                            <p className="text-sm text-gray-900">{selectedUser.id}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Nom</p>
                            <p className="text-sm text-gray-900">{selectedUser.name}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Email</p>
                            <p className="text-sm text-gray-900">{selectedUser.email}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Rôle</p>
                            <p className="text-sm text-gray-900">{selectedUser.role}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Statut</p>
                            <p className={`text-sm ${selectedUser.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                              {selectedUser.status === 'active' ? 'Actif' : 'Bloqué'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    onClick={closeProfile}
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-orange-500 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}