'use client';

import { useState, useEffect } from 'react';
import { financeService, Transaction } from '../../../services/financeService';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState({
    type: 'all',
    relatedTo: 'all',
    startDate: '',
    endDate: ''
  });
  const [showForm, setShowForm] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: 0,
    type: 'deposit',
    relatedType: '',
    relatedId: ''
  });

  useEffect(() => {
    const allTransactions = financeService.getAllTransactions();
    setTransactions(allTransactions);
    setFilteredTransactions(allTransactions);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filter, transactions]);

  const applyFilters = () => {
    let filtered = [...transactions];

    // Filtrer par type
    if (filter.type !== 'all') {
      filtered = filtered.filter(t => t.type === filter.type);
    }

    // Filtrer par entité liée
    if (filter.relatedTo !== 'all') {
      filtered = filtered.filter(t => t.relatedTo?.type === filter.relatedTo);
    }

    // Filtrer par date
    if (filter.startDate) {
      filtered = filtered.filter(t => new Date(t.date) >= new Date(filter.startDate));
    }

    if (filter.endDate) {
      filtered = filtered.filter(t => new Date(t.date) <= new Date(filter.endDate));
    }

    setFilteredTransactions(filtered);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };

  const handleNewTransactionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewTransaction(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simuler l'ajout d'une transaction (dans une application réelle, cela serait envoyé au backend)
    const newId = Math.max(...transactions.map(t => t.id)) + 1;
    const relatedTo = newTransaction.relatedType ? {
      type: newTransaction.relatedType as 'event' | 'project',
      id: parseInt(newTransaction.relatedId)
    } : undefined;

    const transaction: Transaction = {
      id: newId,
      date: new Date().toISOString(),
      amount: newTransaction.amount,
      type: newTransaction.type as 'deposit' | 'withdrawal',
      description: newTransaction.description,
      createdBy: 1, // Utilisateur actuel (à remplacer par l'ID de l'utilisateur connecté)
      relatedTo
    };

    setTransactions(prev => [transaction, ...prev]);
    setShowForm(false);
    setNewTransaction({
      description: '',
      amount: 0,
      type: 'deposit',
      relatedType: '',
      relatedId: ''
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion des Transactions</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md"
        >
          {showForm ? 'Annuler' : 'Nouvelle Transaction'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Nouvelle Transaction</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={newTransaction.description}
                  onChange={handleNewTransactionChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Montant</label>
                <input
                  type="number"
                  name="amount"
                  value={newTransaction.amount}
                  onChange={handleNewTransactionChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  name="type"
                  value={newTransaction.type}
                  onChange={handleNewTransactionChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="deposit">Revenu</option>
                  <option value="withdrawal">Dépense</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lié à</label>
                <select
                  name="relatedType"
                  value={newTransaction.relatedType}
                  onChange={handleNewTransactionChange}
                  className="w-full p-2 border border-gray-300 rounded-md mb-2"
                >
                  <option value="">Aucun</option>
                  <option value="project">Projet</option>
                  <option value="event">Événement</option>
                </select>
                
                {newTransaction.relatedType && (
                  <input
                    type="number"
                    name="relatedId"
                    value={newTransaction.relatedId}
                    onChange={handleNewTransactionChange}
                    placeholder="ID du projet/événement"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                )}
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

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Filtres</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              name="type"
              value={filter.type}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="all">Tous</option>
              <option value="deposit">Revenus</option>
              <option value="withdrawal">Dépenses</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lié à</label>
            <select
              name="relatedTo"
              value={filter.relatedTo}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="all">Tous</option>
              <option value="project">Projets</option>
              <option value="event">Événements</option>
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
        <h2 className="text-xl font-semibold mb-4">Liste des Transactions</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lié à</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map(transaction => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transaction.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${transaction.type === 'deposit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {transaction.type === 'deposit' ? 'Revenu' : 'Dépense'}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'deposit' ? '+' : '-'}{transaction.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.relatedTo ? (
                        `${transaction.relatedTo.type === 'project' ? 'Projet' : 'Événement'} #${transaction.relatedTo.id}`
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    Aucune transaction trouvée
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