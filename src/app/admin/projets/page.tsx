'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService, User } from '../../../services/authService';
import { eventProjectService, Project, Task } from '../../../services/eventProjectService';

export default function GestionProjets() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    members: [] as number[]
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

  // Charger les projets et les utilisateurs
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const allProjects = eventProjectService.getAllProjects();
        const allTasks = eventProjectService.getAllTasks();
        const allUsers = await import('../../../data/users.json')
          .then(module => module.default)
          .then(data => data.map(({ password, ...user }: any) => user));
        
        setProjects(allProjects);
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

  const handleMembersChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => parseInt(option.value));
    setFormData(prev => ({ ...prev, members: selectedOptions }));
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation simple
    if (!formData.title || !formData.startDate || !formData.endDate) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    // Créer un nouveau projet
    const newProject: Project = {
      id: projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1,
      title: formData.title,
      description: formData.description,
      startDate: formData.startDate,
      endDate: formData.endDate,
      manager: currentUser?.id || 1,
      members: formData.members,
      status: 'planning'
    };
    
    // Ajouter à la liste
    setProjects(prev => [...prev, newProject]);
    
    // Réinitialiser le formulaire
    setFormData({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      members: []
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
    
    if (!selectedProject) return;
    
    const newTask: Task = {
      id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
      title: taskFormData.title,
      description: taskFormData.description,
      dueDate: taskFormData.dueDate,
      assignedTo: taskFormData.assignedTo,
      status: 'pending',
      priority: taskFormData.priority,
      relatedTo: {
        type: 'project',
        id: selectedProject.id
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

  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
  };

  const closeProjectDetails = () => {
    setSelectedProject(null);
    setShowTaskForm(false);
  };

  const getProjectTasks = (projectId: number) => {
    return tasks.filter(task => task.relatedTo.type === 'project' && task.relatedTo.id === projectId);
  };

  const getTaskAssigneeName = (userId: number) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Non assigné';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
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
          <h1 className="text-3xl font-bold text-black">Gestion des Projets</h1>
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
              Ajouter un projet
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-red-500">
            {error}
          </div>
        )}

        {/* Formulaire d'ajout de projet */}
        {showAddForm && (
          <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-md">
            <h2 className="mb-4 text-xl font-semibold text-black">Ajouter un projet</h2>
            <form onSubmit={handleAddProject}>
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
                  <label className="mb-1 block text-sm font-medium text-gray-700">Date de début *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 p-2 focus:border-orange-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Date de fin *</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 p-2 focus:border-orange-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Membres</label>
                  <select
                    multiple
                    name="members"
                    value={formData.members.map(String)}
                    onChange={handleMembersChange}
                    className="w-full rounded-md border border-gray-300 p-2 focus:border-orange-500 focus:outline-none"
                  >
                    {users.map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">Maintenez Ctrl pour sélectionner plusieurs membres</p>
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

        {/* Détails du projet sélectionné */}
        {selectedProject && (
          <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-black">{selectedProject.title}</h2>
              <button
                onClick={closeProjectDetails}
                className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">Période</p>
                <p className="text-black">{formatDate(selectedProject.startDate)} - {formatDate(selectedProject.endDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Statut</p>
                <p className="text-black">
                  <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                    selectedProject.status === 'completed' 
                      ? 'bg-green-50 text-green-700' 
                      : selectedProject.status === 'in_progress'
                        ? 'bg-blue-50 text-blue-700'
                        : selectedProject.status === 'cancelled'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-yellow-50 text-yellow-700'
                  }`}>
                    {selectedProject.status === 'completed' ? 'Terminé' : 
                     selectedProject.status === 'in_progress' ? 'En cours' : 
                     selectedProject.status === 'cancelled' ? 'Annulé' : 'En planification'}
                  </span>
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">Description</p>
                <p className="text-black">{selectedProject.description}</p>
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
                          type="date"
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
                {getProjectTasks(selectedProject.id).length > 0 ? (
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
                        {getProjectTasks(selectedProject.id).map(task => (
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
                  <p className="mt-2 text-gray-500">Aucune tâche associée à ce projet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Liste des projets */}
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
          <table className="w-full border-collapse bg-white text-left text-sm text-black">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 font-medium text-gray-900">Titre</th>
                <th className="px-6 py-4 font-medium text-gray-900">Période</th>
                <th className="px-6 py-4 font-medium text-gray-900">Responsable</th>
                <th className="px-6 py-4 font-medium text-gray-900">Statut</th>
                <th className="px-6 py-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 border-t border-gray-100">
              {projects.map(project => {
                const manager = users.find(u => u.id === project.manager);
                return (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{project.title}</td>
                    <td className="px-6 py-4">{formatDate(project.startDate)} - {formatDate(project.endDate)}</td>
                    <td className="px-6 py-4">{manager ? manager.name : 'Non assigné'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                        project.status === 'completed' 
                          ? 'bg-green-50 text-green-700' 
                          : project.status === 'in_progress'
                            ? 'bg-blue-50 text-blue-700'
                            : project.status === 'cancelled'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-yellow-50 text-yellow-700'
                      }`}>
                        {project.status === 'completed' ? 'Terminé' : 
                         project.status === 'in_progress' ? 'En cours' : 
                         project.status === 'cancelled' ? 'Annulé' : 'En planification'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewProject(project)}
                        className="rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-200"
                      >
                        Détails
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}