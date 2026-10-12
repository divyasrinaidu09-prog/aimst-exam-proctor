export type UserRole = 'student' | 'examiner' | 'admin';

export interface Profile {
  id: string;
  auth_user_id?: string | null;
  full_name: string;
  id_number: string;
  email: string;
  role: UserRole;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Subject {
  id: string;
  subject_code: string;
  subject_name: string;
  description?: string | null;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
  // Computed / joined fields
  enrolled_count?: number;
  examiner_name?: string;
  exam_status?: string;
}

export interface SubjectEnrollment {
  id: string;
  student_id: string;
  subject_id: string;
  enrolled_at: string;
  status: 'enrolled' | 'dropped';
  // Joined fields
  student?: Profile;
  subject?: Subject;
}

export type ExamStatus = 'draft' | 'scheduled' | 'open' | 'ongoing' | 'completed' | 'cancelled';

export interface Exam {
  id: string;
  subject_id: string;
  title: string;
  description?: string | null;
  exam_date: string;
  start_time: string;
  end_time?: string | null;
  duration_minutes: number;
  instructions?: string | null;
  status: ExamStatus;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
  // Joined fields
  subject?: Subject;
  document?: ExamDocument;
}

export interface ParsedQuestion {
  id: number;
  number: number;
  text: string;
  type?: 'essay' | 'mcq';
  options?: string[];
}

export interface ExamDocument {
  id: string;
  exam_id: string;
  storage_path: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  extracted_text?: string | null;
  parsed_questions?: ParsedQuestion[] | null;
  uploaded_at: string;
}

export type SessionStatus = 'joined' | 'in_progress' | 'submitted' | 'disconnected' | 'flagged';

export interface ExamSession {
  id: string;
  exam_id: string;
  student_id: string;
  started_at: string;
  submitted_at?: string | null;
  status: SessionStatus;
  last_activity_at: string;
  // Joined fields
  student?: Profile;
  exam?: Exam;
}

export interface ExamSubmission {
  id: string;
  exam_id: string;
  student_id: string;
  exam_session_id?: string | null;
  submitted_at: string;
  answers: Record<string, any>;
  submission_notes?: string | null;
  status: 'submitted' | 'graded' | 'published';
  score?: number | null;
  feedback?: string | null;
  student?: Profile;
  exam?: Exam;
}

export type IncidentType =
  | 'Tab Switch'
  | 'Fullscreen Exit'
  | 'Multiple Face'
  | 'Face Not Detected'
  | 'Camera Disconnected'
  | 'Browser Focus Lost';

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ReviewStatus = 'pending' | 'reviewed' | 'dismissed';

export interface ProctoringIncident {
  id: string;
  exam_id: string;
  student_id: string;
  exam_session_id?: string | null;
  incident_type: IncidentType;
  severity: IncidentSeverity;
  timestamp: string;
  description: string;
  evidence_path?: string | null;
  review_status: ReviewStatus;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  // Joined fields
  student?: Profile;
  exam?: Exam;
}
