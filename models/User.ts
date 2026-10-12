import mongoose, { Schema, Document, Model } from 'mongoose';

export type UserRole = 'student' | 'examiner';

export interface IUser extends Document {
  userID: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  registrationDate: Date;
  // Specific student fields
  faceReferencePhotoUrl?: string;
  enrolledExams?: mongoose.Types.ObjectId[];
  completedExams?: mongoose.Types.ObjectId[];
  // Specific examiner fields
  department?: string;
  createdExams?: mongoose.Types.ObjectId[];
}

const UserSchema = new Schema<IUser>({
  userID: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  passwordHash: {
    type: String,
    required: [true, 'Password hash is required'],
  },
  role: {
    type: String,
    enum: ['student', 'examiner'],
    required: true,
    default: 'student',
  },
  registrationDate: {
    type: Date,
    default: Date.now,
  },
  // Student attributes
  faceReferencePhotoUrl: {
    type: String,
    default: '',
  },
  enrolledExams: [{
    type: Schema.Types.ObjectId,
    ref: 'Exam',
  }],
  completedExams: [{
    type: Schema.Types.ObjectId,
    ref: 'Exam',
  }],
  // Examiner attributes
  department: {
    type: String,
    default: 'Faculty of Allied Health & Information Technology',
  },
  createdExams: [{
    type: Schema.Types.ObjectId,
    ref: 'Exam',
  }],
}, {
  timestamps: true,
});

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
