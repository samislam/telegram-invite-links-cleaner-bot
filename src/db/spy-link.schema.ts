import mongoose from 'mongoose'

export interface IProcessedSpyLink {
  spyGroupId: number
  link: string
  forwardedAt: Date
}

const spyLinkSchema = new mongoose.Schema<IProcessedSpyLink>({
  spyGroupId: { type: Number, required: true },
  link: { type: String, required: true },
  forwardedAt: { type: Date, default: Date.now },
})

// UNIQUE per (spyGroupId, link)
spyLinkSchema.index({ spyGroupId: 1, link: 1 }, { unique: true })

export default mongoose.model<IProcessedSpyLink>('ProcessedSpyLink', spyLinkSchema)
