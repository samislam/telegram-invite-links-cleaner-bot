import { cleanEnv, str, bool, num } from 'envalid'

export const env = cleanEnv(process.env, {
  TELEGRAM_BOT_TOKEN: str(),
  TELEGRAM_BOT_USERNAME: str(),
  DATABASE_URL: str(),
  ONLY_JOIN_LINKS: bool({ default: false }),
  OWNER_USER_ID: num({ default: 0 }),
  SPY_ENABLED: bool({ default: false }),
  SPY_GROUP_ID: num({ default: 0 }),
})
