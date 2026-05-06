import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import {
  BookOpenIcon,
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/user/dashboard');
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const isLowAttendance = stats?.overallPercentage < 75;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Welcome back! Here's your study overview.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <CalendarIcon className="w-4 h-4" />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Subjects */}
        <div className="card hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Subjects</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {stats?.totalSubjects || 0}
              </p>
            </div>
            <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <BookOpenIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          <div className="mt-4">
            <Link to="/attendance" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
              Manage subjects →
            </Link>
          </div>
        </div>

        {/* Overall Attendance */}
        <div className="card hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Overall Attendance</p>
              <p className={`text-3xl font-bold mt-1 ${isLowAttendance ? 'text-danger-600 dark:text-danger-400' : 'text-success-600 dark:text-success-400'}`}>
                {stats?.overallPercentage || 0}%
              </p>
            </div>
            <div className={`p-3 rounded-lg ${isLowAttendance ? 'bg-danger-100 dark:bg-danger-900/30' : 'bg-success-100 dark:bg-success-900/30'}`}>
              {isLowAttendance ? (
                <ArrowTrendingDownIcon className="w-6 h-6 text-danger-600 dark:text-danger-400" />
              ) : (
                <ArrowTrendingUpIcon className="w-6 h-6 text-success-600 dark:text-success-400" />
              )}
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${isLowAttendance ? 'bg-danger-500' : 'bg-success-500'}`}
                style={{ width: `${Math.min(stats?.overallPercentage || 0, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Today's Classes */}
        <div className="card hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Today's Classes</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {stats?.todayTimetable?.length || 0}
              </p>
            </div>
            <div className="p-3 bg-warning-100 dark:bg-warning-900/30 rounded-lg">
              <ClockIcon className="w-6 h-6 text-warning-600 dark:text-warning-400" />
            </div>
          </div>
          <div className="mt-4">
            <Link to="/timetable" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
              View timetable →
            </Link>
          </div>
        </div>

        {/* Status */}
        <div className="card hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
              <p className={`text-2xl font-bold mt-1 ${isLowAttendance ? 'text-danger-600 dark:text-danger-400' : 'text-success-600 dark:text-success-400'}`}>
                {isLowAttendance ? 'At Risk' : 'On Track'}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${isLowAttendance ? 'bg-danger-100 dark:bg-danger-900/30' : 'bg-success-100 dark:bg-success-900/30'}`}>
              <ChartBarIcon className={`w-6 h-6 ${isLowAttendance ? 'text-danger-600 dark:text-danger-400' : 'text-success-600 dark:text-success-400'}`} />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isLowAttendance 
                ? `${stats?.lowAttendanceSubjects?.length || 0} subject(s) below 75%`
                : 'Keep up the good work!'}
            </p>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {stats?.lowAttendanceSubjects?.length > 0 && (
        <div className="card border-l-4 border-l-danger-500 bg-danger-50 dark:bg-danger-900/10">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-danger-600 dark:text-danger-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-danger-800 dark:text-danger-200">
                Attendance Alert!
              </h3>
              <p className="text-danger-700 dark:text-danger-300 mt-1">
                The following subjects have attendance below 75%:
              </p>
              <ul className="mt-2 space-y-1">
                {stats.lowAttendanceSubjects.map((subject, index) => (
                  <li key={index} className="flex items-center space-x-2 text-danger-700 dark:text-danger-300">
                    <span className="w-2 h-2 bg-danger-500 rounded-full"></span>
                    <span className="font-medium">{subject.name}</span>
                    <span className="text-sm">({subject.percentage}%)</span>
                  </li>
                ))}
              </ul>
              <Link 
                to="/attendance" 
                className="inline-block mt-3 text-sm font-medium text-danger-800 dark:text-danger-200 hover:underline"
              >
                Take action now →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Today's Timetable */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Today's Timetable ({stats?.today})
          </h2>
          <Link to="/timetable" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
            View full →
          </Link>
        </div>

        {stats?.todayTimetable?.length > 0 ? (
          <div className="space-y-3">
            {stats.todayTimetable.map((item, index) => (
              <div 
                key={item._id} 
                className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div 
                  className="w-3 h-12 rounded-full mr-4" 
                  style={{ backgroundColor: item.color || '#3B82F6' }}
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">{item.subject}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.time}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Class {index + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No classes scheduled for today</p>
            <Link to="/timetable" className="text-primary-600 dark:text-primary-400 hover:underline text-sm mt-2 inline-block">
              Add classes to your timetable
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
