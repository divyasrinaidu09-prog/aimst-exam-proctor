import Link from 'next/link';
import Image from 'next/image';
import AimstLogo from '@/components/AimstLogo';
import {
  GraduationCap,
  UserCheck,
  ShieldCheck,
  Eye,
  FileText,
  Lock,
  ArrowRight,
  School,
  Sparkles,
  BookOpen,
  Activity,
  CheckCircle2,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F0F4F9]">
      {/* Top Academic Header */}
      <header className="h-20 bg-white border-b border-slate-200 px-6 sm:px-12 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <AimstLogo variant="dark" size="md" href="/" />

        <div className="flex items-center gap-3">
          <Link
            href="/student/login"
            className="px-4 py-2.5 rounded-xl border border-slate-300 hover:border-[#1E5BF0] text-slate-700 hover:text-[#1E5BF0] text-xs font-bold transition-all"
          >
            Student Login
          </Link>
          <Link
            href="/examiner/login"
            className="px-5 py-2.5 rounded-xl bg-[#1E5BF0] hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
          >
            Examiner / Admin
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden bg-[#0B1E38] text-white py-20 px-4 sm:px-6 lg:px-8">
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#1E5BF0] rounded-full blur-[120px]"></div>
            <div className="absolute top-1/2 -right-32 w-96 h-96 bg-emerald-500 rounded-full blur-[120px]"></div>
          </div>

          <div className="max-w-5xl mx-auto relative z-10 text-center">
            {/* University Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-emerald-400 text-xs font-semibold mb-6 backdrop-blur-md">
              <School className="w-4 h-4 text-emerald-400" />
              <span>AIMST University • Online Examination & Proctoring Platform</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-6 leading-tight">
              Online Exam Proctoring System <br />
              <span className="text-[#1E5BF0]">
                & Telemetry Monitoring
              </span>
            </h1>

            <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-300 mb-10 leading-relaxed">
              Official AIMST academic evaluation portal with Word (.DOCX) document-based examination workflows, continuous webcam presence verification, and automated proctoring telemetry.
            </p>

            {/* Quick 1-Click Role Portals */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto mb-10">
              {/* Student Portal Card */}
              <Link
                href="/student/login"
                className="group p-6 rounded-3xl bg-white/10 hover:bg-white/15 border border-white/20 hover:border-[#1E5BF0] transition-all text-left backdrop-blur-md shadow-lg"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                  Student Candidate Portal
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Access enrolled exams, webcam face verification, and document-based answering interface.
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-blue-400">
                  <span>Enter as Student (Divyasri)</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* Examiner Portal Card */}
              <Link
                href="/examiner/login"
                className="group p-6 rounded-3xl bg-white/10 hover:bg-white/15 border border-white/20 hover:border-emerald-400 transition-all text-left backdrop-blur-md shadow-lg"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                  Examiner / Admin Portal
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Upload Word .DOCX papers, manage subjects, monitor joined/not-joined candidates live.
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <span>Enter as Examiner (Dr. Ahmad)</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* System Features Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1E5BF0] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Core FYP Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B1E38] mt-3">
              Comprehensive Examination Architecture
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1E5BF0] flex items-center justify-center mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Word .DOCX Exam Upload</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Examiners upload Word documents without manually retyping questions. Automated parsing extracts questions and stores originals in secure private storage.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Joined & Non-Joined Telemetry</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Live monitoring dashboard distinguishes who has joined vs. who has not joined among enrolled students, with real-time participation counters.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Anti-Cheating Telemetry</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Client-side tab switch detection, browser blur tracking, and webcam snapshot evidence collection for objective faculty review.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 px-6 text-center text-xs text-slate-500">
        <p className="font-semibold text-slate-700">
          AIMST University • Online Exam Proctoring System
        </p>
        <p className="mt-1">
          Final Year Project (FYP) 2026 • Designed according to official academic references.
        </p>
      </footer>
    </div>
  );
}
