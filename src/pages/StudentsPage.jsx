import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import supabase from '../lib/supabase';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    student_number: '',
    first_name: '',
    last_name: '',
    course: '',
    year_level: ''
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year_level' ? parseInt(value) || '' : value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.student_number || !formData.first_name || !formData.last_name || !formData.course || !formData.year_level) {
      toast.error('Please fill in all fields');
      return;
    }
    
    try {
      setSubmitting(true);
      if (editingStudent) {
        const { error } = await supabase
          .from('students')
          .update(formData)
          .eq('id', editingStudent.id);

        if (error) throw error;
        toast.success('Student updated successfully!');
      } else {
        const { error } = await supabase
          .from('students')
          .insert([formData]);

        if (error) throw error;
        toast.success('Student added successfully!');
      }

      closeModal();
      fetchStudents();
    } catch (error) {
      console.error('Error saving student:', error);
      toast.error('Failed to save student: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      student_number: student.student_number,
      first_name: student.first_name,
      last_name: student.last_name,
      course: student.course,
      year_level: student.year_level
    });
    setShowModal(true);
  };

  const handleDeleteClick = (student) => {
    setStudentToDelete(student);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;

    try {
      setDeleting(true);
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', studentToDelete.id);

      if (error) throw error;
      
      toast.success('Student deleted successfully!');
      setShowDeleteConfirm(false);
      setStudentToDelete(null);
      fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('Failed to delete student');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setStudentToDelete(null);
  };

  const openAddModal = () => {
    setEditingStudent(null);
    setFormData({
      student_number: '',
      first_name: '',
      last_name: '',
      course: '',
      year_level: ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingStudent(null);
    setFormData({
      student_number: '',
      first_name: '',
      last_name: '',
      course: '',
      year_level: ''
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
          <li>
            <Link to="/" className="hover:text-[#4ade80] hover:drop-shadow-[0_0_8px_#4ade80] transition-all">Home</Link>
          </li>
          <li>
            <Link to="/students" className="text-[#22d3ee] hover:drop-shadow-[0_0_8px_#4ade80] transition-all">Students</Link>
          </li>
          <li>
            <Link to="/subjects" className="hover:text-[#4ade80] hover:drop-shadow-[0_0_8px_#4ade80] transition-all">Subjects</Link>
          </li>
          <li>
            <Link to="/grades" className="hover:text-[#4ade80] hover:drop-shadow-[0_0_8px_#4ade80] transition-all">Grades</Link>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex-1 px-8 py-8">
        <div className="w-full max-w-6xl mx-auto grid gap-6">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-extrabold text-[#22d3ee] tracking-wider drop-shadow-[0_0_10px_#4ade80]">Students Management</h1>
            <button onClick={openAddModal} className="bg-[#22d3ee] hover:bg-[#4ade80] text-black px-6 py-3 font-medium transition-all border border-[#22d3ee]/40 shadow-lg rounded-md">
              Add Student
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 bg-black/50 border border-[#22d3ee]/30 rounded-xl shadow-[0_0_12px_#22d3ee20]">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#22d3ee] mb-4"></div>
              <div className="text-cyan-200 text-lg">Loading students...</div>
            </div>
          ) : (
            <div className="bg-black/50 shadow-[0_0_20px_#22d3ee40] border border-[#22d3ee]/40 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#072127] bg-opacity-60">
                    <tr>
                      <th className="text-left py-4 px-6 font-bold text-cyan-200">ID</th>
                      <th className="text-left py-4 px-6 font-bold text-cyan-200">Student Number</th>
                      <th className="text-left py-4 px-6 font-bold text-cyan-200">First Name</th>
                      <th className="text-left py-4 px-6 font-bold text-cyan-200">Last Name</th>
                      <th className="text-left py-4 px-6 font-bold text-cyan-200">Course</th>
                      <th className="text-left py-4 px-6 font-bold text-cyan-200">Year Level</th>
                      <th className="text-left py-4 px-6 font-bold text-cyan-200">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-12 text-cyan-200 text-lg">
                          No students found. Click "Add Student" to get started.
                        </td>
                      </tr>
                    ) : (
                      students.map((student) => (
                        <tr key={student.id} className="border-b border-[#08323a] hover:bg-[#22d3ee]/10 transition-colors">
                          <td className="py-4 px-6 text-cyan-100">{student.id}</td>
                          <td className="py-4 px-6 text-cyan-100">{student.student_number}</td>
                          <td className="py-4 px-6 text-cyan-100">{student.first_name}</td>
                          <td className="py-4 px-6 text-cyan-100">{student.last_name}</td>
                          <td className="py-4 px-6 text-cyan-100">{student.course}</td>
                          <td className="py-4 px-6 text-cyan-100">{student.year_level}</td>
                          <td className="py-4 px-6">
                            <button onClick={() => handleEdit(student)} className="bg-[#22d3ee] hover:bg-[#4ade80] text-black px-4 py-2 mr-2 text-sm font-medium transition-all border border-[#22d3ee]/40 rounded-md">Edit</button>
                            <button onClick={() => handleDeleteClick(student)} className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 text-sm font-medium transition-colors border border-red-600 rounded-md">Delete</button>
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
      </main>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-black/60 border border-[#22d3ee]/30 shadow-[0_0_20px_#22d3ee40] max-w-md w-full p-8 rounded-xl">
            <h2 className="text-3xl font-extrabold mb-6 text-[#22d3ee] tracking-wide">{editingStudent ? 'Edit Student' : 'Add New Student'}</h2>
            
            <div>
              <div className="mb-4">
                <label className="block text-cyan-200 font-medium mb-2">Student Number</label>
                <input type="text" name="student_number" value={formData.student_number} onChange={handleInputChange} className="w-full px-4 py-2 bg-black bg-opacity-50 border border-[#22d3ee]/30 text-cyan-100 placeholder-cyan-300 placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-[#22d3ee] rounded-md" />
              </div>

              <div className="mb-4">
                <label className="block text-cyan-200 font-medium mb-2">First Name</label>
                <input type="text" name="first_name" value={formData.first_name} onChange={handleInputChange} className="w-full px-4 py-2 bg-black bg-opacity-50 border border-[#22d3ee]/30 text-cyan-100 placeholder-cyan-300 placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-[#22d3ee] rounded-md" />
              </div>

              <div className="mb-4">
                <label className="block text-cyan-200 font-medium mb-2">Last Name</label>
                <input type="text" name="last_name" value={formData.last_name} onChange={handleInputChange} className="w-full px-4 py-2 bg-black bg-opacity-50 border border-[#22d3ee]/30 text-cyan-100 placeholder-cyan-300 placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-[#22d3ee] rounded-md" />
              </div>

              <div className="mb-4">
                <label className="block text-cyan-200 font-medium mb-2">Course</label>
                <input type="text" name="course" value={formData.course} onChange={handleInputChange} className="w-full px-4 py-2 bg-black bg-opacity-50 border border-[#22d3ee]/30 text-cyan-100 placeholder-cyan-300 placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-[#22d3ee] rounded-md" />
              </div>

              <div className="mb-6">
                <label className="block text-cyan-200 font-medium mb-2">Year Level</label>
                <input type="number" name="year_level" value={formData.year_level} onChange={handleInputChange} className="w-full px-4 py-2 bg-black bg-opacity-50 border border-[#22d3ee]/30 text-cyan-100 placeholder-cyan-300 placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-[#22d3ee] rounded-md" min="1" max="5" />
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 bg-[#22d3ee] hover:bg-[#4ade80] text-black py-3 font-medium transition-all border border-[#22d3ee]/40 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Saving...' : (editingStudent ? 'Update' : 'Add') + ' Student'}
                </button>
                <button 
                  onClick={closeModal}
                  disabled={submitting}
                  className="flex-1 bg-gray-800 hover:bg-gray-900 text-cyan-100 py-3 font-medium transition-colors border border-gray-700 rounded-md disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && studentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-gradient-to-b from-[#1a0505] to-[#0b0c10] border-2 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.3)] max-w-md w-full p-8 rounded-xl">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-red-400 mb-2">Delete Student?</h3>
              <p className="text-cyan-200 mb-2">
                Are you sure you want to delete:
              </p>
              <p className="text-[#22d3ee] font-bold text-lg">
                {studentToDelete.first_name} {studentToDelete.last_name}
              </p>
              <p className="text-cyan-300 text-sm mt-1">
                ({studentToDelete.student_number})
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
                {deleting ? 'Deleting...' : 'Delete Student'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}