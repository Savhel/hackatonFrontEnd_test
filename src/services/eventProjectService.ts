import events from '../data/events.json';
import projects from '../data/projects.json';
import tasks from '../data/tasks.json';
import users from '../data/users.json';
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
  getAllEvents: (): Event[] => {
    return events;
  },

  getEventById: (id: number): Event | undefined => {
    return events.find(event => event.id === id);
  },

  getEventOrganizer: (event: Event): User | undefined => {
    return users.find(user => user.id === event.organizer);
  },

  getEventParticipants: (event: Event): User[] => {
    return users.filter(user => event.participants.includes(user.id));
  },

  getEventTasks: (eventId: number): Task[] => {
    return tasks.filter(task => task.relatedTo.type === 'event' && task.relatedTo.id === eventId);
  },

  // Fonctions pour les projets
  getAllProjects: (): Project[] => {
    return projects;
  },

  getProjectById: (id: number): Project | undefined => {
    return projects.find(project => project.id === id);
  },

  getProjectManager: (project: Project): User | undefined => {
    return users.find(user => user.id === project.manager);
  },

  getProjectMembers: (project: Project): User[] => {
    return users.filter(user => project.members.includes(user.id));
  },

  getProjectTasks: (projectId: number): Task[] => {
    return tasks.filter(task => task.relatedTo.type === 'project' && task.relatedTo.id === projectId);
  },

  // Fonctions pour les tâches
  getAllTasks: (): Task[] => {
    return tasks;
  },

  getTaskById: (id: number): Task | undefined => {
    return tasks.find(task => task.id === id);
  },

  getTaskAssignee: (task: Task): User | undefined => {
    return users.find(user => user.id === task.assignedTo);
  },

  getRelatedEntity: (task: Task): Event | Project | undefined => {
    if (task.relatedTo.type === 'event') {
      return events.find(event => event.id === task.relatedTo.id);
    } else {
      return projects.find(project => project.id === task.relatedTo.id);
    }
  }
};