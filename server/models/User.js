import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, default: '' },
  role: {
    type: String,
    enum: ['customer', 'manager', 'developer', 'admin'],
    default: 'customer'
  },
  developerRequestStatus: {
    type: String,
    enum: ['none', 'pending', 'approved', 'rejected'],
    default: 'none'
  },
  companyName: { type: String, default: '' },
  phone: { type: String, default: '' },
  bio: { type: String, default: '' },
  experienceCategories: { type: [String], default: [] },
  experienceYears: { type: String, default: '' },
  ratingAvg: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  ratingSum: { type: Number, default: 0 },
  completedTasksCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
})

userSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString()
    delete ret._id
    delete ret.__v
    delete ret.password
    return ret
  }
})

export default mongoose.model('User', userSchema)
