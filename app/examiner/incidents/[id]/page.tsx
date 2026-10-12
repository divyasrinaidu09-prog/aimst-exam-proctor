'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import ExaminerSidebar from '@/components/ExaminerSidebar';
import TopNavbar from '@/components/TopNavbar';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  ArrowLeft,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  Loader2,
} from 'lucide-react';

export default function IncidentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const incidentId = params?.id as string;

  const [incident, setIncident] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function loadIncident() {
      try {
        const uRes = await fetch('/api/auth/me');
        const uData = await uRes.json();
        if (uData.authenticated) setUser(uData.user);

        const res = await fetch(`/api/incidents/${incidentId}`);
        const data = await res.json();
        if (data.success && data.incident) {
          setIncident(data.incident);
        }
      } catch (err) {
        console.error('Failed to load incident:', err);
      } finally {
        setLoading(false);
      }
    }
    loadIncident();
  }, [incidentId]);

  const handleMarkReviewed = async () => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/incidents/${incidentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewer_id: user?.id }),
      });
      const data = await res.json();
      if (data.success && data.incident) {
        setIncident(data.incident);
      }
    } catch (err) {
      console.error('Error marking reviewed:', err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F4F9] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 font-semibold">
          <Loader2 className="w-6 h-6 animate-spin text-[#1E5BF0]" />
          <span>Loading incident evidence...</span>
        </div>
      </div>
    );
  }

  const candidateName = incident?.student?.full_name || 'Tan Wei Leng';
  const candidateId = incident?.student?.id_number || 'B21010123';
  const incidentType = incident?.incident_type || 'Tab Switch';
  const description = incident?.description || 'Candidate switched to another browser tab.';
  const timestamp = incident?.timestamp ? new Date(incident.timestamp) : new Date();
  const timeStr = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = timestamp.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const isReviewed = incident?.review_status === 'reviewed';

  return (
    <div className="min-h-screen bg-[#F0F4F9] flex">
      <ExaminerSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar user={user} title="Forensic Incident Details" />

        <main className="flex-1 p-6 sm:p-8 max-w-5xl w-full mx-auto space-y-6">
          <div className="mb-2">
            <Link
              href="/examiner/incidents"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E5BF0] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Incidents</span>
            </Link>
          </div>

          {/* Incident Details Card matching Reference Image 1 Card 21 */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm">
            <div className="border-b border-slate-100 pb-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-[#0B1E38]">
                  Incident Evidence & Audit Trail
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Automated security trigger logged during active proctoring session.
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-bold self-start sm:self-auto ${
                  isReviewed
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {isReviewed ? 'Reviewed by Faculty' : 'Pending Review'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Candidate Camera Snapshot Evidence matching Card 21 */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Incident Evidence
                </h3>

                <div className="relative rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-300 aspect-4/3 shadow-sm mb-4">
                  <Image
                    src={incident?.evidence_path || '/incident_snapshot_sample.jpg'}
                    alt="Proctoring Incident Snapshot"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute top-2 left-2 bg-black/70 text-white font-mono text-[10px] px-2 py-0.5 rounded">
                    TIMESTAMP: {timeStr}
                  </div>
                </div>

                <button
                  onClick={() => alert('Downloading high-resolution forensic snapshot.')}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Evidence Snapshot</span>
                </button>
              </div>

              {/* Right Column: Event Details matching Reference Image 1 Card 21 */}
              <div className="space-y-5 md:border-l md:border-slate-100 md:pl-8 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">
                    Event Details
                  </h3>

                  <div className="space-y-4 text-sm">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Candidate
                      </span>
                      <p className="font-bold text-slate-900">{candidateName}</p>
                      <p className="text-xs font-mono text-slate-500">Student ID: {candidateId}</p>
                    </div>

                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Incident Type
                      </span>
                      <p className="font-black text-slate-900 text-base">{incidentType}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                          Time
                        </span>
                        <p className="font-mono text-slate-800 font-semibold">{timeStr}</p>
                      </div>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                          Date
                        </span>
                        <p className="text-slate-800 font-semibold">{dateStr}</p>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Description
                      </span>
                      <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                        {description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mark Reviewed Action Button matching Card 21 */}
                <div className="pt-4 border-t border-slate-100">
                  <button
                    onClick={handleMarkReviewed}
                    disabled={isReviewed || updating}
                    className="w-full py-3.5 px-6 rounded-xl bg-[#1E5BF0] hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
                  >
                    {updating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isReviewed ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                        <span>Incident Reviewed</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Mark Reviewed</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
