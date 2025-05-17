// src/db/links.schema.ts
import mongoose from 'mongoose'

export interface IProcessedLink {
  chatId: number
  link: string
  timestamp: Date
  username?: string
  userId?: number
  messageId: number
}

const processedLinkSchema = new mongoose.Schema<IProcessedLink>({
  chatId: { type: Number, required: true },
  link: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  username: { type: String },
  userId: { type: Number },
  messageId: { type: Number, required: true },
})

// ensure one record per (chatId, link)
processedLinkSchema.index({ chatId: 1, link: 1 }, { unique: true })

export default mongoose.model<IProcessedLink>('ProcessedLink', processedLinkSchema)
