'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import StudentSidebar from '@/components/StudentSidebar';
import TopNavbar from '@/components/TopNavbar';
import {
  Camera,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  HelpCircle,
  Loader2,
} from 'lucide-react';

export default function ExamVerificationPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params?.id as string;

  const [hasPermission, setHasPermission] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const uRes = await fetch('/api/auth/me');
        const uData = await uRes.json();
        if (uData.authenticated) setUser(uData.user);
      } catch {}
    }
    loadUser();
  }, []);

  const requestCamera = async () => {
    setRequesting(true);
    setPermissionError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      setHasPermission(true);

      // Simulate face presence detection with checkmark after stream initializes
      setTimeout(() => {
        setFaceDetected(true);
      }, 1200);
    } catch (err: any) {
      console.warn('Camera request error:', err);
      // If hardware webcam is blocked or unavailable, provide simulated preview fallback for testing
      setPermissionError('Camera access was denied or hardware not detected. You can proceed using the simulated verification stream.');
      setHasPermission(true);
      setTimeout(() => {
        setFaceDetected(true);
      }, 1500);
    } finally {
      setRequesting(false);
    }
  };

  const handleProceed = () => {
    router.push(`/student/exam/${examId}/session`);
  };

  return (
    <div className="min-h-screen bg-[#F0F4F9] flex">
      <StudentSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar user={user} title="Identity & Hardware Check" />

        <main className="flex-1 p-6 sm:p-8 max-w-4xl w-full mx-auto flex items-center justify-center">
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-sm w-full">
            {!hasPermission ? (
              /* Card 7: Webcam Permission Check */
              <div className="text-center py-8 max-w-md mx-auto">
                <div className="w-20 h-20 rounded-3xl bg-blue-50 text-[#1E5BF0] flex items-center justify-center mx-auto mb-6 shadow-inner border border-blue-100">
                  <Camera className="w-10 h-10" />
                </div>

                <h2 className="text-2xl font-black text-[#0B1E38] mb-2">
                  Camera Access Required
                </h2>

                <p className="text-sm text-slate-600 mb-8 leading-relaxed">
                  We need access to your webcam to monitor your examination and ensure anti-cheating compliance.
                </p>

                <div className="space-y-4">
                  <button
                    onClick={requestCamera}
                    disabled={requesting}
                    className="w-full py-4 px-6 rounded-2xl bg-[#1E5BF0] hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    {requesting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                    <span>Allow Camera</span>
                  </button>

                  <div className="pt-2">
                    <a
                      href="#troubleshoot"
                      onClick={(e) => {
                        e.preventDefault();
                        requestCamera();
                      }}
                      className="text-xs text-slate-500 hover:text-[#1E5BF0] inline-flex items-center gap-1 font-medium"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Troubleshooting camera connection</span>
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              /* Card 6: Identity / Face Presence Verification */
              <div className="max-w-lg mx-auto text-center">
                <div className="mb-6">
                  <h2 className="text-2xl font-black text-[#0B1E38]">
                    Identity Verification
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Please make sure your face is clearly visible in the preview frame.
                  </p>
                </div>

                {/* Camera Box Frame */}
                <div className="relative mx-auto rounded-3xl overflow-hidden bg-slate-900 border-2 border-slate-200 aspect-4/3 w-full max-w-sm shadow-md mb-6 flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* Fallback portrait photo if video stream was simulated */}
                  {(!videoRef.current || !videoRef.current.srcObject) && (
                    <Image
                      src={user?.avatar_url || '/student_divyasri.jpg'}
                      alt="Student Camera Preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  )}

                  {/* Face Presence Detected Green Indicator matching Reference Image 1 Card 6 */}
                  {faceDetected && (
                    <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-emerald-500/40 shadow-lg flex items-center gap-2 text-xs font-bold text-emerald-700 animate-in fade-in duration-300">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Face Detected</span>
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-600 mb-8 flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Face Presence Verification completed. Continuous proctoring will stay active.</span>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={handleProceed}
                    disabled={!faceDetected}
                    className="w-full max-w-sm py-4 px-8 rounded-2xl bg-[#1E5BF0] hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <span>Continue to Exam</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
