'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  ShieldAlert,
  Eye,
  EyeOff,
  Users,
  Maximize,
  Minimize,
  AlertTriangle,
  Camera,
  CheckCircle2
} from 'lucide-react';
import { detectCandidateFace, captureWebcamFrame } from '@/lib/faceRecognition';

interface ProctorMonitorProps {
  sessionId: string;
  examId: string;
  maxViolations?: number;
  onViolationOccurred?: (incident: any) => void;
  onSessionTerminated?: () => void;
}

export default function ProctorMonitor({
  sessionId,
  examId,
  maxViolations = 5,
  onViolationOccurred,
  onSessionTerminated,
}: ProctorMonitorProps) {
  const [cameraActive, setCameraActive] = useState(false);
  const [faceStatus, setFaceStatus] = useState<'normal' | 'missing' | 'multiple'>('normal');
  const [violationsCount, setViolationsCount] = useState(0);
  const [lastWarning, setLastWarning] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const missingFaceSecondsRef = useRef<number>(0);
  const isLoggingRef = useRef<boolean>(false);

  // Send incident to backend
  const logIncident = useCallback(
    async (
      incidentType: string,
      description: string,
      severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
    ) => {
      if (isLoggingRef.current) return;
      isLoggingRef.current = true;

      let screenshotUrl = '';
      if (videoRef.current) {
        screenshotUrl = captureWebcamFrame(videoRef.current);
      }

      try {
        const res = await fetch('/api/proctor/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionID: sessionId,
            incidentType,
            description,
            screenshotUrl,
            severity,
          }),
        });

        const data = await res.json();
        if (res.ok) {
          setViolationsCount(data.violationsCount);
          setLastWarning(description);

          if (onViolationOccurred) {
            onViolationOccurred(data.log);
          }

          if (data.exceededLimit && onSessionTerminated) {
            onSessionTerminated();
          }
        }
      } catch (err) {
        console.warn('Incident logging warning:', err);
      } finally {
        setTimeout(() => {
          isLoggingRef.current = false;
        }, 1500);
      }
    },
    [sessionId, onViolationOccurred, onSessionTerminated]
  );

  // Initialize webcam
  useEffect(() => {
    let active = true;

    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: 'user' },
          audio: false,
        });
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setCameraActive(true);
      } catch (err) {
        console.warn('Webcam stream fallback for proctoring:', err);
        setCameraActive(true);
      }
    }

    setupCamera();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Request fullscreen mode
  const requestFullScreen = useCallback(() => {
    try {
      const docElm = document.documentElement;
      if (docElm.requestFullscreen) {
        docElm.requestFullscreen().catch(() => {});
      }
    } catch {
      // Ignored if user blocked
    }
  }, []);

  // Browser Lockdown Listeners (Fullscreen, Visibility, Clipboard, ContextMenu)
  useEffect(() => {
    // 1. Fullscreen enforcement
    const handleFullscreenChange = () => {
      const inFull = Boolean(document.fullscreenElement);
      setIsFullscreen(inFull);

      if (!inFull) {
        logIncident(
          'fullscreen_exit',
          'Candidate exited compulsory examination full-screen mode',
          'high'
        );
      }
    };

    // 2. Tab switch / Visibility API
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        logIncident(
          'tab_switch',
          'Candidate navigated away from exam tab or minimized browser window',
          'high'
        );
      }
    };

    // 3. Window blur
    const handleWindowBlur = () => {
      logIncident(
        'tab_switch',
        'Browser window lost focus (possible background application interaction)',
        'medium'
      );
    };

    // 4. Anti-clipboard & context menu shield
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      logIncident(
        'copy_paste_attempt',
        'Candidate attempted to open right-click context menu',
        'low'
      );
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Intercept Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A, Alt+Tab, F12
      if (
        (e.ctrlKey || e.metaKey) &&
        ['c', 'v', 'x', 'a', 'p', 'u'].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
        logIncident(
          'copy_paste_attempt',
          `Unauthorized keyboard combination intercepted (Ctrl+${e.key.toUpperCase()})`,
          'medium'
        );
        return false;
      }
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault();
        logIncident(
          'copy_paste_attempt',
          'Attempted to open browser developer tools inspection panel',
          'critical'
        );
        return false;
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    // Initial fullscreen request on exam entry
    requestFullScreen();

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [logIncident, requestFullScreen]);

  // Periodic Face Detection Loop (Runs every 1.5 seconds)
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!videoRef.current) return;

      try {
        const detection = await detectCandidateFace(videoRef.current);

        if (detection.facesDetected === 0) {
          missingFaceSecondsRef.current += 1.5;
          setFaceStatus('missing');

          // Threshold: 5 seconds of absence triggers incident
          if (missingFaceSecondsRef.current >= 5) {
            logIncident(
              'face_missing',
              'Candidate absent from camera viewport for more than 5 consecutive seconds',
              'high'
            );
            missingFaceSecondsRef.current = 0; // Reset after logging
          }
        } else if (detection.facesDetected >= 2) {
          missingFaceSecondsRef.current = 0;
          setFaceStatus('multiple');
          logIncident(
            'multiple_faces',
            `Multiple faces (${detection.facesDetected}) detected in candidate examination viewport`,
            'critical'
          );
        } else {
          missingFaceSecondsRef.current = 0;
          setFaceStatus('normal');
        }
      } catch {
        // Safe keep-alive
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [logIncident]);

  return (
    <>
      {/* Floating Mini Proctoring Pip Widget */}
      <div className="fixed bottom-4 right-4 z-50 bg-slate-900/90 border border-slate-700/80 rounded-2xl p-2.5 shadow-2xl backdrop-blur-md flex flex-col items-center gap-2">
        <div className="relative w-36 h-24 rounded-xl overflow-hidden bg-black border border-slate-700">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]"
          />

          {/* Scanner beam */}
          {faceStatus === 'normal' ? (
            <div className="proctor-scan-beam"></div>
          ) : (
            <div className="proctor-alert-beam"></div>
          )}

          {/* Mini overlay icon */}
          <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[9px] font-bold text-white flex items-center gap-1">
            {faceStatus === 'normal' && (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-emerald-300">Verified</span>
              </>
            )}
            {faceStatus === 'missing' && (
              <>
                <EyeOff className="w-2.5 h-2.5 text-red-400" />
                <span className="text-red-400">No Face</span>
              </>
            )}
            {faceStatus === 'multiple' && (
              <>
                <Users className="w-2.5 h-2.5 text-amber-400" />
                <span className="text-amber-400">Multi-Face</span>
              </>
            )}
          </div>
        </div>

        {/* Violations Meter */}
        <div className="w-full flex items-center justify-between text-[10px] px-1 font-semibold">
          <span className="text-slate-400">Integrity Flags:</span>
          <span
            className={`px-1.5 py-0.5 rounded font-mono ${
              violationsCount === 0
                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                : violationsCount >= maxViolations
                ? 'bg-red-950/80 text-red-400 border border-red-800 animate-bounce'
                : 'bg-amber-950/80 text-amber-400 border border-amber-800'
            }`}
          >
            {violationsCount} / {maxViolations}
          </span>
        </div>
      </div>

      {/* Fullscreen Exit Warning Banner */}
      {!isFullscreen && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 animate-bounce" />
            <span>
              WARNING: Full-screen mode is mandatory. Exiting full-screen is being logged as an academic integrity violation.
            </span>
          </div>
          <button
            onClick={requestFullScreen}
            className="px-3 py-1 bg-white text-red-700 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors"
          >
            Re-enter Full-Screen
          </button>
        </div>
      )}

      {/* Real-time Violation Toast */}
      {lastWarning && (
        <div className="fixed top-12 right-4 z-50 max-w-sm bg-red-900/90 border border-red-500/80 text-white rounded-xl p-3 shadow-xl backdrop-blur-md text-xs flex items-start gap-2.5 animate-slideIn">
          <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-red-200">Proctoring Warning Logged</p>
            <p className="text-[11px] text-red-100 mt-0.5 leading-tight">{lastWarning}</p>
          </div>
          <button
            onClick={() => setLastWarning(null)}
            className="text-red-300 hover:text-white text-xs font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
