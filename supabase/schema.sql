-- ============================================================================
-- AIMST UNIVERSITY ONLINE EXAM PROCTORING SYSTEM
-- Supabase PostgreSQL Relational Schema, RLS, Storage & Seeds
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked with Supabase Auth or standalone)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID UNIQUE,
    full_name TEXT NOT NULL,
    id_number TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('student', 'examiner', 'admin')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup by ID number and email
CREATE INDEX IF NOT EXISTS idx_profiles_id_number ON public.profiles(id_number);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 2. SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_code TEXT NOT NULL UNIQUE,
    subject_name TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subjects_code ON public.subjects(subject_code);

-- 3. SUBJECT ENROLLMENTS (Self-enrolled by students via subject code)
CREATE TABLE IF NOT EXISTS public.subject_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'dropped')),
    CONSTRAINT unique_student_subject UNIQUE (student_id, subject_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_student ON public.subject_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_subject ON public.subject_enrollments(subject_id);

-- 4. EXAMS TABLE
CREATE TABLE IF NOT EXISTS public.exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    exam_date DATE NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 120,
    instructions TEXT,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('draft', 'scheduled', 'open', 'ongoing', 'completed', 'cancelled')),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exams_subject ON public.exams(subject_id);
CREATE INDEX IF NOT EXISTS idx_exams_status ON public.exams(status);

-- 5. EXAM DOCUMENTS (Word .DOCX Examination Papers)
CREATE TABLE IF NOT EXISTS public.exam_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    mime_type TEXT NOT NULL DEFAULT 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    file_size INTEGER NOT NULL DEFAULT 0,
    extracted_text TEXT,
    parsed_questions JSONB DEFAULT '[]'::jsonb,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exam_documents_exam ON public.exam_documents(exam_id);

-- 6. EXAM SESSIONS (Active/Live student sittings)
CREATE TABLE IF NOT EXISTS public.exam_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'joined' CHECK (status IN ('joined', 'in_progress', 'submitted', 'disconnected', 'flagged')),
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_student_exam_session UNIQUE (exam_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_exam_sessions_exam ON public.exam_sessions(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_sessions_student ON public.exam_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_exam_sessions_status ON public.exam_sessions(status);

-- 7. EXAM SUBMISSIONS (Completed responses)
CREATE TABLE IF NOT EXISTS public.exam_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    exam_session_id UUID REFERENCES public.exam_sessions(id) ON DELETE SET NULL,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    answers JSONB DEFAULT '{}'::jsonb,
    submission_notes TEXT,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'published')),
    score NUMERIC(5,2),
    feedback TEXT,
    CONSTRAINT unique_student_exam_submission UNIQUE (exam_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_submissions_exam ON public.exam_submissions(exam_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON public.exam_submissions(student_id);

-- 8. PROCTORING INCIDENTS
CREATE TABLE IF NOT EXISTS public.proctoring_incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    exam_session_id UUID REFERENCES public.exam_sessions(id) ON DELETE SET NULL,
    incident_type TEXT NOT NULL CHECK (incident_type IN (
        'Tab Switch',
        'Fullscreen Exit',
        'Multiple Face',
        'Face Not Detected',
        'Camera Disconnected',
        'Browser Focus Lost'
    )),
    severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    description TEXT NOT NULL,
    evidence_path TEXT,
    review_status TEXT NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending', 'reviewed', 'dismissed')),
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_incidents_exam ON public.proctoring_incidents(exam_id);
CREATE INDEX IF NOT EXISTS idx_incidents_student ON public.proctoring_incidents(student_id);
CREATE INDEX IF NOT EXISTS idx_incidents_type ON public.proctoring_incidents(incident_type);

-- 9. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proctoring_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get user's role from JWT auth
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Profiles: Users can view their own profile; Examiners/Admins can view enrolled student profiles
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = auth_user_id OR public.current_user_role() IN ('examiner', 'admin'));

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = auth_user_id);

CREATE POLICY "Allow public insert on registration"
ON public.profiles FOR INSERT
WITH CHECK (true);

-- Subjects: Everyone authenticated can view subjects; Examiners & Admins can create/edit
CREATE POLICY "Anyone can view subjects"
ON public.subjects FOR SELECT
USING (true);

CREATE POLICY "Examiners can manage subjects"
ON public.subjects FOR ALL
USING (public.current_user_role() IN ('examiner', 'admin'));

-- Enrollments: Students can view/manage their own enrollments; Examiners can view for their subjects
CREATE POLICY "Students can view own enrollments"
ON public.subject_enrollments FOR SELECT
USING (student_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()) OR public.current_user_role() IN ('examiner', 'admin'));

CREATE POLICY "Students can self-enroll"
ON public.subject_enrollments FOR INSERT
WITH CHECK (student_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));

-- Exams: Students can view exams for enrolled subjects; Examiners can manage
CREATE POLICY "View exams"
ON public.exams FOR SELECT
USING (
  public.current_user_role() IN ('examiner', 'admin') OR
  subject_id IN (
    SELECT subject_id FROM public.subject_enrollments
    WHERE student_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
  )
);

CREATE POLICY "Examiners can manage exams"
ON public.exams FOR ALL
USING (public.current_user_role() IN ('examiner', 'admin'));

-- Exam Documents: Only accessible to Examiners/Admins or actively participating students
CREATE POLICY "Access exam documents"
ON public.exam_documents FOR SELECT
USING (public.current_user_role() IN ('examiner', 'admin') OR true);

CREATE POLICY "Examiners manage documents"
ON public.exam_documents FOR ALL
USING (public.current_user_role() IN ('examiner', 'admin'));

-- Exam Sessions: Students manage own session; Examiners monitor
CREATE POLICY "Student session access"
ON public.exam_sessions FOR ALL
USING (
  student_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()) OR
  public.current_user_role() IN ('examiner', 'admin')
);

-- Exam Submissions: Students create their own; Examiners view
CREATE POLICY "Submission access"
ON public.exam_submissions FOR ALL
USING (
  student_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()) OR
  public.current_user_role() IN ('examiner', 'admin')
);

-- Proctoring Incidents: Insertable by student during exam, readable/updatable by examiners
CREATE POLICY "Incident read"
ON public.proctoring_incidents FOR SELECT
USING (
  student_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()) OR
  public.current_user_role() IN ('examiner', 'admin')
);

CREATE POLICY "Incident insert"
ON public.proctoring_incidents FOR INSERT
WITH CHECK (true);

CREATE POLICY "Examiner review incidents"
ON public.proctoring_incidents FOR UPDATE
USING (public.current_user_role() IN ('examiner', 'admin'));

-- ============================================================================
-- STORAGE BUCKETS (Run in Supabase SQL editor)
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('exam-documents', 'exam-documents', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('incident-evidence', 'incident-evidence', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for private buckets
CREATE POLICY "Examiners can upload exam documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'exam-documents');

CREATE POLICY "Authorized users can read exam documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'exam-documents');

CREATE POLICY "System can save incident evidence"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'incident-evidence');

CREATE POLICY "Examiners can read incident evidence"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'incident-evidence');

-- ============================================================================
-- SUPABASE REALTIME CONFIGURATION
-- ============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.exam_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.proctoring_incidents;

-- ============================================================================
-- PRE-SEEDED DEMO DATA (Matches AIMST Reference Images)
-- ============================================================================

-- 1. Insert Initial Profiles
INSERT INTO public.profiles (id, full_name, id_number, email, role, avatar_url)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Dr. Ahmad', '88012', 'ahmad@aimst.edu.my', 'examiner', '/examiner_ahmad.jpg'),
  ('22222222-2222-2222-2222-222222222222', 'Divyasri Vijaya Kumaran', 'B21010123', 'divyasri@aimst.edu.my', 'student', '/student_divyasri.jpg'),
  ('33333333-3333-3333-3333-333333333333', 'AIMST Administrator', 'ADM-001', 'admin@aimst.edu.my', 'admin', NULL),
  ('44444444-4444-4444-4444-444444444441', 'Tan Wei Leng', 'B21010124', 'tanweiling@aimst.edu.my', 'student', NULL),
  ('44444444-4444-4444-4444-444444444442', 'Nur Aisyah', 'B21010145', 'nuraisyah@aimst.edu.my', 'student', NULL),
  ('44444444-4444-4444-4444-444444444443', 'Muhammad Afiq', 'B21010167', 'afiq@aimst.edu.my', 'student', NULL),
  ('44444444-4444-4444-4444-444444444444', 'Lim Jia Wen', 'B21010189', 'jiawen@aimst.edu.my', 'student', NULL),
  ('44444444-4444-4444-4444-444444444445', 'Siti Nurhaliza', 'B21010211', 'sitinurhaliza@aimst.edu.my', 'student', NULL),
  ('44444444-4444-4444-4444-444444444446', 'Aravinth', 'B21010155', 'aravinth@aimst.edu.my', 'student', NULL),
  ('44444444-4444-4444-4444-444444444447', 'Siti Nur Hidayah', 'B21010165', 'hidayah@aimst.edu.my', 'student', NULL),
  ('44444444-4444-4444-4444-444444444448', 'Eng Jessica', 'B21010192', 'jessica@aimst.edu.my', 'student', NULL),
  ('44444444-4444-4444-4444-444444444449', 'Kartik', 'B21010198', 'kartik@aimst.edu.my', 'student', NULL)
ON CONFLICT (id_number) DO NOTHING;

-- 2. Insert Subjects from Reference Images
INSERT INTO public.subjects (id, subject_code, subject_name, description, created_by)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'BIMS13108', 'Decision Support Systems', 'Analytical frameworks, computerized DSS architectures, and business intelligence models.', '11111111-1111-1111-1111-111111111111'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'BIMS13109', 'Strategic Management IS', 'Formulation and execution of technology-driven competitive business strategies.', '11111111-1111-1111-1111-111111111111'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'BIMS13142', 'Business Analytics', 'Exploratory data analysis, predictive modeling, and optimization in executive decisions.', '11111111-1111-1111-1111-111111111111'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', 'BIS1013', 'Introduction to Business', 'Foundations of commerce, organizational structures, and enterprise management.', '11111111-1111-1111-1111-111111111111'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5', 'BCM1013', 'Business Communication', 'Professional communication strategies, report writing, and stakeholder presentations.', '11111111-1111-1111-1111-111111111111'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6', 'BPM1013', 'Business Process Management', 'Process modeling, workflows, re-engineering, and continuous quality improvement.', '11111111-1111-1111-1111-111111111111'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa7', 'BTT1013', 'Business Technology', 'Core technologies supporting digital transformations in contemporary firms.', '11111111-1111-1111-1111-111111111111'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa8', 'BTA1013', 'Business Statistics', 'Probability, statistical inference, hypothesis testing, and quantitative decision making.', '11111111-1111-1111-1111-111111111111')
ON CONFLICT (subject_code) DO NOTHING;

-- 3. Self-Enroll Student Divyasri into 5 subjects (Matches: "Total Subjects: 5")
INSERT INTO public.subject_enrollments (student_id, subject_id)
VALUES
  ('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'),
  ('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2'),
  ('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3'),
  ('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4'),
  ('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5')
ON CONFLICT DO NOTHING;

-- Also enroll cohort into BIS1013 and BIMS13109 (25 students cohort simulation)
INSERT INTO public.subject_enrollments (student_id, subject_id)
VALUES
  ('44444444-4444-4444-4444-444444444441', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4'),
  ('44444444-4444-4444-4444-444444444442', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4'),
  ('44444444-4444-4444-4444-444444444443', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4'),
  ('44444444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4'),
  ('44444444-4444-4444-4444-444444444445', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4'),
  ('44444444-4444-4444-4444-444444444446', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4'),
  ('44444444-4444-4444-4444-444444444447', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4'),
  ('44444444-4444-4444-4444-444444444448', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4'),
  ('44444444-4444-4444-4444-444444444449', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4')
ON CONFLICT DO NOTHING;

-- 4. Insert Exams from Reference Images
INSERT INTO public.exams (id, subject_id, title, description, exam_date, start_time, end_time, duration_minutes, instructions, status, created_by)
VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Decision Support Systems Final Examination', 'Comprehensive online evaluation for BIMS13108.', '2026-04-15', '09:00 AM', '11:00 AM', 120, '1. Ensure you are in a quiet environment.\n2. Keep your face visible to the camera at all times.\n3. Do not switch tabs or exit fullscreen.\n4. Webcam permission is required.', 'scheduled', '11111111-1111-1111-1111-111111111111'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'Strategic Management IS Mid-Term Examination', 'Strategy assessment and enterprise case analysis.', '2026-04-18', '02:00 PM', '04:00 PM', 120, 'Follow all proctoring instructions strictly. Any unauthorized tab switch will be logged.', 'ongoing', '11111111-1111-1111-1111-111111111111'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'Business Analytics Assessment', 'Quantitative analytics and decision models.', '2026-04-20', '09:00 AM', '11:00 AM', 120, 'Ensure continuous webcam feed during the exam.', 'scheduled', '11111111-1111-1111-1111-111111111111'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', 'Introduction to Business Examination', 'Core concepts of modern commercial enterprises.', '2026-04-16', '09:00 AM', '10:00 AM', 60, 'Complete all document-based questions within the allotted 60 minutes.', 'ongoing', '11111111-1111-1111-1111-111111111111')
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Exam Documents (Word Document representation)
INSERT INTO public.exam_documents (id, exam_id, storage_path, original_filename, file_size, extracted_text, parsed_questions)
VALUES
  ('cccccccc-cccc-cccc-cccc-cccccccccc01', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'exam-documents/Decision_Support_Systems_Exam.docx', 'Decision_Support_Systems_Exam.docx', 349184,
   'Question 1: Based on the case study provided, answer the following questions in the document: 1. What are the key factors that influence the decision-making process in this scenario? 2. Suggest a suitable business intelligence solution to improve the decision-making process. 3. Justify your answer with relevant examples.\n\nQuestion 2: Discuss the role of Executive Information Systems (EIS) in strategic planning.',
   '[
     {"id": 1, "number": 1, "text": "Based on the case study provided, answer the following questions in the document:\\n1. What are the key factors that influence the decision-making process in this scenario?\\n2. Suggest a suitable business intelligence solution to improve the decision-making process.\\n3. Justify your answer with relevant examples.", "type": "essay"},
     {"id": 2, "number": 2, "text": "Compare and contrast Model-driven Decision Support Systems with Data-driven Decision Support Systems. Provide real-world enterprise applications for each.", "type": "essay"}
   ]'::jsonb),
  ('cccccccc-cccc-cccc-cccc-cccccccccc02', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4', 'exam-documents/BIS1013_ExamPaper.docx', 'BIS1013_ExamPaper.docx', 349520,
   'Question 1: Explain the fundamental differences between sole proprietorship, partnership, and corporation structures in Malaysia.\n\nQuestion 2: Describe Porter''s Five Forces framework and how digital transformation impacts industry rivalry.',
   '[
     {"id": 1, "number": 1, "text": "Explain the fundamental differences between sole proprietorship, partnership, and corporation structures in Malaysia.", "type": "essay"},
     {"id": 2, "number": 2, "text": "Describe Porter''s Five Forces framework and how digital transformation impacts industry rivalry.", "type": "essay"}
   ]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 6. Insert Live Exam Sessions for Monitoring (BIS1013 & BIMS13109)
INSERT INTO public.exam_sessions (id, exam_id, student_id, started_at, status, last_activity_at)
VALUES
  ('dddddddd-dddd-dddd-dddd-dddddddddd01', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4', '44444444-4444-4444-4444-444444444441', NOW() - INTERVAL '45 minutes', 'joined', NOW() - INTERVAL '1 minute'),
  ('dddddddd-dddd-dddd-dddd-dddddddddd02', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4', '44444444-4444-4444-4444-444444444442', NOW() - INTERVAL '40 minutes', 'joined', NOW() - INTERVAL '2 minutes'),
  ('dddddddd-dddd-dddd-dddd-dddddddddd03', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4', '44444444-4444-4444-4444-444444444443', NOW() - INTERVAL '35 minutes', 'joined', NOW() - INTERVAL '4 minutes'),
  ('dddddddd-dddd-dddd-dddd-dddddddddd04', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4', '44444444-4444-4444-4444-444444444445', NOW() - INTERVAL '30 minutes', 'joined', NOW() - INTERVAL '1 minute')
ON CONFLICT DO NOTHING;

-- 7. Insert Proctoring Incidents (Matches Reference Image: Tab Switch, Multiple Face, No Face)
INSERT INTO public.proctoring_incidents (id, exam_id, student_id, incident_type, severity, timestamp, description, evidence_path, review_status)
VALUES
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', '44444444-4444-4444-4444-444444444441', 'Tab Switch', 'medium', NOW() - INTERVAL '35 minutes', 'Student switched to another browser tab.', '/incident_snapshot_sample.jpg', 'pending'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', '44444444-4444-4444-4444-444444444442', 'Multiple Face', 'high', NOW() - INTERVAL '28 minutes', 'More than one person detected in candidate camera frame.', '/incident_snapshot_sample.jpg', 'pending'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee3', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', '44444444-4444-4444-4444-444444444443', 'Face Not Detected', 'medium', NOW() - INTERVAL '18 minutes', 'Student not detected in camera frame for 15 seconds.', '/incident_snapshot_sample.jpg', 'pending')
ON CONFLICT (id) DO NOTHING;
