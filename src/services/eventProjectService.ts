import { apiService } from './apiService';
import { User } from './authService';

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  organizer: number;
  participants: number[];
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
}

export interface Project {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  manager: number;
  members: number[];
  status: 'planning' | 'in_progress' | 'completed' | 'cancelled';
}

export interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  assignedTo: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  relatedTo: {
    type: 'event' | 'project';
    id: number;
  };
}

export const eventProjectService = {
  // Fonctions pour les événements
  getAllEvents: async (): Promise<Event[]> => {
    try {
      return await apiService.get<Event[]>('/events');
    } catch (error) {
      console.error('Erreur lors de la récupération des événements:', error);
      return [];
    }
  },

  getEventById: async (id: number): Promise<Event | null> => {
    try {
      return await apiService.get<Event>(`/events/${id}`);
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'événement ${id}:`, error);
      return null;
    }
  },

  getEventOrganizer: async (event: Event): Promise<User | null> => {
    try {
      return await apiService.get<User>(`/users/${event.organizer}`);
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'organisateur:', error);
      return null;
    }
  },

  getEventParticipants: async (event: Event): Promise<User[]> => {
    try {
      const participants = await Promise.all(
        event.participants.map(userId =>
          apiService.get<User>(`/users/${userId}`)
        )
      );
      return participants.filter((user): user is User => user !== null);
    } catch (error) {
      console.error('Erreur lors de la récupération des participants:', error);
      return [];
    }
  },

  getEventTasks: async (eventId: number): Promise<Task[]> => {
    try {
      return await apiService.get<Task[]>(`/events/${eventId}/tasks`);
    } catch (error) {
      console.error('Erreur lors de la récupération des tâches:', error);
      return [];
    }
  },

  createEvent: async (eventData: Omit<Event, 'id'>): Promise<Event | null> => {
    try {
      return await apiService.post<Event>('/events', eventData);
    } catch (error) {
      console.error('Erreur lors de la création de l\'événement:', error);
      return null;
    }
  },

  updateEvent: async (id: number, eventData: Partial<Omit<Event, 'id'>>): Promise<Event | null> => {
    try {
      return await apiService.put<Event>(`/events/${id}`, eventData);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'événement:', error);
      return null;
    }
  },

  deleteEvent: async (id: number): Promise<boolean> => {
    try {
      await apiService.delete(`/events/${id}`);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'événement:', error);
      return false;
    }
  },

  // Fonctions pour les projets
  getAllProjects: async (): Promise<Project[]> => {
    try {
      return await apiService.get<Project[]>('/projects');
    } catch (error) {
      console.error('Erreur lors de la récupération des projets:', error);
      return [];
    }
  },

  getProjectById: async (id: number): Promise<Project | null> => {
    try {
      return await apiService.get<Project>(`/projects/${id}`);
    } catch (error) {
      console.error(`Erreur lors de la récupération du projet ${id}:`, error);
      return null;
    }
  },

  createProject: async (projectData: Omit<Project, 'id'>): Promise<Project | null> => {
    try {
      return await apiService.post<Project>('/projects', projectData);
    } catch (error) {
      console.error('Erreur lors de la création du projet:', error);
      return null;
    }
  },

  updateProject: async (id: number, projectData: Partial<Omit<Project, 'id'>>): Promise<Project | null> => {
    try {
      return await apiService.put<Project>(`/projects/${id}`, projectData);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du projet:', error);
      return null;
    }
  },

  deleteProject: async (id: number): Promise<boolean> => {
    try {
      await apiService.delete(`/projects/${id}`);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du projet:', error);
      return false;
    }
  },

  // Fonctions pour les tâches
  getAllTasks: async (): Promise<Task[]> => {
    try {
      return await apiService.get<Task[]>('/tasks');
    } catch (error) {
      console.error('Erreur lors de la récupération des tâches:', error);
      return [];
    }
  },

  getTaskById: async (id: number): Promise<Task | null> => {
    try {
      return await apiService.get<Task>(`/tasks/${id}`);
    } catch (error) {
      console.error(`Erreur lors de la récupération de la tâche ${id}:`, error);
      return null;
    }
  },

  createTask: async (taskData: Omit<Task, 'id'>): Promise<Task | null> => {
    try {
      return await apiService.post<Task>('/tasks', taskData);
    } catch (error) {
      console.error('Erreur lors de la création de la tâche:', error);
      return null;
    }
  },

  updateTask: async (id: number, taskData: Partial<Omit<Task, 'id'>>): Promise<Task | null> => {
    try {
      return await apiService.put<Task>(`/tasks/${id}`, taskData);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la tâche:', error);
      return null;
    }
  },

  deleteTask: async (id: number): Promise<boolean> => {
    try {
      await apiService.delete(`/tasks/${id}`);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de la tâche:', error);
      return false;
    }
  }
};