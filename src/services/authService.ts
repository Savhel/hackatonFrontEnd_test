import users from '../data/users.json';

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

export const authService = {
  login: async ({ email, password }: LoginCredentials): Promise<User | null> => {
    // Simuler un délai d'API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Rechercher l'utilisateur dans les données JSON
    const user = users.find(
      (u: User & { password: string }) => u.email === email && u.password === password
    );
    
    if (!user) return null;
    
    // Ne pas renvoyer le mot de passe
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;
    
    // Stocker l'utilisateur dans le localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
    }
    
    return userWithoutPassword as User;
  },
  
  logout: () => {
    // Supprimer l'utilisateur du localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
  },
  
  getCurrentUser: (): User | null => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        return JSON.parse(userStr) as User;
      }
    }
    return null;
  }
};