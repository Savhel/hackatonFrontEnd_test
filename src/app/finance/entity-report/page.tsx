'use client';

import { useState, useEffect } from 'react';
import { financeService } from '../../../services/financeService';
import { Project } from '../../../services/eventProjectService';
import { Event } from '../../../services/eventProjectService';

export default function EntityFinancialReportPage() {
  const [entityType, setEntityType] = useState('project');
  const [entityId, setEntityId] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [financialData, setFinancialData] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    balance: 0,
    contributions: 0,
    transactions: []
  });

  useEffect(() => {
    // Charger les projets et événements
    const loadEntities = async () => {
      try {
        const projectsData = await import('../../../data/projects.json');
        const eventsData = await import('../../../data/events.json');
        
        // Convertir les données des projets pour s'assurer que le status est du bon type
        const typedProjects = projectsData.default.map(project => ({
          ...project,
          // Vérifier que le status est une valeur valide pour le type Project
          status: project.status as 'planning' | 'in_progress' | 'completed' | 'cancelled'
        }));
        
        // Convertir les données des événements pour s'assurer que le status est du bon type
        const typedEvents = eventsData.default.map(event => ({
          ...event,
          // Vérifier que le status est une valeur valide pour le type Event
          status: event.status as 'planned' | 'in_progress' | 'completed' | 'cancelled'
        }));
        
        setProjects(typedProjects);
        setEvents(typedEvents);
      } catch (error) {
        console.error('Erreur lors du chargement des entités:', error);
      }
    };

    loadEntities();
  }, []);

  useEffect(() => {
    if (entityId) {
      generateFinancialData();
    }
  }, [entityType, entityId]);

  const generateFinancialData = () => {
    const id = parseInt(entityId);
    
    // Récupérer les transactions liées à cette entité
    const transactions = financeService.getTransactionsByRelatedEntity(
      entityType as 'project' | 'event',
      id
    );
    
    // Récupérer les contributions liées à cette entité
    const contributions = financeService.getContributionsByRelatedEntity(
      entityType as 'project' | 'event',
      id
    );
    
    // Calculer les totaux
    const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0);
    const totalRevenue = transactions
      .filter(t => t.type === 'deposit')
      .reduce((sum, t) => sum + t.amount, 0) + totalContributions;
    
    const totalExpenses = transactions
      .filter(t => t.type === 'withdrawal')
      .reduce((sum, t) => sum + t.amount, 0);
    
    setFinancialData({
      totalRevenue,
      totalExpenses,
      balance: totalRevenue - totalExpenses,
      contributions: totalContributions,
      transactions
    });
  };

  const getEntityName = (type: string, id: string) => {
    if (!id) return '';
    const entityId = parseInt(id);
    
    if (type === 'project') {
      const project = projects.find(p => p.id === entityId);
      return project ? project.title : `Projet #${id}`;
    } else {
      const event = events.find(e => e.id === entityId);
      return event ? event.title : `Événement #${id}`;
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Bilan Financier par Entité</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Sélectionner une Entité</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type d'Entité</label>
            <select
              value={entityType}
              onChange={(e) => {
                setEntityType(e.target.value);
                setEntityId('');
              }}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="project">Projet</option>
              <option value="event">Événement</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Entité</label>
            <select
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Sélectionner une entité</option>
              {entityType === 'project' ? (
                projects.map(project => (
                  <option key={project.id} value={project.id}>{project.title}</option>
                ))
              ) : (
                events.map(event => (
                  <option key={event.id} value={event.id}>{event.title}</option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>
      
      {entityId && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-6">
            Bilan Financier: {getEntityName(entityType, entityId)}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-4 border rounded-md bg-green-50">
              <h3 className="text-lg font-medium mb-2 text-green-700">Revenus Totaux</h3>
              <p className="text-2xl font-bold text-green-600">
                {financialData.totalRevenue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </p>
              <div className="mt-2 text-sm text-green-600">
                <p>Dont contributions: {financialData.contributions.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</p>
              </div>
            </div>
            
            <div className="p-4 border rounded-md bg-red-50">
              <h3 className="text-lg font-medium mb-2 text-red-700">Dépenses Totales</h3>
              <p className="text-2xl font-bold text-red-600">
                {financialData.totalExpenses.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </p>
            </div>
            
            <div className="p-4 border rounded-md bg-blue-50">
              <h3 className="text-lg font-medium mb-2 text-blue-700">Solde</h3>
              <p className={`text-2xl font-bold ${financialData.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {financialData.balance.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </p>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Transactions</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {financialData.transactions.length > 0 ? (
                    financialData.transactions.map((transaction, index) => (
                      <tr key={index}>
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
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                        Aucune transaction pour cette entité
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={() => window.print()}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
              </svg>
              Imprimer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}