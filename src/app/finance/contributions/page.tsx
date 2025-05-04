'use client';

import { useState, useEffect } from 'react';
import { financeService, Contribution } from '../../../services/financeService';
import { authService, User } from '../../../services/authService';

export default function ContributionsPage() {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [filteredContributions, setFilteredContributions] = useState<Contribution[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState({
    type: 'all',
    contributorId: 'all',
    startDate: '',
    endDate: ''
  });
  const [showForm, setShowForm] = useState(false);
  const [newContribution, setNewContribution] = useState({
    amount: 0,
    contributorId: '',
    relatedType: 'organization',
    relatedId: '1',
    description: 'Cotisation annuelle'
  });

  useEffect(() => {
    // Charger les contributions et les utilisateurs
    const allContributions = financeService.getAllContributions();
    const allUsers = authService.getAllUsers();
    
    setContributions(allContributions);
    setFilteredContributions(allContributions);
    setUsers(allUsers);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filter, contributions]);

  const applyFilters = () => {
    let filtered = [...contributions];

    // Filtrer par type d'entité
    if (filter.type !== 'all') {
      filtered = filtered.filter(c => c.relatedTo.type === filter.type);
    }

    // Filtrer par contributeur
    if (filter.contributorId !== 'all') {
      filtered = filtered.filter(c => c.contributorId === parseInt(filter.contributorId));
    }

    // Filtrer par date
    if (filter.startDate) {
      filtered = filtered.filter(c => new Date(c.date) >= new Date(filter.startDate));
    }

    if (filter.endDate) {
      filtered = filtered.filter(c => new Date(c.date) <= new Date(filter.endDate));
    }

    setFilteredContributions(filtered);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };

  const handleNewContributionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewContribution(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simuler l'ajout d'une contribution (dans une application réelle, cela serait envoyé au backend)
    const newId = Math.max(...contributions.map(c => c.id)) + 1;
    
    const contribution: Contribution = {
      id: newId,
      date: new Date().toISOString(),
      amount: Number(newContribution.amount),
      contributorId: parseInt(newContribution.contributorId),
      relatedTo: {
        type: newContribution.relatedType as 'event' | 'project' | 'organization',
        id: parseInt(newContribution.relatedId)
      },
      description: newContribution.description
    };

    setContributions(prev => [contribution, ...prev]);
    setShowForm(false);
    setNewContribution({
      amount: 0,
      contributorId: '',
      relatedType: 'organization',
      relatedId: '1',
      description: 'Cotisation annuelle'
    });
  };

  const getUserName = (userId: number) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : `Utilisateur #${userId}`;
  };

  const getContributionsByMember = () => {
    const memberContributions: {[key: string]: number} = {};
    
    users.forEach(user => {
      const userContributions = contributions.filter(c => c.contributorId === user.id);
      const total = userContributions.reduce((sum, c) => sum + c.amount, 0);
      memberContributions[user.id] = total;
    });
    
    return memberContributions;
  };

  const memberContributions = getContributionsByMember();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion des Cotisations</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md"
        >
          {showForm ? 'Annuler' : 'Nouvelle Cotisation'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Nouvelle Cotisation</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Montant</label>
                <input
                  type="number"
                  name="amount"
                  value={newContribution.amount}
                  onChange={handleNewContributionChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contributeur</label>
                <select
                  name="contributorId"
                  value={newContribution.contributorId}
                  onChange={handleNewContributionChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Sélectionner un membre</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  name="relatedType"
                  value={newContribution.relatedType}
                  onChange={handleNewContributionChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="organization">Organisation</option>
                  <option value="project">Projet</option>
                  <option value="event">Événement</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID de l'entité</label>
                <input
                  type="number"
                  name="relatedId"
                  value={newContribution.relatedId}
                  onChange={handleNewContributionChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  min="1"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={newContribution.description}
                  onChange={handleNewContributionChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md"
              >
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Filtres</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                name="type"
                value={filter.type}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="all">Tous</option>
                <option value="organization">Organisation</option>
                <option value="project">Projets</option>
                <option value="event">Événements</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contributeur</label>
              <select
                name="contributorId"
                value={filter.contributorId}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="all">Tous</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
              <input
                type="date"
                name="startDate"
                value={filter.startDate}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
              <input
                type="date"
                name="endDate"
                value={filter.endDate}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Cotisations par Membre</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Membre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total des cotisations</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(user => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(memberContributions[user.id] || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Liste des Cotisations</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Membre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContributions.length > 0 ? (
                filteredContributions.map(contribution => (
                  <tr key={contribution.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(contribution.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {getUserName(contribution.contributorId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                      {contribution.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contribution.relatedTo.type === 'organization' ? 'Organisation' :
                       contribution.relatedTo.type === 'project' ? 'Projet' : 'Événement'}
                      {` #${contribution.relatedTo.id}`}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {contribution.description}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    Aucune cotisation trouvée
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}