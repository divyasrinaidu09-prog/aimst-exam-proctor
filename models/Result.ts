import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IResult extends Document {
  sessionID: mongoose.Types.ObjectId;
  studentID: mongoose.Types.ObjectId;
  examID: mongoose.Types.ObjectId;
  totalScore: number;
  maxScore: number;
  percentage: number;
  grade: string; // 'A', 'B', 'C', 'D', 'F'
  passed: boolean;
  totalViolations: number;
  integrityScore: number; // 0 - 100% computed trust index
  generatedDate: Date;
  status: 'passed' | 'failed' | 'flagged_for_review';
}

const ResultSchema = new Schema<IResult>({
  sessionID: {
    type: Schema.Types.ObjectId,
    ref: 'ExamSession',
    required: true,
    unique: true,
  },
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
  totalScore: {
    type: Number,
    required: true,
  },
  maxScore: {
    type: Number,
    required: true,
  },
  percentage: {
    type: Number,
    required: true,
  },
  grade: {
    type: String,
    required: true,
  },
  passed: {
    type: Boolean,
    required: true,
  },
  totalViolations: {
    type: Number,
    default: 0,
  },
  integrityScore: {
    type: Number,
    default: 100, // Reduced as severe violations occur
  },
  generatedDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['passed', 'failed', 'flagged_for_review'],
    default: 'passed',
  },
}, {
  timestamps: true,
});

export const Result: Model<IResult> = mongoose.models.Result || mongoose.model<IResult>('Result', ResultSchema);
