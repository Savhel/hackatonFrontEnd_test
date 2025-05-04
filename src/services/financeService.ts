import transactions from '../data/transactions.json';
import contributions from '../data/contributions.json';

export interface Transaction {
  id: number;
  date: string;
  amount: number;
  type: string;
  description: string;
  createdBy: number;
  relatedTo?: {
    type: string;
    id: number;
  };
}

export interface Contribution {
  id: number;
  date: string;
  amount: number;
  contributorId: number;
  relatedTo: {
    type: 'event' | 'project' | 'organization';
    id: number;
  };
  description: string;
}

export interface FinancialReport {
  startDate: string;
  endDate: string;
  initialBalance: number;
  finalBalance: number;
  deposits: Transaction[];
  withdrawals: Transaction[];
  totalDeposits: number;
  totalWithdrawals: number;
}

export const financeService = {
  // Fonctions pour les transactions
  getAllTransactions: (): Transaction[] => {
    const validTypes = ['event', 'project'] as const;
    return transactions.filter(transaction => 
      !transaction.relatedTo || validTypes.includes(transaction.relatedTo.type as typeof validTypes[number])
    ) as Transaction[];
  },

  getTransactionById: (id: number): Transaction | undefined => {
    const transaction = transactions.find(transaction => transaction.id === id);
    if (!transaction) return undefined;

    // Ensure relatedTo.type is correctly typed
    if (transaction.relatedTo) {
      const validTypes = ['event', 'project'] as const;
      if (!validTypes.includes(transaction.relatedTo.type as typeof validTypes[number])) {
        return undefined;
      }
    }
    return transaction as Transaction ;
  },

  getTransactionsByType: (type: 'deposit' | 'withdrawal'): Transaction[] => {
    return transactions.filter(transaction => transaction.type === type) as Transaction[];
  },

  getTransactionsByRelatedEntity: (type: 'event' | 'project', id: number): Transaction[] => {
    return transactions.filter(
      transaction => transaction.relatedTo?.type === type && transaction.relatedTo?.id === id
    );
  },

  getCurrentBalance: (): number => {
    return transactions.reduce((balance, transaction) => {
      return transaction.type === 'deposit'
        ? balance + transaction.amount
        : balance - transaction.amount;
    }, 0);
  },

  // Fonctions pour les contributions
  getAllContributions: (): Contribution[] => {
    return contributions as Contribution[];
  },

  getContributionById: (id: number): Contribution | undefined => {
    return contributions.find(contribution => contribution.id === id) as Contribution;
  },

  getContributionsByContributor: (contributorId: number): Contribution[] => {
    return contributions.filter(contribution => contribution.contributorId === contributorId) as Contribution[];
  },

  getContributionsByRelatedEntity: (
    type: 'event' | 'project' | 'organization',
    id: number
  ): Contribution[] => {
    return contributions.filter(
      contribution => contribution.relatedTo.type === type && contribution.relatedTo.id === id
    ) as Contribution[];
  },

  getTotalContributionsByEntity: (
    type: 'event' | 'project' | 'organization',
    id: number
  ): number => {
    const entityContributions = contributions.filter(
      contribution => contribution.relatedTo.type === type && contribution.relatedTo.id === id
    );
    return entityContributions.reduce((total, contribution) => total + contribution.amount, 0);
  },

  // Génération de rapports financiers
  generateFinancialReport: (startDate: string, endDate: string): FinancialReport => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Filtrer les transactions dans la période
    const periodTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= start && transactionDate <= end;
    });

    // Calculer le solde initial (toutes les transactions avant la date de début)
    const initialBalance = transactions
      .filter(transaction => new Date(transaction.date) < start)
      .reduce(
        (balance, transaction) =>
          transaction.type === 'deposit'
            ? balance + transaction.amount
            : balance - transaction.amount,
        0
      );

    // Séparer les dépôts et retraits
    const deposits = periodTransactions.filter(t => t.type === 'deposit');
    const withdrawals = periodTransactions.filter(t => t.type === 'withdrawal');

    // Calculer les totaux
    const totalDeposits = deposits.reduce((sum, t) => sum + t.amount, 0);
    const totalWithdrawals = withdrawals.reduce((sum, t) => sum + t.amount, 0);

    // Calculer le solde final
    const finalBalance = initialBalance + totalDeposits - totalWithdrawals;

    return {
      startDate,
      endDate,
      initialBalance,
      finalBalance,
      deposits,
      withdrawals,
      totalDeposits,
      totalWithdrawals
    };
  },

  // Fonctions pour les bilans de projets et événements
  generateProjectFinancialSummary: (projectId: number) => {
    const projectTransactions = transactions.filter(
      t => t.relatedTo?.type === 'project' && t.relatedTo.id === projectId
    );
    const projectContributions = contributions.filter(
      c => c.relatedTo.type === 'project' && c.relatedTo.id === projectId
    );

    const totalExpenses = projectTransactions
      .filter(t => t.type === 'withdrawal')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalIncome = projectContributions.reduce((sum, c) => sum + c.amount, 0);

    return {
      projectId,
      totalExpenses,
      totalIncome,
      balance: totalIncome - totalExpenses,
      transactions: projectTransactions,
      contributions: projectContributions
    };
  },

  generateEventFinancialSummary: (eventId: number) => {
    const eventTransactions = transactions.filter(
      t => t.relatedTo?.type === 'event' && t.relatedTo.id === eventId
    );
    const eventContributions = contributions.filter(
      c => c.relatedTo.type === 'event' && c.relatedTo.id === eventId
    );

    const totalExpenses = eventTransactions
      .filter(t => t.type === 'withdrawal')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalIncome = eventContributions.reduce((sum, c) => sum + c.amount, 0);

    return {
      eventId,
      totalExpenses,
      totalIncome,
      balance: totalIncome - totalExpenses,
      transactions: eventTransactions,
      contributions: eventContributions
    };
  },

  // Fonction pour obtenir l'historique des transactions pour le graphique
  getTransactionHistory: (): { date: string; balance: number }[] => {
    // Trier les transactions par date
    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calculer le solde cumulatif pour chaque date
    let runningBalance = 0;
    return sortedTransactions.map(transaction => {
      runningBalance =
        transaction.type === 'deposit'
          ? runningBalance + transaction.amount
          : runningBalance - transaction.amount;
      return {
        date: transaction.date,
        balance: runningBalance
      };
    });
  }
};