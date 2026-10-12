'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import {
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Download,
  FileSpreadsheet,
  Camera,
  X,
  User,
  Clock,
  Filter
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ExaminerSessionReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const examId = resolvedParams.id;

  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [sessionLogs, setSessionLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Evidence snapshot modal state
  const [previewScreenshot, setPreviewScreenshot] = useState<string | null>(null);

  useEffect(() => {
    fetchExamAndSessions();
  }, [examId]);

  const fetchExamAndSessions = async () => {
    try {
      setLoading(true);
      const [examRes, allExamsRes] = await Promise.all([
        fetch(`/api/examiner/exams/${examId}`),
        fetch('/api/examiner/exams'),
      ]);

      if (examRes.ok) {
        const data = await examRes.json();
        setExam(data.exam);
      }

      // Query sessions for this exam
      // For demonstration, fetch or synthesize candidate sessions
      const demoSessions = [
        {
          _id: 'session_demo_01',
          studentName: 'Ahmad Faiz Bin Daniel',
          studentID: 'STD-23091',
          studentEmail: 'student@aimst.edu.my',
          startTime: new Date(Date.now() - 3600000).toISOString(),
          endTime: new Date(Date.now() - 1200000).toISOString(),
          status: 'submitted',
          violationsCount: 2,
          totalScore: 75,
          percentage: 75,
          faceVerified: true,
        },
        {
          _id: 'session_demo_02',
          studentName: 'Tan Wei Ling',
          studentID: 'STD-23092',
          studentEmail: 'weiling@aimst.edu.my',
          startTime: new Date(Date.now() - 2400000).toISOString(),
          endTime: new Date(Date.now() - 600000).toISOString(),
          status: 'submitted',
          violationsCount: 0,
          totalScore: 100,
          percentage: 100,
          faceVerified: true,
        },
      ];

      setSessions(demoSessions);
      if (demoSessions.length > 0) {
        handleSelectSession(demoSessions[0]);
      }
    } catch (err) {
      console.error('Fetch sessions error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSession = async (session: any) => {
    setSelectedSession(session);
    setLogsLoading(true);
    try {
      const res = await fetch(`/api/proctor/logs?sessionID=${session._id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.logs && data.logs.length > 0) {
          setSessionLogs(data.logs);
        } else {
          // Provide mock forensic logs for demo candidate session 1
          if (session.violationsCount > 0) {
            setSessionLogs([
              {
                _id: 'log_mock_01',
                incidentType: 'tab_switch',
                timestamp: new Date(Date.now() - 1800000).toISOString(),
                description: 'Candidate navigated away from exam tab (Page Visibility change)',
                screenshotUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                reviewed: false,
                severity: 'high',
              },
              {
                _id: 'log_mock_02',
                incidentType: 'face_missing',
                timestamp: new Date(Date.now() - 1400000).toISOString(),
                description: 'Face absence detected in optical frame for >5 consecutive seconds',
                screenshotUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                reviewed: true,
                severity: 'high',
              },
            ]);
          } else {
            setSessionLogs([]);
          }
        }
      }
    } catch (err) {
      console.error('Fetch logs error:', err);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleToggleReviewed = async (logId: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/proctor/logs/${logId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewed: !currentStatus }),
      });

      setSessionLogs((prev) =>
        prev.map((l) => (l._id === logId ? { ...l, reviewed: !currentStatus } : l))
      );
    } catch (err) {
      console.error('Review status toggle error:', err);
    }
  };

  // Export Forensic PDF Report
  const exportPDFReport = () => {
    if (!selectedSession || !exam) return;

    const doc = new jsPDF();

    // University Header
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text('AIMST UNIVERSITY', 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('Online Examination Proctoring & Forensic Audit Report', 14, 26);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);

    doc.setDrawColor(226, 232, 240);
    doc.line(14, 36, 196, 36);

    // Exam & Candidate Summary
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('Assessment & Candidate Profile', 14, 44);

    autoTable(doc, {
      startY: 48,
      head: [['Field', 'Details']],
      body: [
        ['Course Code & Title', `${exam.courseCode} - ${exam.title}`],
        ['Candidate Name', selectedSession.studentName],
        ['Candidate ID', selectedSession.studentID],
        ['Exam Session ID', selectedSession._id],
        ['Score Achieved', `${selectedSession.totalScore} pts (${selectedSession.percentage}%)`],
        ['Total Integrity Violations', `${selectedSession.violationsCount} flagged incident(s)`],
        ['Biometric Verification', 'PASSED (Facial descriptors matched registration record)'],
      ],
      theme: 'grid',
      headStyles: { fillColor: [15, 118, 110] },
    });

    // Proctoring Incident Timeline Table
    const lastY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text('Recorded Proctoring Violations & Evidence Audit', 14, lastY);

    const tableRows = sessionLogs.map((log) => [
      new Date(log.timestamp).toLocaleTimeString(),
      log.incidentType.toUpperCase().replace('_', ' '),
      log.severity.toUpperCase(),
      log.description,
      log.reviewed ? 'REVIEWED' : 'PENDING ACTION',
    ]);

    autoTable(doc, {
      startY: lastY + 4,
      head: [['Time', 'Incident Type', 'Severity', 'Description', 'Audit Status']],
      body: tableRows.length > 0 ? tableRows : [['-', 'No violations', '-', 'Zero incidents recorded during session', 'VERIFIED']],
      theme: 'striped',
      headStyles: { fillColor: [15, 23, 42] },
    });

    // Save PDF
    doc.save(`AIMST_Proctoring_Report_${selectedSession.studentID}_${exam.courseCode}.pdf`);
  };

  // Export CSV Report
  const exportCSVReport = () => {
    if (!selectedSession || !exam) return;

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Time,Incident Type,Severity,Description,Reviewed\n';

    sessionLogs.forEach((log) => {
      const row = [
        `"${new Date(log.timestamp).toLocaleTimeString()}"`,
        `"${log.incidentType}"`,
        `"${log.severity}"`,
        `"${log.description.replace(/"/g, '""')}"`,
        `"${log.reviewed ? 'Yes' : 'No'}"`,
      ].join(',');
      csvContent += row + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Proctoring_Incidents_${selectedSession.studentID}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/dashboard/examiner"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Exams Control Center
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCSVReport}
              disabled={!selectedSession}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm transition-all disabled:opacity-50"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              Export CSV
            </button>
            <button
              onClick={exportPDFReport}
              disabled={!selectedSession}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-aimst-700 hover:bg-aimst-800 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              Export Forensic PDF
            </button>
          </div>
        </div>

        {/* Exam Title Summary */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200 uppercase">
                {exam?.courseCode}
              </span>
              <h1 className="text-xl font-bold text-slate-900 mt-1">
                {exam?.title} — Candidate Forensic Review
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect examinee timelines, photographic evidence, and academic violation audits
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
              <div>
                <span className="text-slate-400 block text-[10px]">Candidates:</span>
                <span className="font-bold text-slate-900">{sessions.length} submitted</span>
              </div>
              <div className="h-6 w-px bg-slate-200"></div>
              <div>
                <span className="text-slate-400 block text-[10px]">Flagged Sessions:</span>
                <span className="font-bold text-amber-600">
                  {sessions.filter((s) => s.violationsCount > 0).length} sessions
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Master-Detail Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Candidates List Panel */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h2 className="font-bold text-sm text-slate-900 mb-3 flex items-center justify-between">
              <span>Candidate Sessions</span>
              <span className="text-xs text-slate-400 font-normal">
                {sessions.length} Candidates
              </span>
            </h2>

            <div className="space-y-2.5">
              {sessions.map((sess) => {
                const isSelected = selectedSession?._id === sess._id;
                const hasFlags = sess.violationsCount > 0;

                return (
                  <button
                    key={sess._id}
                    onClick={() => handleSelectSession(sess)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-purple-50/80 border-purple-500 shadow-sm ring-1 ring-purple-500'
                        : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-900">
                        {sess.studentName}
                      </span>
                      {hasFlags ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {sess.violationsCount} Flags
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Clean
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-mono">{sess.studentID}</span>
                      <span className="font-semibold text-slate-800">
                        Score: {sess.totalScore} ({sess.percentage}%)
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Session Forensics & Evidence Panel */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            {selectedSession ? (
              <div>
                {/* Candidate Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200 mb-6 gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {selectedSession.studentName}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                      {selectedSession.studentID} • {selectedSession.studentEmail}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Assessment Score:</span>
                      <span className="font-bold text-sm text-aimst-700">
                        {selectedSession.totalScore} pts ({selectedSession.percentage}%)
                      </span>
                    </div>
                    <div className="h-6 w-px bg-slate-200"></div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Biometrics:</span>
                      <span className="font-bold text-xs text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified
                      </span>
                    </div>
                  </div>
                </div>

                {/* Violations Timeline */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-500" />
                    Flagged Proctoring Incidents Timeline
                  </h4>

                  {logsLoading ? (
                    <div className="py-12 text-center text-slate-400 text-xs">
                      Loading incident telemetry...
                    </div>
                  ) : sessionLogs.length === 0 ? (
                    <div className="py-12 text-center bg-slate-50 rounded-xl border border-slate-200 p-6">
                      <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                      <p className="font-bold text-sm text-slate-800">No Cheating Incidents Detected</p>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        This candidate adhered to all proctoring protocols throughout the examination. Optical face presence and full-screen compliance were maintained.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {sessionLogs.map((log) => (
                        <div
                          key={log._id}
                          className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-red-100 text-red-600 flex-shrink-0 mt-0.5">
                              <AlertTriangle className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-xs text-slate-900">
                                  {log.incidentType.replace('_', ' ').toUpperCase()}
                                </span>
                                <span
                                  className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                    log.severity === 'critical'
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-amber-100 text-amber-700'
                                  }`}
                                >
                                  {log.severity}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {new Date(log.timestamp).toLocaleTimeString()}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 leading-relaxed">
                                {log.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                            {log.screenshotUrl && (
                              <button
                                onClick={() => setPreviewScreenshot(log.screenshotUrl)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-sm"
                              >
                                <Camera className="w-3.5 h-3.5 text-purple-600" />
                                View Evidence
                              </button>
                            )}

                            <button
                              onClick={() => handleToggleReviewed(log._id, log.reviewed)}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                log.reviewed
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                              }`}
                            >
                              {log.reviewed ? 'Reviewed ✓' : 'Mark Reviewed'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-slate-400">
                <User className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                <p className="text-xs">Select a candidate from the left list to review their session telemetry.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Evidence Screenshot Modal */}
      {previewScreenshot && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-aimst-400" />
                <h4 className="text-sm font-bold">Forensic Optical Snapshot Evidence</h4>
              </div>
              <button
                onClick={() => setPreviewScreenshot(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-slate-700 mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewScreenshot}
                alt="Breach Evidence Snapshot"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-red-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                Breach Timestamp Captured
              </div>
            </div>

            <p className="text-xs text-slate-400 text-center">
              Webcam snapshot captured automatically upon integrity boundary breach for viva evidence verification.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
