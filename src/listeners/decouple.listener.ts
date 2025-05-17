import { bot } from '../lib/bot'
import { env } from '../service/validate-env'
import ProcessedLink from '../db/links.schema'
import type { TextListener } from '../utils/register-text-listeners'

// helper to normalize links (strip protocol + trailing slash)
const normalizeLink = (link: string) =>
  link
    .replace(/^https?:\/\//i, '') // drop http:// or https://
    .replace(/\/$/, '') // drop trailing slash
    .replace(/[\s"'”’]+$/g, '') // drop trailing spaces, quotes, curly quotes

export const decoupleListener: TextListener = async (ctx) => {
  const chatId = ctx.chat.id
  const messageId = ctx.message.message_id
  const messageText = ctx.message.text || ''

  const username = ctx.from.username || null
  const userId = ctx.from.id || null

  // matches t.me/... with optional http(s)://, stopping at a word boundary
  const inviteLinkRegex = /(?:https?:\/\/)?t\.me\/(?:\+[\w\d]+|[\w\d]+|addlist\/[\w\d]+)/gi
  // matches URLs like example.com, www.example.org/page, with optional http(s):// and query
  const anyLinkRegex = /(?:https?:\/\/)?[A-Za-z0-9.-]+\.[A-Za-z]{2,6}(?:\/\S*)?/gi

  const linkRegex = env.ONLY_JOIN_LINKS ? inviteLinkRegex : anyLinkRegex
  const found = messageText.match(linkRegex)

  if (found) {
    const uniqueLinks: string[] = []

    for (const rawLink of found) {
      const link = normalizeLink(rawLink)

      const isDuplicate = await ProcessedLink.exists({ chatId, link })
      if (isDuplicate) continue

      uniqueLinks.push(rawLink)
      // reply with the original formatting
      const sentMessage = await ctx.reply(rawLink)

      // save the normalized link
      await new ProcessedLink({
        chatId,
        link,
        username,
        userId,
        messageId: sentMessage.message_id,
      }).save()
    }

    // optional log for duplicates
    const duplicates = found.filter((l) => !uniqueLinks.includes(l))
    if (duplicates.length) {
      console.log('Duplicate links detected:', duplicates)
    }
  }

  // always delete the original
  try {
    await bot.telegram.deleteMessage(chatId, messageId)
  } catch (err) {
    console.error(`Failed to delete message ${messageId}:`, err)
  }

  // if no links at all, you can log it
  if (!found) {
    console.log('No invite links found. Deleted message.')
  }
}
