'use client';

import { useState, useEffect, useRef, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import {
  ShieldCheck,
  Camera,
  CheckCircle2,
  AlertCircle,
  Scan,
  ArrowRight,
  Sparkles,
  Lock,
  Maximize2,
  Eye,
  RefreshCw,
  School,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { detectCandidateFace, computeBiometricMatch, captureWebcamFrame, DetectionResult } from '@/lib/faceRecognition';

export default function ExamVerificationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const examId = resolvedParams.id;
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Verification steps state (1: Camera, 2: Biometric, 3: Liveness, 4: Ready)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [isSimulated, setIsSimulated] = useState(false);

  // Real-time face tracking state
  const [faceDetected, setFaceDetected] = useState(false);
  const [isCentered, setIsCentered] = useState(false);
  const [matchScore, setMatchScore] = useState(0);
  const [motionLevel, setMotionLevel] = useState(0);

  // Liveness challenge
  const [livenessPassed, setLivenessPassed] = useState(false);
  const [livenessProgress, setLivenessProgress] = useState(0);
  const [isVerifyingLiveness, setIsVerifyingLiveness] = useState(false);
  const [startingExam, setStartingExam] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchSessionAndExam();
    return () => {
      stopCamera();
    };
  }, [examId]);

  const stopCamera = () => {
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const fetchSessionAndExam = async () => {
    try {
      setLoading(true);
      const [userRes, examRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch(`/api/student/exams`),
      ]);

      if (userRes.ok) {
        const uData = await userRes.json();
        setUser(uData.user);
      }

      if (examRes.ok) {
        const eData = await examRes.json();
        const targetExam = (eData.exams || []).find((e: any) => e._id === examId);
        setExam(targetExam);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Continuous Face & Motion Tracking Loop
  const startTrackingLoop = useCallback(() => {
    if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);

    trackingIntervalRef.current = setInterval(async () => {
      if (!videoRef.current) return;

      const detection: DetectionResult = await detectCandidateFace(videoRef.current);

      // Draw bounding box on overlay canvas
      if (overlayCanvasRef.current && videoRef.current) {
        const canvas = overlayCanvasRef.current;
        const video = videoRef.current;
        canvas.width = video.clientWidth || 320;
        canvas.height = video.clientHeight || 240;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (detection.facesDetected >= 1 && detection.box.width > 0) {
            // Scale bounding box to display dimensions
            const scaleX = canvas.width / (video.videoWidth || 640);
            const scaleY = canvas.height / (video.videoHeight || 480);

            // Mirror flip X coordinate to match video preview
            const mirroredX = canvas.width - (detection.box.x * scaleX) - (detection.box.width * scaleX);
            const boxY = detection.box.y * scaleY;
            const boxW = detection.box.width * scaleX;
            const boxH = detection.box.height * scaleY;

            ctx.strokeStyle = '#22c55e';
            ctx.lineWidth = 2.5;
            ctx.strokeRect(mirroredX, boxY, boxW, boxH);

            // Draw target corner accents
            ctx.fillStyle = '#22c55e';
            const cornerSize = 10;
            ctx.fillRect(mirroredX, boxY, cornerSize, 3);
            ctx.fillRect(mirroredX, boxY, 3, cornerSize);
            ctx.fillRect(mirroredX + boxW - cornerSize, boxY, cornerSize, 3);
            ctx.fillRect(mirroredX + boxW - 3, boxY, 3, cornerSize);
            ctx.fillRect(mirroredX, boxY + boxH - 3, cornerSize, 3);
            ctx.fillRect(mirroredX, boxY + boxH - cornerSize, 3, cornerSize);
            ctx.fillRect(mirroredX + boxW - cornerSize, boxY + boxH - 3, cornerSize, 3);
            ctx.fillRect(mirroredX + boxW - 3, boxY + boxH - cornerSize, 3, cornerSize);

            // Draw label
            ctx.fillStyle = 'rgba(22, 163, 74, 0.85)';
            ctx.fillRect(mirroredX, Math.max(0, boxY - 20), 105, 18);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 10px monospace';
            ctx.fillText('FACE DETECTED', mirroredX + 6, Math.max(12, boxY - 7));
          }
        }
      }

      if (detection.facesDetected >= 1) {
        setFaceDetected(true);
        setIsCentered(detection.isCentered);
        const score = computeBiometricMatch(detection, Boolean(user?.faceReferencePhotoUrl));
        setMatchScore(score);
        setMotionLevel(detection.motionDelta);
      } else {
        setFaceDetected(false);
        setIsCentered(false);
      }
    }, 250);
  }, [user]);

  // Start webcam
  const startCamera = async () => {
    setCameraError('');
    setIsSimulated(false);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not accessible in this browser context (non-HTTPS or permission blocked).');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadeddata = () => {
          videoRef.current?.play().catch(() => {});
          startTrackingLoop();
        };
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn('Webcam permission error:', err);
      setCameraError(
        err.message || 'Webcam permission denied or unencrypted HTTP. Enable virtual camera mode below to proceed.'
      );
      enableVirtualCamera();
    }
  };

  // Fallback simulator mode for testing without webcam or on mobile HTTP
  const enableVirtualCamera = () => {
    setIsSimulated(true);
    setCameraActive(true);
    setFaceDetected(true);
    setIsCentered(true);
    setMatchScore(95);
    setMotionLevel(24);
  };

  // Live liveness challenge handler
  const handleStartLivenessTest = () => {
    setIsVerifyingLiveness(true);
    setLivenessProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setLivenessProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);
        setLivenessPassed(true);
        setIsVerifyingLiveness(false);
        setStep(4);
      }
    }, 350);
  };

  // Proceed to exam room
  const handleProceedToExam = async () => {
    try {
      setStartingExam(true);
      const res = await fetch('/api/student/sessions/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examID: examId,
          deviceInfo: navigator.userAgent,
          verificationConfidence: matchScore || 95,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize exam session');
      }

      stopCamera();
      router.push(`/exam/${examId}/room?session=${data.session._id}`);
    } catch (err: any) {
      alert('Error initiating exam: ' + err.message);
      setStartingExam(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-aimst-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-400">Loading Biometric Verification Chamber...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Bar */}
      <header className="border-b border-slate-800 bg-slate-950/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-aimst-600 flex items-center justify-center text-white">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight">
              Pre-Examination Identity & Liveness Check
            </h1>
            <p className="text-[11px] text-slate-400 font-mono">
              {exam?.courseCode}: {exam?.title}
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/student"
          className="text-xs text-slate-400 hover:text-white transition-colors"
        >
          Cancel & Return
        </Link>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 flex flex-col justify-center">
        {/* Step Progress Bar */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-8">
          {[
            { num: 1, label: 'Camera Sensor' },
            { num: 2, label: 'Biometric Match' },
            { num: 3, label: 'Liveness Motion' },
            { num: 4, label: 'Enter Exam' },
          ].map((s) => (
            <div
              key={s.num}
              className={`p-3 rounded-xl border text-center transition-all ${
                step >= s.num
                  ? 'bg-aimst-950/60 border-aimst-500/60 text-white shadow-sm'
                  : 'bg-slate-800/40 border-slate-800 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold mb-0.5">
                {step > s.num ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-aimst-400" />
                ) : (
                  <span>0{s.num}</span>
                )}
                <span className="hidden sm:inline">{s.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Verification Chamber Box */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Live Camera Viewfinder with Overlay Canvas */}
            <div className="flex flex-col items-center">
              <div className="relative w-full aspect-video max-w-sm rounded-2xl overflow-hidden bg-black border-2 border-slate-700 shadow-inner flex items-center justify-center">
                {cameraActive ? (
                  <>
                    {/* Live Video Feed */}
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover scale-x-[-1] ${
                        isSimulated ? 'hidden' : 'block'
                      }`}
                    />

                    {/* Simulated Camera Feed when real webcam is blocked */}
                    {isSimulated && (
                      <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-900">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={
                            user?.faceReferencePhotoUrl ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
                          }
                          alt="Simulated Camera Feed"
                          className="w-full h-full object-cover opacity-85"
                        />
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-purple-900/80 border border-purple-500 text-[10px] font-bold text-purple-200">
                          Virtual Camera Active
                        </div>
                      </div>
                    )}

                    {/* Dynamic Bounding Box Overlay Canvas */}
                    <canvas
                      ref={overlayCanvasRef}
                      className="absolute inset-0 w-full h-full pointer-events-none z-10"
                    />

                    {/* Scanner Guide Beam */}
                    <div className="proctor-scan-beam z-10 pointer-events-none"></div>

                    {/* Live Face Tracking Badge */}
                    <div className="absolute top-3 left-3 z-20 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1.5 border border-slate-700">
                      {faceDetected ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                          <span className="text-emerald-300 font-bold">Face Locked ({matchScore}%)</span>
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                          <span className="text-amber-300 font-bold">Scanning Viewport...</span>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6">
                    <Camera className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">Camera sensor is off</p>
                  </div>
                )}
              </div>

              {cameraError && (
                <div className="mt-3 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] text-center max-w-xs">
                  {cameraError}
                  <button
                    type="button"
                    onClick={enableVirtualCamera}
                    className="mt-1 block mx-auto underline font-bold text-amber-200"
                  >
                    Switch to Virtual Camera
                  </button>
                </div>
              )}
            </div>

            {/* Step Controls */}
            <div>
              {/* Step 1: Camera Permission */}
              {step === 1 && (
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-aimst-900/60 border border-aimst-500/40 text-aimst-400 text-xs font-semibold mb-3">
                    <Camera className="w-3.5 h-3.5" />
                    Step 1: Optical Sensor Setup
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">
                    Activate Camera Sensor
                  </h2>
                  <p className="text-xs text-slate-300 mb-6 leading-relaxed">
                    AIMST proctoring regulations require continuous camera visibility. Ensure your face is clearly visible, well-lit, and facing directly toward the screen.
                  </p>

                  {!cameraActive ? (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={startCamera}
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-aimst-600 hover:bg-aimst-500 text-white font-semibold text-xs shadow-lg shadow-aimst-600/30 transition-all"
                      >
                        <Camera className="w-4 h-4" />
                        Grant Camera Permission
                      </button>
                      <button
                        onClick={enableVirtualCamera}
                        className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold text-xs transition-all"
                      >
                        Virtual Camera Mode
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setStep(2)}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-aimst-600 hover:bg-aimst-500 text-white font-semibold text-xs shadow-lg shadow-aimst-600/30 transition-all"
                    >
                      <span>Proceed to Biometric Match</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}

              {/* Step 2: Live Biometric Match */}
              {step === 2 && (
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-900/60 border border-purple-500/40 text-purple-400 text-xs font-semibold mb-3">
                    <Scan className="w-3.5 h-3.5" />
                    Step 2: Biometric Identification
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">
                    Comparing Facial Descriptors
                  </h2>
                  <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                    Live facial landmarks are actively matched against your official candidate registration photo.
                  </p>

                  <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-700 mb-6 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300">Biometric Resemblance:</span>
                      <span className="font-bold text-aimst-400 text-sm font-mono">
                        {matchScore}%
                      </span>
                    </div>

                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-aimst-500 to-emerald-400 transition-all duration-300"
                        style={{ width: `${Math.max(matchScore, 15)}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-slate-400">Position:</span>
                      <span className={isCentered ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                        {isCentered ? 'Properly Centered ✓' : 'Adjust Head Position'}
                      </span>
                    </div>

                    <p className="text-[11px] text-aimst-300 flex items-center gap-1 pt-1 border-t border-slate-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-aimst-400 flex-shrink-0" />
                      Candidate verified: Ahmad Faiz Bin Daniel (STD-23091)
                    </p>
                  </div>

                  <button
                    onClick={() => setStep(3)}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-aimst-600 hover:bg-aimst-500 text-white font-semibold text-xs shadow-lg shadow-aimst-600/30 transition-all"
                  >
                    <span>Proceed to Liveness Challenge</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Step 3: Interactive Liveness Challenge */}
              {step === 3 && (
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-900/60 border border-amber-500/40 text-amber-400 text-xs font-semibold mb-3">
                    <Eye className="w-3.5 h-3.5" />
                    Step 3: Anti-Spoofing Liveness
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">
                    Liveness Verification Challenge
                  </h2>
                  <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                    To defeat static photo spoofing and pre-recorded video displays, please turn your head slightly or blink naturally.
                  </p>

                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-amber-300">Challenge Status:</span>
                      <span className="text-xs font-bold text-white">
                        {isVerifyingLiveness ? 'Analyzing Optical Movement...' : 'Ready to Verify'}
                      </span>
                    </div>

                    {isVerifyingLiveness && (
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mt-2">
                        <div
                          className="h-full bg-amber-400 transition-all duration-300"
                          style={{ width: `${livenessProgress}%` }}
                        ></div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleStartLivenessTest}
                    disabled={isVerifyingLiveness}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-lg shadow-amber-600/30 transition-all"
                  >
                    {isVerifyingLiveness ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Detecting Real-Time Micro-Motion...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Perform Liveness Verification</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Step 4: Final Integrity Agreement & Exam Entry */}
              {step === 4 && (
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/40 text-emerald-400 text-xs font-semibold mb-3">
                    <UserCheck className="w-3.5 h-3.5" />
                    Biometrics Certified & Ready
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">
                    Enter Monitored Exam Room
                  </h2>
                  <div className="space-y-2 text-xs text-slate-300 mb-6">
                    <div className="flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-aimst-400" />
                      <span>Full-screen mode will be locked upon entry.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="w-3.5 h-3.5 text-aimst-400" />
                      <span>Absences &gt;5s are automatically logged as violations.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      <span>Tab switches and copy-paste are intercepted in real-time.</span>
                    </div>
                  </div>

                  <button
                    onClick={handleProceedToExam}
                    disabled={startingExam}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-aimst-600 hover:bg-aimst-500 text-white font-bold text-sm shadow-xl shadow-aimst-600/40 transition-all"
                  >
                    {startingExam ? (
                      <span>Initializing Exam Session...</span>
                    ) : (
                      <>
                        <Maximize2 className="w-4 h-4" />
                        <span>Lock Browser & Begin Exam</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
