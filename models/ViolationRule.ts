import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IViolationRule extends Document {
  ruleName: string;
  code: string;
  description: string;
  threshold: number; // e.g. 5 seconds for face_missing, or 3 times for tab_switch
  severity: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  actionOnBreach: 'warn' | 'log' | 'terminate_exam';
}

const ViolationRuleSchema = new Schema<IViolationRule>({
  ruleName: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  threshold: {
    type: Number,
    required: true,
    default: 1,
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  actionOnBreach: {
    type: String,
    enum: ['warn', 'log', 'terminate_exam'],
    default: 'log',
  },
}, {
  timestamps: true,
});

export const ViolationRule: Model<IViolationRule> = mongoose.models.ViolationRule || mongoose.model<IViolationRule>('ViolationRule', ViolationRuleSchema);
