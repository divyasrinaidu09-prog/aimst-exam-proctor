import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IQuestionOption {
  optionId: string; // 'A', 'B', 'C', 'D'
  text: string;
}

export interface IQuestion extends Document {
  examID: mongoose.Types.ObjectId;
  questionText: string;
  options: IQuestionOption[];
  correctAnswer: string; // 'A', 'B', 'C', or 'D'
  points: number;
  explanation?: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionOptionSchema = new Schema<IQuestionOption>({
  optionId: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
}, { _id: false });

const QuestionSchema = new Schema<IQuestion>({
  examID: {
    type: Schema.Types.ObjectId,
    ref: 'Exam',
    required: true,
    index: true,
  },
  questionText: {
    type: String,
    required: [true, 'Question text is required'],
  },
  options: {
    type: [QuestionOptionSchema],
    validate: [
      (val: IQuestionOption[]) => val.length >= 2,
      'Questions must have at least 2 options',
    ],
  },
  correctAnswer: {
    type: String,
    required: [true, 'Correct answer identifier is required'],
  },
  points: {
    type: Number,
    required: true,
    default: 1,
    min: 1,
  },
  explanation: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

export const Question: Model<IQuestion> = mongoose.models.Question || mongoose.model<IQuestion>('Question', QuestionSchema);
