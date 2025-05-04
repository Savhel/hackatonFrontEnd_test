'use client';

import { useState, useEffect } from 'react';
import { financeService, Transaction } from '../../../services/financeService';
import { Chart } from 'chart.js/auto';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

export default function FinanceDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [monthlyData, setMonthlyData] = useState<{labels: string[], deposits: number[], withdrawals: number[]}>({
    labels: [],
    deposits: [],
    withdrawals: []
  });
  const [contributionsByType, setContributionsByType] = useState<{labels: string[], data: number[]}>({ 
    labels: [], 
    data: [] 
  });

  useEffect(() => {
    // Récupérer les données financières
    const allTransactions = financeService.getAllTransactions();
    setTransactions(allTransactions);
    setCurrentBalance(financeService.getCurrentBalance());

    // Préparer les données pour les graphiques mensuels
    prepareMonthlyData(allTransactions);
    
    // Préparer les données pour le graphique des contributions
    prepareContributionData();
  }, []);

  const prepareMonthlyData = (transactions: Transaction[]) => {
    // Grouper les transactions par mois
    const months: {[key: string]: {deposits: number, withdrawals: number}} = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (!months[monthKey]) {
        months[monthKey] = { deposits: 0, withdrawals: 0 };
      }
      
      if (transaction.type === 'deposit') {
        months[monthKey].deposits += transaction.amount;
      } else {
        months[monthKey].withdrawals += transaction.amount;
      }
    });
    
    // Convertir en format pour Chart.js
    const sortedMonths = Object.keys(months).sort();
    const labels = sortedMonths.map(month => {
      const [year, monthNum] = month.split('-');
      return `${monthNum}/${year}`;
    });
    
    const deposits = sortedMonths.map(month => months[month].deposits);
    const withdrawals = sortedMonths.map(month => months[month].withdrawals);
    
    setMonthlyData({ labels, deposits, withdrawals });
  };

  const prepareContributionData = () => {
    const contributions = financeService.getAllContributions();
    const typeMap: {[key: string]: number} = {};
    
    contributions.forEach(contribution => {
      const type = contribution.relatedTo.type;
      if (!typeMap[type]) {
        typeMap[type] = 0;
      }
      typeMap[type] += contribution.amount;
    });
    
    setContributionsByType({
      labels: Object.keys(typeMap).map(type => {
        switch(type) {
          case 'organization': return 'Organisation';
          case 'project': return 'Projets';
          case 'event': return 'Événements';
          default: return type;
        }
      }),
      data: Object.values(typeMap)
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Tableau de Bord Financier</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Solde Actuel</h2>
          <p className={`text-3xl font-bold ${currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {currentBalance.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Revenus Totaux</h2>
          <p className="text-3xl font-bold text-green-600">
            {financeService.getTotalByType('deposit').toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Dépenses Totales</h2>
          <p className="text-3xl font-bold text-red-600">
            {financeService.getTotalByType('withdrawal').toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Évolution de la Trésorerie</h2>
          <div className="h-80">
            <Line 
              data={{
                labels: monthlyData.labels,
                datasets: [
                  {
                    label: 'Revenus',
                    data: monthlyData.deposits,
                    borderColor: 'rgb(34, 197, 94)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    tension: 0.3
                  },
                  {
                    label: 'Dépenses',
                    data: monthlyData.withdrawals,
                    borderColor: 'rgb(239, 68, 68)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.3
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Montant (€)'
                    }
                  },
                  x: {
                    title: {
                      display: true,
                      text: 'Mois'
                    }
                  }
                }
              }}
            />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Répartition des Contributions</h2>
          <div className="h-80 flex items-center justify-center">
            <Doughnut 
              data={{
                labels: contributionsByType.labels,
                datasets: [
                  {
                    data: contributionsByType.data,
                    backgroundColor: [
                      'rgba(255, 99, 132, 0.7)',
                      'rgba(54, 162, 235, 0.7)',
                      'rgba(255, 206, 86, 0.7)'
                    ],
                    borderColor: [
                      'rgba(255, 99, 132, 1)',
                      'rgba(54, 162, 235, 1)',
                      'rgba(255, 206, 86, 1)'
                    ],
                    borderWidth: 1
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Dernières Transactions</h2>
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
              {transactions.slice(0, 5).map(transaction => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}