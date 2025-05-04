import { apiService } from './apiService';

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
  getAllTransactions: async (): Promise<Transaction[]> => {
    try {
      return await apiService.get<Transaction[]>('/transactions');
    } catch (error) {
      console.error('Erreur lors de la récupération des transactions:', error);
      return [];
    }
  },

  getTransactionById: async (id: number): Promise<Transaction | null> => {
    try {
      return await apiService.get<Transaction>(`/transactions/${id}`);
    } catch (error) {
      console.error(`Erreur lors de la récupération de la transaction ${id}:`, error);
      return null;
    }
  },

  getTransactionsByType: async (type: 'deposit' | 'withdrawal'): Promise<Transaction[]> => {
    try {
      return await apiService.get<Transaction[]>(`/transactions/type/${type}`);
    } catch (error) {
      console.error('Erreur lors de la récupération des transactions par type:', error);
      return [];
    }
  },

  getTransactionsByRelatedEntity: async (type: 'event' | 'project', id: number): Promise<Transaction[]> => {
    try {
      return await apiService.get<Transaction[]>(`/transactions/related/${type}/${id}`);
    } catch (error) {
      console.error('Erreur lors de la récupération des transactions liées:', error);
      return [];
    }
  },

  getContributionsByRelatedEntity: async (type: 'event' | 'project', id: number): Promise<Transaction[]> => {
    try {
      return await apiService.get<Transaction[]>(`/contributions/related/${type}/${id}`);
    } catch (error) {
      console.error('Erreur lors de la récupération des transactions liées:', error);
      return [];
    }
  },

  getCurrentBalance: async (): Promise<number> => {
    try {
      const response = await apiService.get<{ balance: number }>('/transactions/balance');
      return response.balance;
    } catch (error) {
      console.error('Erreur lors de la récupération du solde:', error);
      return 0;
    }
  },

  createTransaction: async (transactionData: Omit<Transaction, 'id'>): Promise<Transaction | null> => {
    try {
      return await apiService.post<Transaction>('/transactions', transactionData);
    } catch (error) {
      console.error('Erreur lors de la création de la transaction:', error);
      return null;
    }
  },

  updateTransaction: async (id: number, transactionData: Partial<Omit<Transaction, 'id'>>): Promise<Transaction | null> => {
    try {
      return await apiService.put<Transaction>(`/transactions/${id}`, transactionData);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la transaction:', error);
      return null;
    }
  },

  deleteTransaction: async (id: number): Promise<boolean> => {
    try {
      await apiService.delete(`/transactions/${id}`);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de la transaction:', error);
      return false;
    }
  },

  // Fonctions pour les contributions
  getAllContributions: async (): Promise<Contribution[]> => {
    try {
      return await apiService.get<Contribution[]>('/contributions');
    } catch (error) {
      console.error('Erreur lors de la récupération des contributions:', error);
      return [];
    }
  },

  getContributionById: async (id: number): Promise<Contribution | null> => {
    try {
      return await apiService.get<Contribution>(`/contributions/${id}`);
    } catch (error) {
      console.error(`Erreur lors de la récupération de la contribution ${id}:`, error);
      return null;
    }
  },

  createContribution: async (contributionData: Omit<Contribution, 'id'>): Promise<Contribution | null> => {
    try {
      return await apiService.post<Contribution>('/contributions', contributionData);
    } catch (error) {
      console.error('Erreur lors de la création de la contribution:', error);
      return null;
    }
  },

  updateContribution: async (id: number, contributionData: Partial<Omit<Contribution, 'id'>>): Promise<Contribution | null> => {
    try {
      return await apiService.put<Contribution>(`/contributions/${id}`, contributionData);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la contribution:', error);
      return null;
    }
  },

  deleteContribution: async (id: number): Promise<boolean> => {
    try {
      await apiService.delete(`/contributions/${id}`);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de la contribution:', error);
      return false;
    }
  },

  // Fonction pour les rapports financiers
  getFinancialReport: async (startDate: string, endDate: string): Promise<FinancialReport | null> => {
    try {
      return await apiService.get<FinancialReport>(`/reports/financial?startDate=${startDate}&endDate=${endDate}`);
    } catch (error) {
      console.error('Erreur lors de la génération du rapport financier:', error);
      return null;
    }
  }
};