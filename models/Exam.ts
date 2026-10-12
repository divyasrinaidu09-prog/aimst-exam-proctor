import mongoose, { Schema, Document, Model } from 'mongoose';

export type ExamStatus = 'draft' | 'upcoming' | 'ongoing' | 'completed';

export interface IExam extends Document {
  title: string;
  courseCode: string;
  dateTime: Date;
  duration: number; // duration in minutes
  totalPoints: number;
  passPercentage: number;
  maxViolationsAllowed: number;
  status: ExamStatus;
  createdBy: mongoose.Types.ObjectId;
  assignedStudents?: string[]; // student emails or IDs
  showInstantResults: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ExamSchema = new Schema<IExam>({
  title: {
    type: String,
    required: [true, 'Exam title is required'],
    trim: true,
  },
  courseCode: {
    type: String,
    required: [true, 'Course code is required (e.g. MIS3014)'],
    trim: true,
    uppercase: true,
  },
  dateTime: {
    type: Date,
    required: [true, 'Exam schedule date and time is required'],
    default: Date.now,
  },
  duration: {
    type: Number,
    required: [true, 'Duration in minutes is required'],
    default: 60,
    min: 5,
    max: 300,
  },
  totalPoints: {
    type: Number,
    default: 100,
  },
  passPercentage: {
    type: Number,
    default: 50,
  },
  maxViolationsAllowed: {
    type: Number,
    default: 5, // Threshold for auto-flagging / termination
  },
  status: {
    type: String,
    enum: ['draft', 'upcoming', 'ongoing', 'completed'],
    default: 'upcoming',
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedStudents: [{
    type: String,
  }],
  showInstantResults: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export const Exam: Model<IExam> = mongoose.models.Exam || mongoose.model<IExam>('Exam', ExamSchema);
