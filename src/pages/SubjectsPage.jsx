// src/pages/SubjectsPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import supabase from '../lib/supabase';

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  const [editingSubject, setEditingSubject] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    subject_code: '',
    subject_name: '',
    instructor: ''
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to fetch subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.subject_code || !formData.subject_name || !formData.instructor) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setSubmitting(true);
      if (editingSubject) {
        const { error } = await supabase
          .from('subjects')
          .update(formData)
          .eq('id', editingSubject.id);

        if (error) throw error;
        toast.success('Subject updated successfully!');
      } else {
        const { error } = await supabase
          .from('subjects')
          .insert([formData]);

        if (error) throw error;
        toast.success('Subject added successfully!');
      }

      closeModal();
      fetchSubjects();
    } catch (error) {
      console.error('Error saving subject:', error);
      toast.error('Failed to save subject: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setFormData({
      subject_code: subject.subject_code,
      subject_name: subject.subject_name,
      instructor: subject.instructor
    });
    setShowModal(true);
  };

  const handleDeleteClick = (subject) => {
    setSubjectToDelete(subject);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!subjectToDelete) return;

    try {
      setDeleting(true);
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', subjectToDelete.id);

      if (error) throw error;
      
      toast.success('Subject deleted successfully!');
      setShowDeleteConfirm(false);
      setSubjectToDelete(null);
      fetchSubjects();
    } catch (error) {
      console.error('Error deleting subject:', error);
      toast.error('Failed to delete subject');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setSubjectToDelete(null);
  };

  const openAddModal = () => {
    setEditingSubject(null);
    setFormData({
      subject_code: '',
      subject_name: '',
      instructor: ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSubject(null);
    setFormData({
      subject_code: '',
      subject_name: '',
      instructor: ''
    });
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-gradient-to-b from-[#0b0c10] via-[#111827] to-black text-cyan-100">
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#0f172a',
            color: '#22d3ee',
            border: '1px solid #22d3ee',
            borderRadius: '8px',
            fontWeight: '500'
          },
          success: {
            iconTheme: {
              primary: '#4ade80',
              secondary: '#0f172a',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#0f172a',
            },
          },
        }}
      />
      
      {/* Futuristic Grid Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,255,200,0.05)_1px,transparent_1px),linear-gradient(rgba(0,255,200,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>

      {/* Navbar */}
      <nav className="relative z-10 flex justify-between items-center px-8 py-4 bg-black/40 shadow-md backdrop-blur-sm border-b border-cyan-500/30">
        <h1 className="text-2xl font-bold text-[#22d3ee] tracking-wider drop-shadow-[0_0_10px_#22d3ee]">
          Student Portal
        </h1>
        <ul className="flex space-x-6 text-cyan-200 font-medium">
          <li><Link to="/" className="hover:text-[#4ade80] transition-all">Home</Link></li>
          <li><Link to="/students" className="hover:text-[#4ade80] transition-all">Students</Link></li>
          <li><Link to="/subjects" className="text-[#4ade80] font-semibold drop-shadow-[0_0_6px_#4ade80]">Subjects</Link></li>
          <li><Link to="/grades" className="hover:text-[#4ade80] transition-all">Grades</Link></li>
        </ul>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 flex-1 px-8 py-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-extrabold text-[#22d3ee] tracking-wider drop-shadow-[0_0_10px_#4ade80]">
              Subjects Management
            </h1>
            <button
              onClick={openAddModal}
              className="bg-[#22d3ee] hover:bg-[#4ade80] text-black font-semibold px-6 py-3 rounded-md border border-cyan-400 shadow-[0_0_15px_#22d3ee60] transition-all"
            >
              Add Subject
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 bg-black/40 border border-cyan-500/40 shadow-inner rounded-xl">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#22d3ee] mb-4"></div>
              <div className="text-cyan-300 text-lg">Loading subjects...</div>
            </div>
          ) : (
            <div className="bg-black/40 shadow-[0_0_20px_#22d3ee40] border border-cyan-700/40 rounded-xl overflow-hidden backdrop-blur-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#0f172a]/70 border-b border-cyan-700/40">
                    <tr>
                      {['ID', 'Subject Code', 'Subject Name', 'Instructor', 'Actions'].map((header) => (
                        <th key={header} className="text-left py-4 px-6 font-bold text-[#22d3ee] uppercase text-sm tracking-wide">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-12 text-cyan-300 text-lg">
                          No subjects found. Click "Add Subject" to get started.
                        </td>
                      </tr>
                    ) : (
                      subjects.map((subject) => (
                        <tr
                          key={subject.id}
                          className="border-b border-cyan-800/30 hover:bg-cyan-900/10 transition-colors"
                        >
                          <td className="py-4 px-6 text-gray-200">{subject.id}</td>
                          <td className="py-4 px-6 text-gray-200">{subject.subject_code}</td>
                          <td className="py-4 px-6 text-gray-200">{subject.subject_name}</td>
                          <td className="py-4 px-6 text-gray-200">{subject.instructor}</td>
                          <td className="py-4 px-6 flex gap-2">
                            <button
                              onClick={() => handleEdit(subject)}
                              className="bg-[#22d3ee] hover:bg-[#4ade80] text-black px-4 py-2 text-sm font-semibold rounded border border-cyan-400 transition-all shadow-[0_0_8px_#22d3ee80]"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteClick(subject)}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm font-semibold rounded border border-red-500 transition-all"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-b from-[#0b0c10] to-[#111827] border border-cyan-600/50 rounded-xl shadow-[0_0_25px_#22d3ee60] max-w-md w-full p-8">
            <h2 className="text-3xl font-extrabold mb-6 text-[#22d3ee] drop-shadow-[0_0_8px_#4ade80]">
              {editingSubject ? 'Edit Subject' : 'Add New Subject'}
            </h2>

            <div className="space-y-5">
              {['subject_code', 'subject_name', 'instructor'].map((field) => (
                <div key={field}>
                  <label className="block text-cyan-200 font-medium mb-2 capitalize">
                    {field.replace('_', ' ')}
                  </label>
                  <input
                    type="text"
                    name={field}
                    value={formData[field]}
                    onChange={handleInputChange}
                    placeholder={
                      field === 'subject_code'
                        ? 'e.g., CC99'
                        : field === 'subject_name'
                        ? 'e.g., IT Professional Elective'
                        : 'e.g., Prof. Azzy'
                    }
                    className="w-full px-4 py-2 bg-black/60 border border-cyan-600 text-cyan-100 placeholder-cyan-400 placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-[#4ade80] rounded-md transition-all"
                  />
                </div>
              ))}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 bg-[#22d3ee] hover:bg-[#4ade80] text-black py-3 font-semibold border border-cyan-400 rounded-md transition-all shadow-[0_0_10px_#22d3ee60] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Saving...' : (editingSubject ? 'Update' : 'Add') + ' Subject'}
                </button>
                <button
                  onClick={closeModal}
                  disabled={submitting}
                  className="flex-1 bg-gray-700 hover:bg-gray-800 text-cyan-100 py-3 font-semibold border border-gray-600 rounded-md transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && subjectToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-gradient-to-b from-[#1a0505] to-[#0b0c10] border-2 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.3)] max-w-md w-full p-8 rounded-xl">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-red-400 mb-2">Delete Subject?</h3>
              <p className="text-cyan-200 mb-2">
                Are you sure you want to delete:
              </p>
              <p className="text-[#22d3ee] font-bold text-lg">
                {subjectToDelete.subject_code} - {subjectToDelete.subject_name}
              </p>
              <p className="text-cyan-300 text-sm mt-1">
                Instructor: {subjectToDelete.instructor}
              </p>
              <p className="text-red-300 text-sm mt-4">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDeleteCancel}
                disabled={deleting}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-cyan-100 py-3 px-4 font-semibold rounded-md transition-all border border-gray-600 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 font-semibold rounded-md transition-all border border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting...' : 'Delete Subject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}