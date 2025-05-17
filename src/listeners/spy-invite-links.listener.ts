import type { TextListener } from '../utils/register-text-listeners'
import { env } from '../service/validate-env'
import ProcessedSpyLink from '../db/spy-link.schema'

// reuse your normalizer from decouple.listener or re-define
const normalizeLink = (link: string) =>
  link
    .replace(/^https?:\/\//i, '') // remove protocol
    .replace(/\/$/, '') // remove trailing slash
    .replace(/[\s"'”’.,;:!?]+$/g, '') // remove trailing punctuation

export const spyInviteLinksListener: TextListener = async (ctx) => {
  if (!env.SPY_ENABLED) return
  if (ctx.from.id === env.OWNER_USER_ID) return

  const text = ctx.message.text || ''
  const inviteRegex = /(?:https?:\/\/)?t\.me\/(?:\+[\w\d]+|[\w\d]+|addlist\/[\w\d]+)/gi
  const links = text.match(inviteRegex)
  if (!links) return

  for (const rawLink of links) {
    const link = normalizeLink(rawLink)

    try {
      // record it; duplicate save → thrown error
      await new ProcessedSpyLink({
        spyGroupId: env.SPY_GROUP_ID,
        link,
      }).save()

      // only on first‐time save do we forward
      await ctx.telegram.sendMessage(env.SPY_GROUP_ID, `🔗 ${rawLink}`)
    } catch (err: any) {
      // skip duplicates silently
      if (err.code === 11000) continue
      console.error('Error recording spy-link:', err)
    }
  }
}
