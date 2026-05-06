import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  LightBulbIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PlayIcon,
  AcademicCapIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Attendance = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [simulations, setSimulations] = useState({});
  const [newSubject, setNewSubject] = useState({
    subjectName: '',
    totalClasses: '',
    attendedClasses: ''
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await api.get('/subjects');
      if (response.data.success) {
        setSubjects(response.data.subjects);
      }
    } catch (error) {
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    const total = parseInt(newSubject.totalClasses) || 0;
    const attended = parseInt(newSubject.attendedClasses) || 0;

    if (attended > total) {
      return toast.error("Attended classes cannot exceed total classes");
    }

    try {
      const response = await api.post('/subjects', {
        subjectName: newSubject.subjectName,
        totalClasses: total,
        attendedClasses: attended
      });

      if (response.data.success) {
        setSubjects([...subjects, response.data.subject]);
        setNewSubject({ subjectName: '', totalClasses: '', attendedClasses: '' });
        setShowAddModal(false);
        toast.success('Subject added successfully');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add subject');
    }
  };

  const handleUpdateAttendance = async (id, attended) => {
    try {
      const response = await api.patch(`/subjects/${id}/attendance`, { attended });
      if (response.data.success) {
        setSubjects(subjects.map(s => s._id === id ? response.data.subject : s));
        toast.success(attended ? 'Attendance marked!' : 'Absence recorded');
      }
    } catch (error) {
      toast.error('Failed to update attendance');
    }
  };

  const handleDeleteSubject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;

    try {
      await api.delete(`/subjects/${id}`);
      setSubjects(subjects.filter(s => s._id !== id));
      toast.success('Subject deleted');
    } catch (error) {
      toast.error('Failed to delete subject');
    }
  };

  const handleEditSubject = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/subjects/${editingSubject._id}`, {
        subjectName: editingSubject.subjectName,
        totalClasses: parseInt(editingSubject.totalClasses),
        attendedClasses: parseInt(editingSubject.attendedClasses)
      });

      if (response.data.success) {
        setSubjects(subjects.map(s => s._id === editingSubject._id ? response.data.subject : s));
        setEditingSubject(null);
        toast.success('Subject updated');
      }
    } catch (error) {
      toast.error('Failed to update subject');
    }
  };

  const simulateAttendance = async (id, action) => {
    try {
      const response = await api.post(`/subjects/${id}/simulate`, { action });
      if (response.data.success) {
        setSimulations({ ...simulations, [id]: response.data.simulation });
      }
    } catch (error) {
      toast.error('Simulation failed');
    }
  };

  const clearSimulation = (id) => {
    const newSims = { ...simulations };
    delete newSims[id];
    setSimulations(newSims);
  };

  const overallStats = () => {
    const total = subjects.reduce((sum, s) => sum + s.totalClasses, 0);
    const attended = subjects.reduce((sum, s) => sum + s.attendedClasses, 0);
    return {
      total,
      attended,
      percentage: total > 0 ? ((attended / total) * 100).toFixed(2) : 0
    };
  };

  const stats = overallStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Attendance Tracker</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Track and predict your attendance across all subjects
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="mt-4 sm:mt-0 btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Add Subject</span>
        </button>
      </div>

      {/* Overall Stats */}
      {subjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Classes</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-500 dark:text-gray-400">Attended</p>
            <p className="text-2xl font-bold text-success-600 dark:text-success-400">{stats.attended}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-500 dark:text-gray-400">Overall %</p>
            <p className={`text-2xl font-bold ${parseFloat(stats.percentage) >= 75 ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}`}>
              {stats.percentage}%
            </p>
          </div>
        </div>
      )}

      {/* Subjects Grid */}
      {subjects.length === 0 ? (
        <div className="card text-center py-16">
          <AcademicCapIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No subjects yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Add your first subject to start tracking attendance</p>
          <button onClick={() => setShowAddModal(true)} className="btn-primary">
            Add Subject
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {subjects.map((subject) => {
            const sim = simulations[subject._id];
            const isSafe = subject.percentage >= 75;
            const simIsSafe = sim ? parseFloat(sim.percentage) >= 75 : isSafe;

            return (
              <div key={subject._id} className="card hover:shadow-lg transition-all duration-300">
                {/* Subject Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{subject.subjectName}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`badge ${isSafe ? 'badge-success' : 'badge-danger'}`}>
                        {isSafe ? 'Safe' : 'At Risk'}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {subject.attendedClasses}/{subject.totalClasses} classes
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setEditingSubject(subject)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSubject(subject._id)}
                      className="p-1.5 rounded-lg hover:bg-danger-50 dark:hover:bg-danger-900/30 text-gray-500 dark:text-gray-400 hover:text-danger-600 dark:hover:text-danger-400 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Attendance</span>
                    <span className={`font-semibold ${isSafe ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}`}>
                      {subject.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${isSafe ? 'bg-success-500' : 'bg-danger-500'}`}
                      style={{ width: `${Math.min(subject.percentage, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Smart Predictions */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <LightBulbIcon className="w-5 h-5 text-warning-500" />
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Smart Predictions</h4>
                  </div>

                  {isSafe ? (
                    <div className="flex items-center space-x-2 text-success-700 dark:text-success-300">
                      <CheckIcon className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm">
                        Safe to miss <strong>{subject.maxBunks}</strong> more class{subject.maxBunks !== 1 ? 'es' : ''}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-danger-700 dark:text-danger-300">
                      <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm">
                        Attend next <strong>{subject.classesNeeded}</strong> class{subject.classesNeeded !== 1 ? 'es' : ''} to reach 75%
                      </span>
                    </div>
                  )}
                </div>

                {/* Live Simulation */}
                <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-primary-800 dark:text-primary-200 text-sm mb-3 flex items-center">
                    <PlayIcon className="w-4 h-4 mr-1" />
                    Live Simulation
                  </h4>

                  {sim ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Projected:</span>
                        <span className={`font-bold ${simIsSafe ? 'text-success-600' : 'text-danger-600'}`}>
                          {sim.percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${simIsSafe ? 'bg-success-500' : 'bg-danger-500'}`}
                          style={{ width: `${Math.min(parseFloat(sim.percentage), 100)}%` }}
                        />
                      </div>
                      <button
                        onClick={() => clearSimulation(subject._id)}
                        className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        Clear simulation
                      </button>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => simulateAttendance(subject._id, 'attend')}
                        className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300 rounded-lg text-sm font-medium hover:bg-success-200 dark:hover:bg-success-900/50 transition-colors"
                      >
                        <ArrowTrendingUpIcon className="w-4 h-4" />
                        <span>If I attend</span>
                      </button>
                      <button
                        onClick={() => simulateAttendance(subject._id, 'miss')}
                        className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-danger-100 dark:bg-danger-900/30 text-danger-700 dark:text-danger-300 rounded-lg text-sm font-medium hover:bg-danger-200 dark:hover:bg-danger-900/50 transition-colors"
                      >
                        <ArrowTrendingDownIcon className="w-4 h-4" />
                        <span>If I miss</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleUpdateAttendance(subject._id, true)}
                    className="flex-1 flex items-center justify-center space-x-1 px-4 py-2 bg-success-600 text-white rounded-lg text-sm font-medium hover:bg-success-700 transition-colors"
                  >
                    <CheckIcon className="w-4 h-4" />
                    <span>Present</span>
                  </button>
                  <button
                    onClick={() => handleUpdateAttendance(subject._id, false)}
                    className="flex-1 flex items-center justify-center space-x-1 px-4 py-2 bg-danger-600 text-white rounded-lg text-sm font-medium hover:bg-danger-700 transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    <span>Absent</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Subject Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 animate-slide-up">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add New Subject</h2>
            <form onSubmit={handleAddSubject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  value={newSubject.subjectName}
                  onChange={(e) => setNewSubject({ ...newSubject, subjectName: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Mathematics"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Classes</label>
                  <input
                    type="number"
                    min="0"
                    value={newSubject.totalClasses}
                    onChange={(e) => setNewSubject({ ...newSubject, totalClasses: e.target.value })}
                    className="input-field"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Attended</label>
                  <input
                    type="number"
                    min="0"
                    value={newSubject.attendedClasses}
                    onChange={(e) => setNewSubject({ ...newSubject, attendedClasses: e.target.value })}
                    className="input-field"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex space-x-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Add Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Subject Modal */}
      {editingSubject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 animate-slide-up">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Edit Subject</h2>
            <form onSubmit={handleEditSubject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  value={editingSubject.subjectName}
                  onChange={(e) => setEditingSubject({ ...editingSubject, subjectName: e.target.value })}
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Classes</label>
                  <input
                    type="number"
                    min="0"
                    value={editingSubject.totalClasses}
                    onChange={(e) => setEditingSubject({ ...editingSubject, totalClasses: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Attended</label>
                  <input
                    type="number"
                    min="0"
                    value={editingSubject.attendedClasses}
                    onChange={(e) => setEditingSubject({ ...editingSubject, attendedClasses: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
              <div className="flex space-x-3 pt-2">
                <button type="button" onClick={() => setEditingSubject(null)} className="flex-1 btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
