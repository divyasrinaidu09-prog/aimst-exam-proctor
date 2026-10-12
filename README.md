# AIMST University - Intelligent Online Exam Proctoring System
**Final Year Project (FYP) 2026 • Faculty of Allied Health & Information Technology**

A web-based online examination proctoring and anti-cheating platform developed specifically for AIMST University, featuring Word (.DOCX) document-based examination paper workflows, student self-enrollment by subject code, real-time telemetry (joined vs. not-joined candidates), and forensic proctoring incident detection.

---

## 📸 UI/UX Design Alignments

The application adheres strictly to the official AIMST University reference specifications:
- **AIMST University Branding:** University crest emblem, stylized atomic floral logo, and corporate academic typography.
- **Deep Navy Sidebar (`#0B1E38`):** Academic navigation with white and emerald accents.
- **Card-Based Academic Dashboard:** Clean white cards (`#FFFFFF`) with rounded corners (`rounded-2xl`, `rounded-3xl`) on an academic soft blue-gray background (`#F0F4F9`).
- **Student Portal Workflow (Reference Image 1):**
  1. Student Login (`/student/login`) with campus background
  2. Student Registration (`/student/register`) with email verification notice
  3. Student Dashboard (`/student/dashboard`) showing Timetable, Total Subjects (5), Upcoming Exams (2), Completed Exams (1)
  4. Available Examinations (`/student/exams`)
  5. Exam Instructions (`/student/exam/[id]/instructions`)
  6. Webcam Permission Check (`/student/exam/[id]/verify`)
  7. Face Presence Verification with green "Face Detected" badge
  8. Document-based Examination Interface (`/student/exam/[id]/session`) with red countdown timer (`01:45:32`)
  9. Anti-cheating Tab Switch Violation Popup ("Violation Detected!")
  10. Exam Submitted Successfully confirmation (`/student/exam/[id]/submitted`)
  11. Student Results & History (`/student/results`)
- **Examiner & Administrator Workflow (Reference Image 2):**
  1. Examiner / Admin Login (`/examiner/login`) with campus background and "Excellence Innovation Global Impact"
  2. Examiner Registration (`/examiner/register`) and post-registration confirmation screen
  3. Examiner Dashboard (`/examiner/dashboard`) with 4 primary action cards: Upload Exam Paper, Manage Subjects, Monitor Students, View Reports
  4. Upload Exam Paper (`/examiner/exams/upload`): Drag-and-drop Word Document (.DOCX) parser with subject selection and schedule configuration
  5. Manage Subjects (`/examiner/subjects`): Table with course code, name, exam status, and "+ Add Subject" modal
  6. Enrolled Students (`/examiner/students`): Roster of self-enrolled candidates (automatic enrollment without manual lecturer entry)
  7. Live Exam Monitoring (`/examiner/monitoring`): Joined students (green: 18), Not Joined students (red: 7), Total Enrolled (blue: 25), with real-time countdown timer ("Exam in Progress")
  8. Exam Submission Summary (`/examiner/exams`)
  9. Proctoring Incidents & Evidence Review (`/examiner/incidents/[id]`) with webcam forensic snapshot and "Mark Reviewed" button
  10. Forensic Integrity Reports (`/examiner/reports`) with CSV export and printing
  11. Grading System Suggestion Card ("Future Enhancement")

---

## 🛠 Technology Stack

- **Frontend Framework:** Next.js 15 (React 19, App Router)
- **Language:** TypeScript 5 (Strict Mode)
- **Styling:** Tailwind CSS with custom AIMST academic color palette
- **Iconography:** Lucide React icons
- **Word Document Parsing:** `mammoth` (Server-side DOCX text extraction, HTML converter, and structured question parser)
- **Database:** Supabase PostgreSQL (Relational schema with foreign keys, triggers, and Row Level Security)
- **Authentication:** Supabase Auth (Email + password, ID number verification, secure sessions)
- **Storage:** Supabase Storage (`exam-documents` and `incident-evidence` private buckets)
- **Realtime Telemetry:** Supabase Realtime for live monitoring and incident logging
- **Deployment:** Vercel (Optimized for edge and serverless functions)

---

## 🗄 Relational Database Schema (`supabase/schema.sql`)

The database is built on PostgreSQL with foreign keys and Row Level Security (RLS) policies:

1. `profiles`: Candidate and lecturer user records (`id`, `auth_user_id`, `full_name`, `id_number`, `email`, `role`, `avatar_url`)
2. `subjects`: Academic subjects (`id`, `subject_code`, `subject_name`, `description`, `created_by`)
3. `subject_enrollments`: Student self-enrollment table (`id`, `student_id`, `subject_id`, `enrolled_at`, `status`)
4. `exams`: Scheduled examination instances (`id`, `subject_id`, `title`, `exam_date`, `start_time`, `duration_minutes`, `status`)
5. `exam_documents`: Uploaded Word papers (`id`, `exam_id`, `storage_path`, `original_filename`, `file_size`, `extracted_text`, `parsed_questions`)
6. `exam_sessions`: Live student examination sittings (`id`, `exam_id`, `student_id`, `started_at`, `status`, `last_activity_at`)
7. `exam_submissions`: Submitted examination papers and answers (`id`, `exam_id`, `student_id`, `submitted_at`, `answers`, `status`)
8. `proctoring_incidents`: Automated anti-cheating alerts (`id`, `exam_id`, `student_id`, `incident_type`, `severity`, `timestamp`, `description`, `evidence_path`, `review_status`)
9. `audit_logs`: Administrative actions and access trail

---

## 🚀 Quick Local Setup & Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Production Build Validation
```bash
npm run build
npm start
```

---

## 🔑 Pre-Seeded Academic Demo Accounts

| Role | Name | ID / Identifier | Email | Password |
|---|---|---|---|---|
| **Examiner / Lecturer** | Dr. Ahmad | `88012` | `ahmad@aimst.edu.my` | `AimstExaminer2026!` |
| **Student Candidate** | Divyasri Vijaya Kumaran | `B21010123` | `divyasri@aimst.edu.my` | `AimstStudent2026!` |
| **Candidate 2** | Tan Wei Leng | `B21010124` | `tanweiling@aimst.edu.my` | `AimstStudent2026!` |

*(Both login portals also provide convenient 1-Click Auto-Fill buttons for effortless viva demonstrations.)*

---

## 🌐 Deploying to Vercel (Production)

### STEP 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Choose your region (e.g. Singapore `ap-southeast-1` for Malaysia/AIMST).

### STEP 2: Run Database Migrations
1. Open the **SQL Editor** in your Supabase project dashboard.
2. Copy the full contents of `supabase/schema.sql` from this repository.
3. Paste and click **Run**. This creates all 9 tables, indexes, RLS policies, storage buckets, and initial pre-seeded records.

### STEP 3: Configure Supabase Storage
1. Navigate to **Storage** in your Supabase dashboard.
2. Ensure two private buckets are created:
   - `exam-documents`
   - `incident-evidence`

### STEP 4: Configure Supabase Authentication
1. Go to **Authentication** > **URL Configuration**.
2. Set **Site URL** to your local or Vercel URL.
3. Add redirect URLs for `/auth/callback`.

### STEP 5: Enable Supabase Realtime
1. Go to **Database** > **Replication**.
2. Verify that `exam_sessions` and `proctoring_incidents` tables have Realtime enabled.

### STEP 6: Push Project to GitHub
```bash
git init
git add .
git commit -m "feat: AIMST Online Exam Proctoring System complete functional release"
git remote add origin https://github.com/your-username/aimst-exam-proctor.git
git branch -M main
git push -u origin main
```

### STEP 7: Import Project into Vercel
1. Log in to [vercel.com](https://vercel.com).
2. Click **Add New** > **Project**.
3. Import your GitHub repository.
4. Framework Preset will automatically detect **Next.js**.

### STEP 8: Configure Environment Variables in Vercel
In **Project Settings** > **Environment Variables**, add:
- `NEXT_PUBLIC_SUPABASE_URL` = `https://your-project-id.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `your-supabase-anon-key`
- `SUPABASE_SERVICE_ROLE_KEY` = `your-supabase-service-role-key`
- `NEXT_PUBLIC_APP_URL` = `https://your-project.vercel.app`

### STEP 9: Deploy
Click **Deploy**. Vercel will run the production build and generate your live deployment URL:
`https://your-project-name.vercel.app`

### Deploy via Vercel CLI (Alternative):
```bash
npm install -g vercel
vercel login
vercel link
vercel env pull
vercel --prod
```

---

## 🔒 Security & Anti-Cheating Architecture

1. **Client-Side Integrity Monitoring:**
   - Detects tab switching via HTML5 Page Visibility API.
   - Detects browser window blur and lost focus.
   - Records high-resolution webcam snapshots as forensic evidence.
2. **Document Protection:**
   - Private storage buckets prevent unauthorized public downloads of uploaded .docx exam papers.
   - Prevents copy-paste and text selection during active exam sessions via `.exam-anti-copy` styles.
3. **Student Self-Enrollment Validation:**
   - Students self-enroll via unique subject code (`BIMS13108`).
   - Prevents duplicate enrollments and rejects invalid course codes.
4. **Honest Proctoring Labeling:**
   - Face presence verification is labeled as **"Face Presence Verification"** rather than claiming 100% biometric matching, maintaining scientific transparency for FYP academic defense.
5. **Grading Module Roadmap:**
   - Automated grading is presented as a clearly labeled **"Grading System (Suggestion) / Future Enhancement"** card in accordance with viva evaluation guidelines.
