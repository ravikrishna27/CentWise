import { Schema, model, Document } from 'mongoose'
import bcrypt from 'bcryptjs'

// Extend Document but do NOT re-declare timestamps —
// Mongoose adds createdAt/updatedAt automatically via the `timestamps` option.
export interface IUserDocument extends Document {
  name: string
  email: string
  password: string
  comparePassword(candidatePassword: string): Promise<boolean>
}

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // never returned in queries by default
    },
  },
  {
    timestamps: true,
  }
)

// Hash password before saving (Mongoose 9: no `next` callback — return Promise<void>)
userSchema.pre('save', async function (this: IUserDocument) {
  if (!this.isModified('password')) return
  const salt = await bcrypt.genSalt(12)
  this.password = await bcrypt.hash(this.password, salt)
})

// Instance method to verify passwords
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

const User = model<IUserDocument>('User', userSchema)
export default User
