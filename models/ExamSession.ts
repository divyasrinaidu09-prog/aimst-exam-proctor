import mongoose, { Schema, Document, Model } from 'mongoose';

export type SessionStatus = 'in_progress' | 'submitted' | 'terminated' | 'under_review';

export interface IExamSession extends Document {
  studentID: mongoose.Types.ObjectId;
  examID: mongoose.Types.ObjectId;
  startTime: Date;
  endTime?: Date;
  status: SessionStatus;
  ipAddress?: string;
  deviceInfo?: string;
  violationsCount: number;
  totalScore?: number;
  percentage?: number;
  faceVerified: boolean;
  verificationConfidence?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ExamSessionSchema = new Schema<IExamSession>({
  studentID: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  examID: {
    type: Schema.Types.ObjectId,
    ref: 'Exam',
    required: true,
    index: true,
  },
  startTime: {
    type: Date,
    default: Date.now,
  },
  endTime: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['in_progress', 'submitted', 'terminated', 'under_review'],
    default: 'in_progress',
  },
  ipAddress: {
    type: String,
    default: '127.0.0.1',
  },
  deviceInfo: {
    type: String,
    default: 'Desktop Browser',
  },
  violationsCount: {
    type: Number,
    default: 0,
  },
  totalScore: {
    type: Number,
    default: 0,
  },
  percentage: {
    type: Number,
    default: 0,
  },
  faceVerified: {
    type: Boolean,
    default: false,
  },
  verificationConfidence: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

export const ExamSession: Model<IExamSession> = mongoose.models.ExamSession || mongoose.model<IExamSession>('ExamSession', ExamSessionSchema);
