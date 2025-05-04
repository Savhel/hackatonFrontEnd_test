'use client';

import { useState, useEffect } from 'react';
import { financeService, FinancialReport } from '../../../services/financeService';
import { Project } from '../../../services/eventProjectService';
import { Event } from '../../../services/eventProjectService';

export default function FinancialReportsPage() {
  const [reportType, setReportType] = useState('general');
  const [entityType, setEntityType] = useState('project');
  const [entityId, setEntityId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPdfReady, setIsPdfReady] = useState(false);

  useEffect(() => {
    // Charger les projets et événements
    const loadEntities = async () => {
      try {
        // Dans une application réelle, ces données seraient chargées depuis une API
        const projectsData = await import('../../../data/projects.json');
        const eventsData = await import('../../../data/events.json');
        setProjects(projectsData.default);
        setEvents(eventsData.default);
      } catch (error) {
        console.error('Erreur lors du chargement des entités:', error);
      }
    };

    loadEntities();
  }, []);

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setIsPdfReady(false);
    
    // Simuler un délai de génération de rapport
    setTimeout(() => {
      // Dans une application réelle, cela appellerait une API pour générer le rapport
      const generatedReport: FinancialReport = {
        startDate: startDate || '2024-01-01',
        endDate: endDate || new Date().toISOString().split('T')[0],
        initialBalance: 0,
        finalBalance: 0,
        deposits: [],
        withdrawals: [],
        totalDeposits: 0,
        totalWithdrawals: 0
      };
      
      if (reportType === 'general') {
        // Rapport général
        generatedReport.deposits = financeService.getTransactionsByType('deposit');
        generatedReport.withdrawals = financeService.getTransactionsByType('withdrawal');
      } else {
        // Rapport pour une entité spécifique
        if (entityId) {
          generatedReport.deposits = financeService.getTransactionsByRelatedEntity(
            entityType as 'project' | 'event',
            parseInt(entityId)
          ).filter(t => t.type === 'deposit');
          
          generatedReport.withdrawals = financeService.getTransactionsByRelatedEntity(
            entityType as 'project' | 'event',
            parseInt(entityId)
          ).filter(t => t.type === 'withdrawal');
        }
      }
      
      // Calculer les totaux
      generatedReport.totalDeposits = generatedReport.deposits.reduce((sum, t) => sum + t.amount, 0);
      generatedReport.totalWithdrawals = generatedReport.withdrawals.reduce((sum, t) => sum + t.amount, 0);
      generatedReport.initialBalance = 0; // Dans une application réelle, cela serait calculé
      generatedReport.finalBalance = generatedReport.initialBalance + generatedReport.totalDeposits - generatedReport.totalWithdrawals;
      
      setReport(generatedReport);
      setIsGenerating(false);
    }, 1000);
  };

  const handleGeneratePdf = () => {
    // Simuler la génération d'un PDF
    setIsPdfReady(true);
    // Dans une application réelle, cela déclencherait le téléchargement d'un PDF
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
      <h1 className="text-3xl font-bold mb-6">Rapports Financiers</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Générer un Rapport</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type de Rapport</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="general">Rapport Général</option>
              <option value="entity">Rapport par Entité</option>
            </select>
          </div>
          
          {reportType === 'entity' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type d'Entité</label>
                <select
                  value={entityType}
                  onChange={(e) => setEntityType(e.target.value)}
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
            </>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de Début</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de Fin</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={handleGenerateReport}
            disabled={reportType === 'entity' && !entityId}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isGenerating ? 'Génération en cours...' : 'Générer le Rapport'}
          </button>
        </div>
      </div>
      
      {report && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {reportType === 'general' ? 'Rapport Financier Général' : `Rapport Financier: ${getEntityName(entityType, entityId)}`}
            </h2>
            <button
              onClick={handleGeneratePdf}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
              </svg>
              Exporter en PDF
            </button>
          </div>
          
          {isPdfReady && (
            <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md">
              Le PDF est prêt ! Dans une application réelle, le téléchargement démarrerait automatiquement.
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 border rounded-md">
              <h3 className="text-lg font-medium mb-2">Période</h3>
              <p>Du: {new Date(report.startDate).toLocaleDateString('fr-FR')}</p>
              <p>Au: {new Date(report.endDate).toLocaleDateString('fr-FR')}</p>
            </div>
            
            <div className="p-4 border rounded-md">
              <h3 className="text-lg font-medium mb-2">Résumé</h3>
              <p>Solde initial: {report.initialBalance.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</p>
              <p>Total des revenus: {report.totalDeposits.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</p>
              <p>Total des dépenses: {report.totalWithdrawals.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</p>
              <p className="font-bold mt-2">Solde final: {report.finalBalance.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Revenus</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {report.deposits.length > 0 ? (
                    report.deposits.map((deposit, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(deposit.date).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {deposit.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                          {deposit.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                        Aucun revenu pour cette période
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-3">Dépenses</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {report.withdrawals.length > 0 ? (
                    report.withdrawals.map((withdrawal, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(withdrawal.date).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {withdrawal.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                          {withdrawal.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                        Aucune dépense pour cette période
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}