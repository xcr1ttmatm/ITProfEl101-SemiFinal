import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PDFDownloadLink } from '@react-pdf/renderer';
import toast, { Toaster } from 'react-hot-toast';
import supabase from '../lib/supabase';
import { studentAnalyzer } from '../lib/ai';
import GradeReportDocument from '../pdfTemplates/GradeReportDocument';

export default function GradesPage() {
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [gradeInputs, setGradeInputs] = useState({});
  
  // AI Analysis states
  const [analysisData, setAnalysisData] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  useEffect(() => {
    fetchSubjects();
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      fetchGrades();
      setAnalysisData(null);
      setShowAnalysis(false);
    }
  }, [selectedSubject]);

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('subject_name', { ascending: true });

      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to fetch subjects');
    }
  };

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('last_name', { ascending: true });

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students');
    }
  };

  const fetchGrades = async () => {
    if (!selectedSubject) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('grades')
        .select('*')
        .eq('subject_id', selectedSubject);

      if (error) throw error;

      const gradesMap = {};
      (data || []).forEach((grade) => {
        gradesMap[grade.student_id] = {
          id: grade.id,
          prelim: grade.prelim || '',
          midterm: grade.midterm || '',
          semifinal: grade.semifinal || '',
          final: grade.final || '',
        };
      });

      setGrades(data || []);
      setGradeInputs(gradesMap);
    } catch (error) {
      console.error('Error fetching grades:', error);
      toast.error('Failed to fetch grades');
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (studentId, term, value) => {
    setGradeInputs((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [term]: value === '' ? '' : parseFloat(value) || '',
      },
    }));
  };

  const calculateAverage = (studentId) => {
    const gradeData = gradeInputs[studentId];
    if (!gradeData) return '';

    const values = [
      gradeData.prelim,
      gradeData.midterm,
      gradeData.semifinal,
      gradeData.final,
    ]
      .filter((v) => v !== '' && v !== null && v !== undefined)
      .map(Number);

    if (values.length === 0) return '';
    const sum = values.reduce((acc, val) => acc + val, 0);
    return (sum / values.length).toFixed(2);
  };

  const handleSaveAllGrades = async () => {
    if (!selectedSubject) {
      toast.error('Please select a subject first');
      return;
    }

    try {
      setSaving(true);
      
      const updatePromises = [];
      const insertPayloads = [];

      students.forEach((student) => {
        const gradeData = gradeInputs[student.id];
        if (!gradeData) return;

        const payload = {
          student_id: student.id,
          subject_id: parseInt(selectedSubject),
          prelim: gradeData.prelim === '' ? null : gradeData.prelim,
          midterm: gradeData.midterm === '' ? null : gradeData.midterm,
          semifinal: gradeData.semifinal === '' ? null : gradeData.semifinal,
          final: gradeData.final === '' ? null : gradeData.final,
        };

        const existingGrade = grades.find((g) => g.student_id === student.id);

        if (existingGrade) {
          updatePromises.push(
            supabase.from('grades').update(payload).eq('id', existingGrade.id)
          );
        } else {
          insertPayloads.push(payload);
        }
      });

      if (updatePromises.length > 0) {
        const results = await Promise.all(updatePromises);
        const errors = results.filter((r) => r.error);
        if (errors.length > 0) {
          throw new Error('Some grades failed to update');
        }
      }

      if (insertPayloads.length > 0) {
        const { error } = await supabase.from('grades').insert(insertPayloads);
        if (error) throw error;
      }

      toast.success('All grades saved successfully!');
      fetchGrades();
    } catch (error) {
      console.error('Error saving grades:', error);
      toast.error('Failed to save grades: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedSubject) {
      toast.error('Please select a subject first');
      return;
    }

    try {
      setAnalyzing(true);
      toast.loading('Generating AI analysis...', { id: 'ai-analysis' });
      
      const result = await studentAnalyzer(parseInt(selectedSubject));
      
      if (result.success) {
        setAnalysisData(result);
        setShowAnalysis(true);
        toast.success('AI analysis generated successfully!', { id: 'ai-analysis' });
      } else {
        toast.error('Analysis failed: ' + result.error, { id: 'ai-analysis' });
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate AI analysis: ' + error.message, { id: 'ai-analysis' });
    } finally {
      setAnalyzing(false);
    }
  };

  const getStudentFullName = (student) =>
    `${student.first_name} ${student.last_name}`;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#0b0c10] via-[#111827] to-black text-cyan-100 relative overflow-hidden">
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
          loading: {
            iconTheme: {
              primary: '#22d3ee',
              secondary: '#0f172a',
            },
          },
        }}
      />
      
      {/* Grid Glow Background */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,255,200,0.05)_1px,transparent_1px),linear-gradient(rgba(0,255,200,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>

      {/* Navbar */}
      <nav className="relative z-10 flex justify-between items-center px-8 py-4 bg-black/40 shadow-md backdrop-blur-sm border-b border-cyan-500/30">
        <h1 className="text-2xl font-bold text-[#22d3ee] tracking-wider drop-shadow-[0_0_10px_#22d3ee]">
          Student Portal
        </h1>
        <ul className="flex space-x-6 text-cyan-200 font-medium">
          <li>
            <Link
              to="/"
              className="hover:text-[#4ade80] hover:drop-shadow-[0_0_8px_#4ade80] transition-all"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/students"
              className="hover:text-[#4ade80] hover:drop-shadow-[0_0_8px_#4ade80] transition-all"
            >
              Students
            </Link>
          </li>
          <li>
            <Link
              to="/subjects"
              className="hover:text-[#4ade80] hover:drop-shadow-[0_0_8px_#4ade80] transition-all"
            >
              Subjects
            </Link>
          </li>
          <li>
            <Link
              to="/grades"
              className="text-[#4ade80] drop-shadow-[0_0_8px_#4ade80] transition-all"
            >
              Grades
            </Link>
          </li>
        </ul>
      </nav>

      {/* Main */}
      <main className="relative z-10 flex-1 px-8 py-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-extrabold mb-6 text-[#22d3ee] drop-shadow-[0_0_12px_#4ade80]">
            Grades Management
          </h1>

          {/* Subject Selector with Action Buttons */}
          <div className="bg-black/50 border border-[#22d3ee]/40 p-6 rounded-xl shadow-[0_0_20px_#22d3ee20] mb-8 backdrop-blur-md">
            <label className="block text-cyan-200 font-medium mb-3 text-lg">
              Select Subject
            </label>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="flex-1 md:w-96 px-4 py-3 bg-black/70 border border-[#22d3ee]/60 rounded-md text-cyan-100 focus:outline-none focus:ring-2 focus:ring-[#4ade80] transition-all"
              >
                <option value="">-- Choose a subject --</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.subject_code} - {subject.subject_name}
                  </option>
                ))}
              </select>
              
              <div className="flex gap-3">
                <button
                  onClick={handleSaveAllGrades}
                  disabled={!selectedSubject || saving}
                  className="bg-[#4ade80]/20 hover:bg-[#4ade80]/40 text-[#4ade80] border border-[#4ade80]/40 px-6 py-3 rounded-md font-medium transition-all shadow-[0_0_10px_#4ade8030] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {saving ? 'Saving...' : 'Save All Grades'}
                </button>
                
                <button
                  onClick={handleGenerateReport}
                  disabled={!selectedSubject || analyzing}
                  className="bg-[#22d3ee]/20 hover:bg-[#22d3ee]/40 text-[#22d3ee] border border-[#22d3ee]/40 px-6 py-3 rounded-md font-medium transition-all shadow-[0_0_10px_#22d3ee30] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {analyzing ? '🤖 Analyzing...' : '🤖 Generate AI Analysis Report'}
                </button>
              </div>
            </div>
          </div>

          {/* AI Analysis Section */}
          {showAnalysis && analysisData && (
            <div className="mb-8 space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-[#22d3ee]/10 border border-[#22d3ee]/30 p-4 rounded-lg backdrop-blur-md">
                  <p className="text-sm text-cyan-300">Total Students</p>
                  <p className="text-3xl font-bold text-[#22d3ee]">{analysisData.summary.totalStudents}</p>
                </div>
                <div className="bg-[#4ade80]/10 border border-[#4ade80]/30 p-4 rounded-lg backdrop-blur-md">
                  <p className="text-sm text-green-300">Passed</p>
                  <p className="text-3xl font-bold text-[#4ade80]">{analysisData.summary.passed}</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg backdrop-blur-md">
                  <p className="text-sm text-red-300">Failed</p>
                  <p className="text-3xl font-bold text-red-400">{analysisData.summary.failed}</p>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/30 p-4 rounded-lg backdrop-blur-md">
                  <p className="text-sm text-purple-300">Class Average</p>
                  <p className="text-3xl font-bold text-purple-400">{analysisData.summary.averageGrade}</p>
                </div>
              </div>

              {/* AI Analysis */}
              <div className="bg-gradient-to-r from-[#22d3ee]/10 to-purple-500/10 border border-[#22d3ee]/30 p-6 rounded-xl backdrop-blur-md">
                <h2 className="text-2xl font-bold mb-4 text-[#22d3ee] flex items-center gap-2">
                  🤖 AI-Powered Analysis
                </h2>
                <p className="text-cyan-100 leading-relaxed whitespace-pre-wrap">
                  {analysisData.analysis}
                </p>
              </div>

              {/* Recommendations */}
              {analysisData.recommendations && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 p-6 rounded-xl backdrop-blur-md">
                  <h2 className="text-2xl font-bold mb-4 text-yellow-400">📋 Recommendations</h2>
                  <p className="text-cyan-100 leading-relaxed whitespace-pre-wrap">
                    {analysisData.recommendations}
                  </p>
                </div>
              )}

              {/* Pass/Fail Lists */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#4ade80]/10 border border-[#4ade80]/30 p-6 rounded-xl backdrop-blur-md">
                  <h3 className="font-bold text-[#4ade80] text-xl mb-3">
                    ✅ Passed Students ({analysisData.passedStudents.length})
                  </h3>
                  <ul className="space-y-2">
                    {analysisData.passedStudents.map((name, idx) => (
                      <li key={idx} className="text-cyan-100">• {name}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-xl backdrop-blur-md">
                  <h3 className="font-bold text-red-400 text-xl mb-3">
                    ❌ Failed Students ({analysisData.failedStudents.length})
                  </h3>
                  <ul className="space-y-2">
                    {analysisData.failedStudents.map((name, idx) => (
                      <li key={idx} className="text-cyan-100">• {name}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* PDF Download Button */}
              <div className="flex justify-center">
                <PDFDownloadLink
                  document={<GradeReportDocument analysisData={analysisData} />}
                  fileName={`grade_report_${analysisData.subject.code}_${new Date().toISOString().split('T')[0]}.pdf`}
                  className="bg-[#4ade80]/20 hover:bg-[#4ade80]/40 text-[#4ade80] border border-[#4ade80]/40 px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-[0_0_15px_#4ade8040]"
                >
                  {({ loading }) => (loading ? '⏳ Generating PDF...' : '📥 Download PDF Report')}
                </PDFDownloadLink>
              </div>
            </div>
          )}

          {/* Grades Table */}
          {selectedSubject ? (
            loading ? (
              <div className="text-center py-12 bg-black/40 border border-[#22d3ee]/30 rounded-xl shadow-[0_0_15px_#22d3ee30]">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#22d3ee] mb-4"></div>
                <div className="text-cyan-200 text-lg">Loading grades...</div>
              </div>
            ) : (
              <div className="bg-black/50 border border-[#22d3ee]/30 rounded-xl overflow-hidden shadow-[0_0_25px_#22d3ee40] backdrop-blur-md">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#0f172a]/60 border-b border-[#22d3ee]/20">
                      <tr>
                        {[
                          'Student ID',
                          'Student Name',
                          'Prelims',
                          'Midterm',
                          'Semifinal',
                          'Final',
                          'Average',
                        ].map((header) => (
                          <th
                            key={header}
                            className="text-left py-4 px-6 font-bold text-[#22d3ee]"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {students.length === 0 ? (
                        <tr>
                          <td
                            colSpan="7"
                            className="text-center py-12 text-cyan-200 text-lg"
                          >
                            No students found.
                          </td>
                        </tr>
                      ) : (
                        students.map((student) => {
                          const average = calculateAverage(student.id);
                          const averageNum = parseFloat(average);
                          const isFailing = average && averageNum > 3.0;
                          
                          return (
                            <tr
                              key={student.id}
                              className={`border-b border-[#22d3ee]/10 transition-colors ${
                                isFailing 
                                  ? 'bg-red-500/10 hover:bg-red-500/20' 
                                  : 'hover:bg-[#22d3ee10]'
                              }`}
                            >
                              <td className="py-4 px-6 text-cyan-100">
                                {student.student_number}
                              </td>
                              <td className="py-4 px-6 text-cyan-100">
                                {getStudentFullName(student)}
                              </td>
                              {['prelim', 'midterm', 'semifinal', 'final'].map(
                                (term) => (
                                  <td key={term} className="py-4 px-6">
                                    <input
                                      type="number"
                                      step="0.1"
                                      min="1.0"
                                      max="5.0"
                                      value={gradeInputs[student.id]?.[term] || ''}
                                      onChange={(e) =>
                                        handleGradeChange(
                                          student.id,
                                          term,
                                          e.target.value
                                        )
                                      }
                                      className="w-20 px-2 py-1 bg-black/70 border border-[#22d3ee]/50 text-cyan-100 focus:outline-none focus:ring-2 focus:ring-[#4ade80] rounded-md"
                                      placeholder="0.0"
                                    />
                                  </td>
                                )
                              )}
                              <td className={`py-4 px-6 font-bold ${
                                isFailing 
                                  ? 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]' 
                                  : 'text-[#4ade80]'
                              }`}>
                                {average || '-'}
                                {isFailing && ' ❌'}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          ) : (
            <div className="text-center py-12 bg-black/40 border border-[#22d3ee]/30 rounded-xl shadow-[0_0_15px_#22d3ee30]">
              <div className="text-cyan-200 text-lg">
                Please select a subject to view and manage grades.
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}