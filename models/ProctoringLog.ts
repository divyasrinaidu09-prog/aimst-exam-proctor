import mongoose, { Schema, Document, Model } from 'mongoose';

export type IncidentType =
  | 'face_missing'
  | 'multiple_faces'
  | 'tab_switch'
  | 'fullscreen_exit'
  | 'copy_paste_attempt'
  | 'suspicious_motion';

export interface IProctoringLog extends Document {
  sessionID: mongoose.Types.ObjectId;
  incidentType: IncidentType;
  timestamp: Date;
  description: string;
  screenshotUrl: string; // Base64 data URI or Vercel Blob URL
  reviewed: boolean;
  reviewedBy?: mongoose.Types.ObjectId;
  severity: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  updatedAt: Date;
}

const ProctoringLogSchema = new Schema<IProctoringLog>({
  sessionID: {
    type: Schema.Types.ObjectId,
    ref: 'ExamSession',
    required: true,
    index: true,
  },
  incidentType: {
    type: String,
    enum: ['face_missing', 'multiple_faces', 'tab_switch', 'fullscreen_exit', 'copy_paste_attempt', 'suspicious_motion'],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  description: {
    type: String,
    required: true,
  },
  screenshotUrl: {
    type: String,
    default: '',
  },
  reviewed: {
    type: Boolean,
    default: false,
  },
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
}, {
  timestamps: true,
});

export const ProctoringLog: Model<IProctoringLog> = mongoose.models.ProctoringLog || mongoose.model<IProctoringLog>('ProctoringLog', ProctoringLogSchema);
