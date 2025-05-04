'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService, User } from '../../../services/authService';
import { eventProjectService, Event, Task } from '../../../services/eventProjectService';

export default function GestionEvenements() {
  const [events, setEvents] = useState<Event[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    participants: [] as number[]
  });
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    assignedTo: 0,
    priority: 'medium' as 'low' | 'medium' | 'high'
  });
  const [users, setUsers] = useState<User[]>([]);
  
  const router = useRouter();
  const currentUser = authService.getCurrentUser();
  
  // Rediriger si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
    }
  }, [currentUser, router]);

  // Charger les événements et les utilisateurs
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const allEvents = eventProjectService.getAllEvents();
        const allTasks = eventProjectService.getAllTasks();
        const allUsers = await import('../../../data/users.json')
          .then(module => module.default)
          .then(data => data.map(({ password, ...user }: any) => user));
        
        setEvents(allEvents);
        setTasks(allTasks);
        setUsers(allUsers);
      } catch (err) {
        setError('Erreur lors du chargement des données');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTaskInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTaskFormData(prev => ({ ...prev, [name]: name === 'assignedTo' ? parseInt(value) : value }));
  };

  const handleParticipantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => parseInt(option.value));
    setFormData(prev => ({ ...prev, participants: selectedOptions }));
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation simple
    if (!formData.title || !formData.date || !formData.location) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    // Créer un nouvel événement
    const newEvent: Event = {
      id: events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1,
      title: formData.title,
      description: formData.description,
      date: formData.date,
      location: formData.location,
      organizer: currentUser?.id || 1,
      participants: formData.participants,
      status: 'planned'
    };
    
    // Ajouter à la liste
    setEvents(prev => [...prev, newEvent]);
    
    // Réinitialiser le formulaire
    setFormData({
      title: '',
      description: '',
      date: '',
      location: '',
      participants: []
    });
    
    setShowAddForm(false);
    setError('');
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!taskFormData.title || !taskFormData.dueDate || !taskFormData.assignedTo) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    if (!selectedEvent) return;
    
    const newTask: Task = {
      id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
      title: taskFormData.title,
      description: taskFormData.description,
      dueDate: taskFormData.dueDate,
      assignedTo: taskFormData.assignedTo,
      status: 'pending',
      priority: taskFormData.priority,
      relatedTo: {
        type: 'event',
        id: selectedEvent.id
      }
    };
    
    setTasks(prev => [...prev, newTask]);
    
    setTaskFormData({
      title: '',
      description: '',
      dueDate: '',
      assignedTo: 0,
      priority: 'medium'
    });
    
    setShowTaskForm(false);
    setError('');
  };

  const handleViewEvent = (event: Event) => {
    setSelectedEvent(event);
  };

  const closeEventDetails = () => {
    setSelectedEvent(null);
    setShowTaskForm(false);
  };

  const getEventTasks = (eventId: number) => {
    return tasks.filter(task => task.relatedTo.type === 'event' && task.relatedTo.id === eventId);
  };

  const getTaskAssigneeName = (userId: number) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Non assigné';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-t-2 border-orange-500 mx-auto"></div>
          <p className="text-black">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-black">Gestion des Événements</h1>
          <div className="flex space-x-4">
            <Link 
              href="/"
              className="rounded-md bg-gray-200 px-4 py-2 text-black hover:bg-gray-300"
            >
              Retour à l'accueil
            </Link>
            <button
              onClick={() => setShowAddForm(true)}
              className="rounded-md bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
            >
              Ajouter un événement
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-red-500">
            {error}
          </div>
        )}

        {/* Formulaire d'ajout d'événement */}
        {showAddForm && (
          <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-md">
            <h2 className="mb-4 text-xl font-semibold text-black">Ajouter un événement</h2>
            <form onSubmit={handleAddEvent}>
              <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Titre *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 p-2 focus:border-orange-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Date et heure *</label>
                  <input
                    type="datetime-local"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 p-2 focus:border-orange-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Lieu *</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 p-2 focus:border-orange-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Participants</label>
                  <select
                    multiple
                    name="participants"
                    value={formData.participants.map(String)}
                    onChange={handleParticipantChange}
                    className="w-full rounded-md border border-gray-300 p-2 focus:border-orange-500 focus:outline-none"
                  >
                    {users.map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">Maintenez Ctrl pour sélectionner plusieurs participants</p>
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 p-2 focus:border-orange-500 focus:outline-none"
                    rows={3}
                  ></textarea>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Détails de l'événement sélectionné */}
        {selectedEvent && (
          <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-black">{selectedEvent.title}</h2>
              <button
                onClick={closeEventDetails}
                className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">Date et heure</p>
                <p className="text-black">{formatDate(selectedEvent.date)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Lieu</p>
                <p className="text-black">{selectedEvent.location}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">Description</p>
                <p className="text-black">{selectedEvent.description}</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-black">Tâches associées</h3>
                <button
                  onClick={() => setShowTaskForm(true)}
                  className="rounded-md bg-orange-500 px-3 py-1 text-sm text-white hover:bg-orange-600"
                >
                  Ajouter une tâche
                </button>
              </div>

              {/* Formulaire d'ajout de tâche */}
              {showTaskForm && (
                <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <h4 className="mb-3 text-md font-medium text-black">Nouvelle tâche</h4>
                  <form onSubmit={handleAddTask}>
                    <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Titre *</label>
                        <input
                          type="text"
                          name="title"
                          value={taskFormData.title}
                          onChange={handleTaskInputChange}
                          className="w-full rounded-md border border-gray-300 p-2 focus:border-orange-500 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Date d'échéance *</label>
                        <input
                          type="datetime-local"
                          name="dueDate"
                          value={taskFormData.dueDate}
                          onChange={handleTaskInputChange}
                          className="w-full rounded-md border border-gray-300 p-2 focus:border-orange-500 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Assignée à *</label>
                        <select
                          name="assignedTo"
                          value={taskFormData.assignedTo}
                          onChange={handleTaskInputChange}
                          className="w-full rounded-md border border-gray-300 p-2 focus:border-orange-500 focus:outline-none"
                          required
                        >
                          <option value="">Sélectionner un membre</option>
                          {users.map(user => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Priorité</label>
                        <select
                          name="priority"
                          value={taskFormData.priority}
                          onChange={handleTaskInputChange}
                          className="w-full rounded-md border border-gray-300 p-2 focus:border-orange-500 focus:outline-none"
                        >
                          <option value="low">Basse</option>
                          <option value="medium">Moyenne</option>
                          <option value="high">Haute</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                          name="description"
                          value={taskFormData.description}
                          onChange={handleTaskInputChange}
                          className="w-full rounded-md border border-gray-300 p-2 focus:border-orange-500 focus:outline-none"
                          rows={2}
                        ></textarea>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowTaskForm(false)}
                        className="rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="rounded-md bg-orange-500 px-3 py-1 text-sm text-white hover:bg-orange-600"
                      >
                        Enregistrer
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Liste des tâches */}
              <div className="mt-3">
                {getEventTasks(selectedEvent.id).length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full border-collapse bg-white text-left text-sm text-black">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 font-medium text-gray-900">Titre</th>
                          <th className="px-4 py-2 font-medium text-gray-900">Assignée à</th>
                          <th className="px-4 py-2 font-medium text-gray-900">Échéance</th>
                          <th className="px-4 py-2 font-medium text-gray-900">Priorité</th>
                          <th className="px-4 py-2 font-medium text-gray-900">Statut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 border-t border-gray-100">
                        {getEventTasks(selectedEvent.id).map(task => (
                          <tr key={task.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 font-medium">{task.title}</td>
                            <td className="px-4 py-2">{getTaskAssigneeName(task.assignedTo)}</td>
                            <td className="px-4 py-2">{formatDate(task.dueDate)}</td>
                            <td className="px-4 py-2">
                              <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                                task.priority === 'high' 
                                  ? 'bg-red-50 text-red-700' 
                                  : task.priority === 'medium'
                                    ? 'bg-yellow-50 text-yellow-700'
                                    : 'bg-green-50 text-green-700'
                              }`}>
                                {task.priority === 'high' ? 'Haute' : task.priority === 'medium' ? 'Moyenne' : 'Basse'}
                              </span>
                            </td>
                            <td className="px-4 py-2">
                              <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                                task.status === 'completed' 
                                  ? 'bg-green-50 text-green-700' 
                                  : task.status === 'in_progress'
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'bg-gray-50 text-gray-700'
                              }`}>
                                {task.status === 'completed' ? 'Terminée' : task.status === 'in_progress' ? 'En cours' : 'En attente'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="mt-2 text-gray-500">Aucune tâche associée à cet événement.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Liste des événements */}
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
          <table className="w-full border-collapse bg-white text-left text-sm text-black">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 font-medium text-gray-900">Titre</th>
                <th className="px-6 py-4 font-medium text-gray-900">Date</th>
                <th className="px-6 py-4 font-medium text-gray-900">Lieu</th>
                <th className="px-6 py-4 font-medium text-gray-900">Statut</th>
                <th className="px-6 py-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 border-t border-gray-100">
              {events.map(event => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{event.title}</td>
                  <td className="px-6 py-4">{formatDate(event.date)}</td>
                  <td className="px-6 py-4">{event.location}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                      event.status === 'completed' 
                        ? 'bg-green-50 text-green-700' 
                        : event.status === 'in_progress'
                          ? 'bg-blue-50 text-blue-700'
                          : event.status === 'cancelled'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-yellow-50 text-yellow-700'
                    }`}>
                      {event.status === 'completed' ? 'Terminé' : 
                       event.status === 'in_progress' ? 'En cours' : 
                       event.status === 'cancelled' ? 'Annulé' : 'Planifié'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleViewEvent(event)}
                      className="rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-200"
                    >
                      Détails
                    </button>
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