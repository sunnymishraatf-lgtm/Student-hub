import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import {
  PlusIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  PhotoIcon,
  DocumentArrowDownIcon,
  CloudArrowUpIcon,
  XMarkIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    subject: '',
    file: null
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNotes();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchNotes();
  }, [subjectFilter]);

  const fetchNotes = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (subjectFilter) params.append('subject', subjectFilter);

      const response = await api.get(`/notes?${params.toString()}`);
      if (response.data.success) {
        setNotes(response.data.notes);
      }
    } catch (error) {
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadData.file) {
      toast.error('Please select a file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('title', uploadData.title);
    formData.append('subject', uploadData.subject);
    formData.append('file', uploadData.file);

    try {
      const response = await api.post('/notes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setNotes([response.data.note, ...notes]);
        setUploadData({ title: '', subject: '', file: null });
        setShowUploadModal(false);
        toast.success('Note uploaded successfully');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this note?')) return;

    try {
      await api.delete(`/notes/${id}`);
      setNotes(notes.filter(n => n._id !== id));
      toast.success('Note deleted');
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'pdf': return <DocumentTextIcon className="w-8 h-8 text-danger-500" />;
      case 'image': return <PhotoIcon className="w-8 h-8 text-primary-500" />;
      case 'doc': return <DocumentTextIcon className="w-8 h-8 text-blue-500" />;
      default: return <DocumentArrowDownIcon className="w-8 h-8 text-gray-500" />;
    }
  };

  const uniqueSubjects = [...new Set(notes.map(n => n.subject))];

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Study Notes</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Upload and share notes with your classmates
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="mt-4 sm:mt-0 btn-primary flex items-center space-x-2"
        >
          <CloudArrowUpIcon className="w-5 h-5" />
          <span>Upload Notes</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search notes by title or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="sm:w-48 relative">
            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="input-field pl-10"
            >
              <option value="">All Subjects</option>
              {uniqueSubjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Notes Grid */}
      {notes.length === 0 ? (
        <div className="card text-center py-16">
          <DocumentTextIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No notes yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Be the first to upload study notes</p>
          <button onClick={() => setShowUploadModal(true)} className="btn-primary">
            Upload Notes
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <div key={note._id} className="card hover:shadow-lg transition-all duration-300 group">
              {/* File Preview */}
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  {getFileIcon(note.fileType)}
                </div>
                <button
                  onClick={() => handleDelete(note._id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-danger-50 dark:hover:bg-danger-900/30 text-gray-400 hover:text-danger-600 dark:hover:text-danger-400 transition-all"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <h3 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-2">
                {note.title}
              </h3>
              <div className="flex items-center space-x-2 mb-3">
                <span className="badge badge-primary bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                  {note.subject}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {note.fileType.toUpperCase()}
                </span>
              </div>

              {/* Uploader Info */}
              <div className="flex items-center space-x-2 mb-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                <img
                  src={note.uploadedBy?.profilePic || 'https://via.placeholder.com/32'}
                  alt={note.uploaderName}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">{note.uploaderName}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
                  {new Date(note.uploadDate).toLocaleDateString()}
                </span>
              </div>

              {/* Download Button */}
              <a
                href={note.fileURL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 w-full px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-lg font-medium hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors"
              >
                <DocumentArrowDownIcon className="w-4 h-4" />
                <span>Download</span>
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Upload Notes</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={uploadData.title}
                  onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Calculus Chapter 5 Notes"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={uploadData.subject}
                  onChange={(e) => setUploadData({ ...uploadData, subject: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Mathematics"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">File</label>
                <div className="relative">
                  <input
                    type="file"
                    required
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => setUploadData({ ...uploadData, file: e.target.files[0] })}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary-500 dark:hover:border-primary-400 transition-colors"
                  >
                    <div className="text-center">
                      <CloudArrowUpIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {uploadData.file ? uploadData.file.name : 'Click to upload PDF, Image, or DOC'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Max 10MB</p>
                    </div>
                  </label>
                </div>
              </div>
              <button
                type="submit"
                disabled={uploading}
                className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <CloudArrowUpIcon className="w-5 h-5" />
                    <span>Upload</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;
