import { apiService } from './apiService';

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  status: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
  role?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: string;
  status?: string;
}

export const authService = {
  login: async ({ email, password }: LoginCredentials): Promise<User | null> => {
    try {
      const response = await apiService.post<{ token: string; user: User }>('/auth/login', { email, password });
      const { token, user } = response;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return user;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      return null;
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr) as User;
    }
    return null;
  },
  
  getAllUsers: async (): Promise<User[]> => {
    try {
      return await apiService.get<User[]>('/users');
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      return [];
    }
  },

  register: async ({ email, password, name, role = 'user' }: RegisterCredentials): Promise<User | null> => {
    try {
      const response = await apiService.post<{ token: string; user: User }>('/auth/register', {
        email,
        password,
        name,
        role
      });
      
      const { token, user } = response;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return user;
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      return null;
    }
  },

  updateUser: async (userId: number, userData: UpdateUserData): Promise<User | null> => {
    try {
      return await apiService.put<User>(`/users/${userId}`, userData);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      return null;
    }
  },

  deleteUser: async (userId: number): Promise<boolean> => {
    try {
      await apiService.delete(`/users/${userId}`);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      return false;
    }
  }
};