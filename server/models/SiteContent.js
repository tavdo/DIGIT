import mongoose from 'mongoose'

const siteContentSchema = new mongoose.Schema({
  docId: { type: String, required: true, unique: true },
  content: { type: mongoose.Schema.Types.Mixed, default: {} }
})

siteContentSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString()
    delete ret._id
    delete ret.__v
    return ret
  }
})

export default mongoose.model('SiteContent', siteContentSchema)
