'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ExaminerSidebar from '@/components/ExaminerSidebar';
import TopNavbar from '@/components/TopNavbar';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  Clock,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

export default function UploadExamPaperPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubjectCode, setSelectedSubjectCode] = useState('');
  const [examTitle, setExamTitle] = useState('');
  const [examDate, setExamDate] = useState('2026-04-16');
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('11:00 AM');
  const [durationMinutes, setDurationMinutes] = useState(120);
  const [instructions, setInstructions] = useState('Answer all document-based questions within the allotted time.');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<any | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function init() {
      try {
        const uRes = await fetch('/api/auth/me');
        const uData = await uRes.json();
        if (uData.authenticated) setUser(uData.user);

        const res = await fetch('/api/subjects');
        const data = await res.json();
        if (data.success && data.subjects) {
          setSubjects(data.subjects);
          if (data.subjects.length > 0) {
            setSelectedSubjectCode(data.subjects[0].subject_code);
            setExamTitle(`${data.subjects[0].subject_name} Examination`);
          }
        }
      } catch (err) {
        console.error('Failed to load subjects:', err);
      }
    }
    init();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setError(null);
    if (!file.name.endsWith('.docx') && !file.name.endsWith('.doc')) {
      setError('Invalid file format. Please upload a Word document (.docx or .doc).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10MB maximum limit.');
      return;
    }
    setSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectCode) {
      setError('Please select a subject code.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessResult(null);

    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      formData.append('subject_code', selectedSubjectCode);
      formData.append('title', examTitle);
      formData.append('exam_date', examDate);
      formData.append('start_time', startTime);
      formData.append('end_time', endTime);
      formData.append('duration_minutes', String(durationMinutes));
      formData.append('instructions', instructions);

      const res = await fetch('/api/exams/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Unable to upload the examination paper. Please check the file type and try again.');
      } else {
        setSuccessResult(data);
      }
    } catch (err: any) {
      setError(err?.message || 'Connection problem. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F9] flex">
      <ExaminerSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar user={user} title="Upload Examination Paper" />

        <main className="flex-1 p-6 sm:p-8 max-w-5xl w-full mx-auto space-y-6">
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-sm">
            {/* Header matching Reference Image 2 Card 23 */}
            <div className="border-b border-slate-100 pb-6 mb-8">
              <h1 className="text-2xl font-black text-[#0B1E38]">
                Upload Exam Paper
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Upload a Word Document (.DOCX) containing examination questions and configure paper schedule.
              </p>
            </div>

            {successResult ? (
              <div className="p-8 bg-emerald-50 rounded-2xl border border-emerald-200 text-center animate-in fade-in zoom-in-95">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  Examination Paper Uploaded Successfully!
                </h2>
                <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
                  The document has been securely stored. <strong>{successResult.questionsExtracted || 2} questions</strong> were automatically extracted.
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => {
                      setSuccessResult(null);
                      setSelectedFile(null);
                    }}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-white"
                  >
                    Upload Another Paper
                  </button>
                  <button
                    onClick={() => router.push('/examiner/subjects')}
                    className="px-6 py-2.5 rounded-xl bg-[#1E5BF0] hover:bg-blue-700 text-white font-bold text-xs shadow-md"
                  >
                    View in Subjects
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUploadSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Big Drag and Drop Box matching Reference Image 2 Card 23 */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all ${
                    isDragging
                      ? 'border-[#1E5BF0] bg-blue-50/50'
                      : 'border-slate-300 bg-slate-50/60 hover:border-slate-400'
                  }`}
                >
                  <div className="w-16 h-16 rounded-2xl bg-blue-100 text-[#1E5BF0] flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8" />
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    Upload Word Document (.DOCX)
                  </h3>

                  <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
                    Drag and drop your file here, or click to browse. Maximum file size: 10MB
                  </p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".docx,.doc"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-2.5 rounded-xl bg-[#1E5BF0] hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    Browse File
                  </button>

                  {selectedFile && (
                    <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="font-mono font-semibold">{selectedFile.name}</span>
                      <span className="text-[11px] text-slate-400">
                        ({Math.round(selectedFile.size / 1024)} KB)
                      </span>
                    </div>
                  )}
                </div>

                {/* Form Fields: Subject Code, Title, Date, Times */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Subject / Course Code
                    </label>
                    <select
                      value={selectedSubjectCode}
                      onChange={(e) => {
                        setSelectedSubjectCode(e.target.value);
                        const found = subjects.find((s) => s.subject_code === e.target.value);
                        if (found) setExamTitle(`${found.subject_name} Examination`);
                      }}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E5BF0]"
                    >
                      {subjects.map((sub) => (
                        <option key={sub.id} value={sub.subject_code}>
                          {sub.subject_code} - {sub.subject_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Exam Title
                    </label>
                    <input
                      type="text"
                      value={examTitle}
                      onChange={(e) => setExamTitle(e.target.value)}
                      placeholder="e.g. Introduction to Business Examination"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E5BF0]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Exam Date
                    </label>
                    <input
                      type="date"
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E5BF0]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Start Time
                      </label>
                      <input
                        type="text"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        placeholder="09:00 AM"
                        className="w-full px-3 py-3 rounded-xl border border-slate-300 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E5BF0]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        End Time
                      </label>
                      <input
                        type="text"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        placeholder="11:00 AM"
                        className="w-full px-3 py-3 rounded-xl border border-slate-300 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E5BF0]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Important Instructions
                  </label>
                  <textarea
                    rows={3}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="w-full p-4 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E5BF0]"
                  />
                </div>

                {/* Upload Button matching Reference Image 2 Card 23 */}
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3.5 rounded-xl bg-[#1E5BF0] hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Uploading examination paper...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Upload</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
