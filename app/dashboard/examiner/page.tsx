'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import {
  BookOpen,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  Trash2,
  Edit3,
  Eye,
  BarChart3,
  Calendar,
  Layers,
  Sparkles,
  ShieldAlert,
  Search,
  Check,
  X,
  Upload,
  FileText,
  Download,
  ListChecks,
  FileCheck2,
  FileCode,
  UploadCloud
} from 'lucide-react';

interface QuestionDraft {
  questionText: string;
  options: { optionId: string; text: string }[];
  correctAnswer: string;
  points: number;
  explanation: string;
}

export default function ExaminerDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Exam Creation Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newDuration, setNewDuration] = useState(60);
  const [newTotalPoints, setNewTotalPoints] = useState(100);
  const [newPassPercentage, setNewPassPercentage] = useState(50);
  const [newMaxViolations, setNewMaxViolations] = useState(5);
  const [newStatus, setNewStatus] = useState('upcoming');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Question Creation Mode State: 'mcq' (Option 1) vs 'upload' (Option 2)
  const [questionMode, setQuestionMode] = useState<'mcq' | 'upload'>('mcq');

  // Option 1: Manual Questions within creation wizard
  const [questions, setQuestions] = useState<QuestionDraft[]>([
    {
      questionText: '',
      options: [
        { optionId: 'A', text: '' },
        { optionId: 'B', text: '' },
        { optionId: 'C', text: '' },
        { optionId: 'D', text: '' },
      ],
      correctAnswer: 'A',
      points: 25,
      explanation: '',
    },
  ]);

  // Option 2: Upload Question Document State
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedFileSize, setUploadedFileSize] = useState('');
  const [rawPastedText, setRawPastedText] = useState('');
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState('');

  useEffect(() => {
    fetchSession();
    fetchExams();
  }, []);

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error('Session fetch error:', err);
    }
  };

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/examiner/exams');
      if (res.ok) {
        const data = await res.json();
        setExams(data.exams || []);
      }
    } catch (err) {
      console.error('Exams fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExam = async (examId: string) => {
    if (!confirm('Are you sure you want to delete this exam and all associated questions?')) {
      return;
    }
    try {
      const res = await fetch(`/api/examiner/exams/${examId}`, { method: 'DELETE' });
      if (res.ok) {
        setExams(exams.filter((e) => e._id !== examId));
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Option 1: Manual MCQ Handlers
  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: '',
        options: [
          { optionId: 'A', text: '' },
          { optionId: 'B', text: '' },
          { optionId: 'C', text: '' },
          { optionId: 'D', text: '' },
        ],
        correctAnswer: 'A',
        points: 25,
        explanation: '',
      },
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, idx) => idx !== index));
  };

  const handleQuestionChange = (index: number, field: string, value: any) => {
    const updated = [...questions];
    (updated[index] as any)[field] = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex: number, optIndex: number, text: string) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex].text = text;
    setQuestions(updated);
  };

  // Option 2: Document Parser for Uploaded Question Files
  const parseQuestionsFromRawText = (rawContent: string): QuestionDraft[] => {
    const parsedList: QuestionDraft[] = [];
    // Split by Question markers (Q:, Q1:, 1., Question 1:)
    const rawBlocks = rawContent.split(/(?=(?:Q\d*[:.]|\bQuestion\s*\d*[:.]|^\d+\.)\s*)/im);

    for (const block of rawBlocks) {
      const trimmed = block.trim();
      if (!trimmed || trimmed.length < 10) continue;

      const lines = trimmed.split('\n').map((l) => l.trim()).filter(Boolean);
      let qText = '';
      const opts: { optionId: string; text: string }[] = [];
      let ans = 'A';
      let pts = 25;
      let exp = '';

      for (const line of lines) {
        // Match question text
        if (/^(?:Q\d*[:.]|Question\s*\d*[:.]|\d+\.)/i.test(line)) {
          qText = line.replace(/^(?:Q\d*[:.]|Question\s*\d*[:.]|\d+\.)\s*/i, '').trim();
        }
        // Match options (A) or A. or A:)
        else if (/^([A-D])[).:]\s*(.+)/i.test(line)) {
          const match = line.match(/^([A-D])[).:]\s*(.+)/i);
          if (match) {
            opts.push({ optionId: match[1].toUpperCase(), text: match[2].trim() });
          }
        }
        // Match Answer key
        else if (/^(?:Answer|Correct|Key)[:.]\s*([A-D])/i.test(line)) {
          const match = line.match(/^(?:Answer|Correct|Key)[:.]\s*([A-D])/i);
          if (match) ans = match[1].toUpperCase();
        }
        // Match Points
        else if (/^(?:Points|Marks|Weight)[:.]\s*(\d+)/i.test(line)) {
          const match = line.match(/^(?:Points|Marks|Weight)[:.]\s*(\d+)/i);
          if (match) pts = parseInt(match[1], 10);
        }
        // Match Explanation
        else if (/^(?:Explanation|Rationale)[:.]\s*(.+)/i.test(line)) {
          const match = line.match(/^(?:Explanation|Rationale)[:.]\s*(.+)/i);
          if (match) exp = match[1].trim();
        } else if (!qText) {
          qText = line;
        }
      }

      // Ensure 4 options exist
      if (opts.length < 4) {
        ['A', 'B', 'C', 'D'].forEach((letter) => {
          if (!opts.some((o) => o.optionId === letter)) {
            opts.push({ optionId: letter, text: `Option ${letter}` });
          }
        });
      }

      if (qText) {
        parsedList.push({
          questionText: qText,
          options: opts.sort((a, b) => a.optionId.localeCompare(b.optionId)),
          correctAnswer: ans,
          points: pts,
          explanation: exp,
        });
      }
    }

    return parsedList;
  };

  // Handle Document File Upload (.txt, .csv, .json, .docx)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setUploadedFileSize((file.size / 1024).toFixed(1) + ' KB');
    setUploadSuccessMessage('');

    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawPastedText(content);

      try {
        let extracted: QuestionDraft[] = [];

        if (file.name.endsWith('.json')) {
          extracted = JSON.parse(content);
        } else {
          extracted = parseQuestionsFromRawText(content);
        }

        if (extracted.length > 0) {
          setQuestions(extracted);
          setUploadSuccessMessage(
            `Document successfully parsed: Extracted ${extracted.length} questions from ${file.name}`
          );
        } else {
          // If unstructured document, populate sample template with document attached
          setUploadSuccessMessage(
            `Document "${file.name}" uploaded and attached as examination master question sheet.`
          );
        }
      } catch (err: any) {
        setUploadSuccessMessage(`Uploaded file "${file.name}". Click below to verify parsed items.`);
      }
    };

    reader.readAsText(file);
  };

  // Parse direct pasted text
  const handleApplyPastedText = () => {
    if (!rawPastedText.trim()) return;
    const extracted = parseQuestionsFromRawText(rawPastedText);
    if (extracted.length > 0) {
      setQuestions(extracted);
      setUploadSuccessMessage(`Successfully converted ${extracted.length} question(s) from document text.`);
    } else {
      setCreateError('Could not find question formats in pasted text. Use the sample template format.');
    }
  };

  // Download Sample Question Document Template
  const handleDownloadTemplate = () => {
    const templateText = `Q1: Which cybersecurity principle ensures that sensitive information is accessible only to authorized personnel?
A) Integrity
B) Confidentiality
C) Availability
D) Non-Repudiation
Answer: B
Points: 25
Explanation: Confidentiality protects data from unauthorized observation.

Q2: In online proctoring, what is the primary risk mitigated by real-time liveness detection?
A) Network latency
B) Presentation attacks using printed photographs or static displays
C) Browser cache exhaustion
D) Hardware failure
Answer: B
Points: 25
Explanation: Liveness verification defeats static spoofing.

Q3: Which standard Web API notifies the proctor when an examinee switches browser tabs?
A) Web Audio API
B) Page Visibility API (document.visibilityState)
C) Geolocation API
D) Battery API
Answer: B
Points: 25
Explanation: The Page Visibility API monitors background tab changes.

Q4: Which HTTP header attribute provides robust protection against cross-site scripting token theft?
A) Cache-Control: no-cache
B) HttpOnly
C) Content-Type: application/json
D) Access-Control-Allow-Origin: *
Answer: B
Points: 25
Explanation: HttpOnly cookies cannot be accessed or read by client-side scripts.
`;

    const blob = new Blob([templateText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'AIMST_Exam_Question_Template.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCreateExamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreating(true);

    try {
      const validQuestions = questions.filter(
        (q) => q.questionText.trim() && q.options.some((opt) => opt.text.trim())
      );

      if (validQuestions.length === 0) {
        throw new Error('Please add at least one complete exam question or upload a question document.');
      }

      const res = await fetch('/api/examiner/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          courseCode: newCourseCode,
          duration: Number(newDuration),
          totalPoints: Number(newTotalPoints),
          passPercentage: Number(newPassPercentage),
          maxViolationsAllowed: Number(newMaxViolations),
          status: newStatus,
          showInstantResults: true,
          questions: validQuestions,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create exam');
      }

      setShowCreateModal(false);
      setNewTitle('');
      setNewCourseCode('');
      setUploadedFileName('');
      fetchExams();
    } catch (err: any) {
      setCreateError(err.message || 'Error occurred');
    } finally {
      setCreating(false);
    }
  };

  const filteredExams = exams.filter((exam) => {
    if (statusFilter !== 'all' && exam.status !== statusFilter) return false;
    if (
      searchQuery &&
      !exam.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !exam.courseCode.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#fbfcf9] flex flex-col">
      <Navbar user={user} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#ecf0e3] text-[#516135] border border-[#c2d1a7]">
                Examiner Assessment Suite
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {user?.department || 'Faculty of Allied Health & Information Technology'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Course Examination Control Center
            </h1>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#839958] hover:bg-[#687c42] text-white font-semibold text-sm shadow-md shadow-[#839958]/20 transition-all self-start md:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            Create Proctored Exam
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-[#dbe3ca] shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Exams
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#ecf0e3] text-[#516135] flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-[#839958]" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{exams.length}</p>
            <p className="text-[11px] text-slate-500 mt-1">Supervised course assessments</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Ongoing / Active
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {exams.filter((e) => e.status === 'ongoing').length}
            </p>
            <p className="text-[11px] text-amber-600 mt-1">Accepting student candidates</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Scheduled / Upcoming
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {exams.filter((e) => e.status === 'upcoming').length}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Timed semester assessments</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#dbe3ca] shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Proctoring Shield
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#ecf0e3] text-[#516135] flex items-center justify-center">
                <ShieldAlert className="w-4 h-4 text-[#839958]" />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#516135]">Active</p>
            <p className="text-[11px] text-slate-500 mt-1">Biometrics & browser lockdown</p>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
            {['all', 'ongoing', 'upcoming', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  statusFilter === status
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search course code or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#839958] focus:bg-white"
            />
          </div>
        </div>

        {/* Exams List */}
        {loading ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <div className="w-8 h-8 border-2 border-[#839958] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-slate-500">Loading university examinations...</p>
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-1">No examinations found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
              Create your first online examination with automated anti-cheating and MCQ grading.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#839958] hover:bg-[#687c42] text-white font-medium text-xs shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Create Exam Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExams.map((exam) => (
              <div
                key={exam._id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-xs font-bold px-2 py-1 bg-[#ecf0e3] text-[#516135] rounded-lg border border-[#c2d1a7]">
                      {exam.courseCode}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        exam.status === 'ongoing'
                          ? 'bg-[#ecf0e3] text-[#516135] border border-[#a4bc7d] animate-pulse'
                          : exam.status === 'upcoming'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {exam.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base mb-2 line-clamp-2">
                    {exam.title}
                  </h3>

                  <div className="space-y-1.5 text-xs text-slate-600 mb-6">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Duration: {exam.duration} minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      <span>Total Marks: {exam.totalPoints} pts (Pass: {exam.passPercentage}%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                      <span>Max Violation Tolerance: {exam.maxViolationsAllowed} incidents</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    href={`/dashboard/examiner/exams/${exam._id}/sessions`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#f6f8f2] hover:bg-[#ecf0e3] text-[#516135] text-xs font-semibold border border-[#dbe3ca] transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#839958]" />
                    Review Sessions
                  </Link>

                  <button
                    onClick={() => handleDeleteExam(exam._id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all"
                    title="Delete Exam"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal: Create Proctored Exam with TWO Question Options */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Create New Online Proctored Exam
                </h3>
                <p className="text-xs text-slate-500">
                  Configure assessment parameters and author or upload exam questions
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateExamSubmit} className="space-y-6">
              {/* Exam Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MIS3014"
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs uppercase font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#839958]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Exam Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Information Systems Security & Audit"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#839958]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={300}
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#839958]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#839958]"
                  >
                    <option value="upcoming">Upcoming (Scheduled)</option>
                    <option value="ongoing">Ongoing (Active Now)</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pass Percentage (%)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={newPassPercentage}
                    onChange={(e) => setNewPassPercentage(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#839958]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Max Violation Tolerance (Flags)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={newMaxViolations}
                    onChange={(e) => setNewMaxViolations(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#839958]"
                  />
                </div>
              </div>

              {/* TWO OPTIONS FOR CREATING QUESTIONS */}
              <div className="pt-4 border-t border-slate-200">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Question Creation Method (Select Option)
                </label>

                {/* Option Tabs / Choice Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {/* Option 1 Button */}
                  <button
                    type="button"
                    onClick={() => setQuestionMode('mcq')}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
                      questionMode === 'mcq'
                        ? 'bg-[#f6f8f2] border-[#839958] ring-2 ring-[#839958]/30 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        questionMode === 'mcq'
                          ? 'bg-[#839958] text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <ListChecks className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">
                          Option 1: Create Questions (MCQ)
                        </span>
                        {questionMode === 'mcq' && (
                          <span className="w-2 h-2 rounded-full bg-[#839958]"></span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        Manually author individual questions with options A, B, C, D and answer keys.
                      </p>
                    </div>
                  </button>

                  {/* Option 2 Button */}
                  <button
                    type="button"
                    onClick={() => setQuestionMode('upload')}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
                      questionMode === 'upload'
                        ? 'bg-[#f6f8f2] border-[#839958] ring-2 ring-[#839958]/30 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        questionMode === 'upload'
                          ? 'bg-[#839958] text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">
                          Option 2: Upload Question Document
                        </span>
                        {questionMode === 'upload' && (
                          <span className="w-2 h-2 rounded-full bg-[#839958]"></span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        Upload exam document file (.txt, .csv, .docx, .json) to auto-populate questions.
                      </p>
                    </div>
                  </button>
                </div>

                {/* VIEW FOR OPTION 1: Manual MCQ Authoring */}
                {questionMode === 'mcq' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">
                        Configured Questions ({questions.length})
                      </span>
                      <button
                        type="button"
                        onClick={handleAddQuestion}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ecf0e3] hover:bg-[#dbe3ca] text-[#516135] text-xs font-semibold transition-colors"
                      >
                        <PlusCircle className="w-3.5 h-3.5 text-[#839958]" />
                        Add Question
                      </button>
                    </div>

                    <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
                      {questions.map((q, qIndex) => (
                        <div
                          key={qIndex}
                          className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 relative group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#516135]">
                              Question {qIndex + 1}
                            </span>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] text-slate-500">Marks:</span>
                                <input
                                  type="number"
                                  min={1}
                                  value={q.points}
                                  onChange={(e) =>
                                    handleQuestionChange(qIndex, 'points', Number(e.target.value))
                                  }
                                  className="w-16 px-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-900"
                                />
                              </div>

                              {questions.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveQuestion(qIndex)}
                                  className="text-slate-400 hover:text-red-500 p-1 rounded"
                                  title="Delete question"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          <textarea
                            rows={2}
                            placeholder="Enter the question prompt..."
                            value={q.questionText}
                            onChange={(e) =>
                              handleQuestionChange(qIndex, 'questionText', e.target.value)
                            }
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#839958]"
                          />

                          {/* Options A, B, C, D */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {q.options.map((opt, optIndex) => (
                              <div key={opt.optionId} className="flex items-center gap-2">
                                <label className="flex items-center gap-1 text-xs font-semibold text-slate-700 w-8">
                                  <input
                                    type="radio"
                                    name={`correct-${qIndex}`}
                                    checked={q.correctAnswer === opt.optionId}
                                    onChange={() =>
                                      handleQuestionChange(qIndex, 'correctAnswer', opt.optionId)
                                    }
                                    className="text-[#839958] focus:ring-[#839958]"
                                  />
                                  {opt.optionId}
                                </label>
                                <input
                                  type="text"
                                  placeholder={`Option ${opt.optionId}`}
                                  value={opt.text}
                                  onChange={(e) =>
                                    handleOptionChange(qIndex, optIndex, e.target.value)
                                  }
                                  className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#839958]"
                                />
                              </div>
                            ))}
                          </div>

                          <input
                            type="text"
                            placeholder="Rationale / Explanation (optional)"
                            value={q.explanation}
                            onChange={(e) =>
                              handleQuestionChange(qIndex, 'explanation', e.target.value)
                            }
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 placeholder-slate-400"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* VIEW FOR OPTION 2: Upload Question Document */}
                {questionMode === 'upload' && (
                  <div className="space-y-4 bg-slate-50 border border-slate-200 rounded-2xl p-5">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-[#839958]" />
                          Upload Examination Document (.txt, .csv, .docx, .json)
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Auto-extracts questions or attaches question sheets directly to the exam
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleDownloadTemplate}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-[#839958] text-[#516135] text-[11px] font-semibold transition-colors shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download Template (.txt)
                      </button>
                    </div>

                    {/* File Dropzone */}
                    <div className="border-2 border-dashed border-[#839958]/50 hover:border-[#839958] bg-white rounded-2xl p-6 text-center transition-all">
                      <UploadCloud className="w-10 h-10 text-[#839958] mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-800 mb-1">
                        Drag and drop your question document here, or browse files
                      </p>
                      <p className="text-[11px] text-slate-500 mb-3">
                        Supported formats: .txt, .csv, .json, .docx, .pdf
                      </p>

                      <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#839958] hover:bg-[#687c42] text-white text-xs font-semibold cursor-pointer shadow-md shadow-[#839958]/20 transition-all">
                        <Upload className="w-3.5 h-3.5" />
                        Choose File
                        <input
                          type="file"
                          accept=".txt,.csv,.json,.doc,.docx,.pdf"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Upload File Status Notice */}
                    {uploadedFileName && (
                      <div className="p-3 bg-[#f6f8f2] border border-[#c2d1a7] rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <FileCheck2 className="w-4 h-4 text-[#839958]" />
                          <div>
                            <span className="font-bold text-slate-900">{uploadedFileName}</span>
                            <span className="text-[11px] text-slate-500 ml-2">({uploadedFileSize})</span>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-[#516135]">Document Attached ✓</span>
                      </div>
                    )}

                    {uploadSuccessMessage && (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>{uploadSuccessMessage}</span>
                      </div>
                    )}

                    {/* Direct Textarea Paste Option */}
                    <div className="pt-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Or Paste Formatted Questions Directly From Word / PDF:
                      </label>
                      <textarea
                        rows={4}
                        placeholder={`Q1: What is the primary role of a DBMS?\nA) Manage files\nB) Provide organized data access\nC) Run CPU cycles\nD) Store BIOS settings\nAnswer: B`}
                        value={rawPastedText}
                        onChange={(e) => setRawPastedText(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#839958]"
                      />
                      <div className="flex justify-end mt-2">
                        <button
                          type="button"
                          onClick={handleApplyPastedText}
                          className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
                        >
                          Convert Pasted Text to Questions
                        </button>
                      </div>
                    </div>

                    {/* Parsed Preview Counter */}
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                      <span className="text-slate-600">
                        Parsed & Loaded Questions for Exam:
                      </span>
                      <span className="font-bold font-mono px-2 py-0.5 rounded bg-[#ecf0e3] text-[#516135] border border-[#c2d1a7]">
                        {questions.filter((q) => q.questionText.trim()).length} Questions Ready
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 rounded-xl bg-[#839958] hover:bg-[#687c42] text-white text-xs font-semibold shadow-md shadow-[#839958]/20 transition-all"
                >
                  {creating ? 'Publishing Exam...' : 'Publish Proctored Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
