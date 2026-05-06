import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import {
  PlusIcon,
  TrashIcon,
  ClockIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#F97316', '#84CC16', '#6366F1'
];

const Timetable = () => {
  const [timetable, setTimetable] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [newEntry, setNewEntry] = useState({
    day: 'Monday',
    time: '',
    subject: '',
    color: COLORS[0]
  });

  const fetchTimetable = useCallback(async () => {
    try {
      const response = await api.get('/timetable');
      if (response.data.success) {
        setTimetable(response.data.timetable);
      }
    } catch (error) {
      toast.error('Failed to load timetable');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTimetable();
  }, [fetchTimetable]);

  const handleAddEntry = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/timetable', newEntry);
      if (response.data.success) {
        const entry = response.data.entry;
        setTimetable({
          ...timetable,
          [entry.day]: [...(timetable[entry.day] || []), entry].sort((a, b) => a.time.localeCompare(b.time))
        });
        setNewEntry({ day: 'Monday', time: '', subject: '', color: COLORS[0] });
        setShowAddModal(false);
        toast.success('Class added to timetable');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add class');
    }
  };

  const handleDeleteEntry = async (day, id) => {
    if (!window.confirm('Remove this class from timetable?')) return;

    try {
      await api.delete(`/timetable/${id}`);
      setTimetable({
        ...timetable,
        [day]: timetable[day].filter(e => e._id !== id)
      });
      toast.success('Class removed');
    } catch (error) {
      toast.error('Failed to remove class');
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Weekly Timetable</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Manage your class schedule for the week
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="mt-4 sm:mt-0 btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Add Class</span>
        </button>
      </div>

      {/* Desktop Grid View */}
      <div className="hidden lg:block">
        <div className="card overflow-hidden p-0">
          <div className="grid grid-cols-7 gap-0">
            {DAYS.map(day => (
              <div key={day} className="border-b border-r border-gray-200 dark:border-gray-700 last:border-r-0">
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm text-center">{day}</h3>
                </div>
                <div className="p-3 space-y-2 min-h-[200px]">
                  {(timetable[day] || []).map(entry => (
                    <div
                      key={entry._id}
                      className="relative group p-3 rounded-lg text-white text-sm transition-all hover:scale-[1.02]"
                      style={{ backgroundColor: entry.color }}
                    >
                      <button
                        onClick={() => handleDeleteEntry(day, entry._id)}
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/20 transition-opacity"
                      >
                        <TrashIcon className="w-3 h-3" />
                      </button>
                      <p className="font-semibold pr-4">{entry.subject}</p>
                      <p className="text-xs opacity-90 flex items-center mt-1">
                        <ClockIcon className="w-3 h-3 mr-1" />
                        {entry.time}
                      </p>
                    </div>
                  ))}
                  {(timetable[day] || []).length === 0 && (
                    <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-xs">
                      No classes
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Stacked View */}
      <div className="lg:hidden space-y-4">
        {/* Day Selector */}
        <div className="card p-3">
          <div className="flex overflow-x-auto space-x-2 pb-2">
            {DAYS.map(day => {
              const count = (timetable[day] || []).length;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedDay === day
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {day.slice(0, 3)}
                  {count > 0 && (
                    <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                      selectedDay === day ? 'bg-white/20' : 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Classes */}
        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <CalendarDaysIcon className="w-5 h-5 mr-2 text-primary-600" />
            {selectedDay}
          </h3>

          {(timetable[selectedDay] || []).length > 0 ? (
            <div className="space-y-3">
              {(timetable[selectedDay] || []).map(entry => (
                <div
                  key={entry._id}
                  className="flex items-center p-4 rounded-lg text-white"
                  style={{ backgroundColor: entry.color }}
                >
                  <div className="flex-1">
                    <p className="font-semibold">{entry.subject}</p>
                    <p className="text-sm opacity-90 flex items-center mt-1">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      {entry.time}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteEntry(selectedDay, entry._id)}
                    className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <CalendarDaysIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No classes scheduled for {selectedDay}</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 animate-slide-up">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add Class</h2>
            <form onSubmit={handleAddEntry} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Day</label>
                <select
                  value={newEntry.day}
                  onChange={(e) => setNewEntry({ ...newEntry, day: e.target.value })}
                  className="input-field"
                >
                  {DAYS.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time</label>
                <input
                  type="time"
                  required
                  value={newEntry.time}
                  onChange={(e) => setNewEntry({ ...newEntry, time: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={newEntry.subject}
                  onChange={(e) => setNewEntry({ ...newEntry, subject: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Mathematics"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewEntry({ ...newEntry, color })}
                      className={`w-8 h-8 rounded-full transition-all ${
                        newEntry.color === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex space-x-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Add Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timetable;
