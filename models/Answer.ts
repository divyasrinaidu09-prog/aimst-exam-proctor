import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAnswer extends Document {
  sessionID: mongoose.Types.ObjectId;
  questionID: mongoose.Types.ObjectId;
  selectedOption: string; // 'A', 'B', 'C', 'D'
  isCorrect?: boolean;
  timeSpent?: number; // seconds
  createdAt: Date;
  updatedAt: Date;
}

const AnswerSchema = new Schema<IAnswer>({
  sessionID: {
    type: Schema.Types.ObjectId,
    ref: 'ExamSession',
    required: true,
    index: true,
  },
  questionID: {
    type: Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
  },
  selectedOption: {
    type: String,
    required: true,
  },
  isCorrect: {
    type: Boolean,
    default: false,
  },
  timeSpent: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

export const Answer: Model<IAnswer> = mongoose.models.Answer || mongoose.model<IAnswer>('Answer', AnswerSchema);
