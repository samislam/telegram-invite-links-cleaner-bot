import chalk from 'chalk'
import to from 'await-to-js'
import { bot } from './lib/bot'
import { configDotenv } from 'dotenv'
import { connectDb } from './db/connect-db'
import { headerLogs } from './service/header-logs'
import { setCommands } from './functions/set-commands'
import { whoamiListener } from './listeners/whoami.listener'
import { helpListener } from './listeners/help.listener'
import { startListener } from './listeners/start.listener'
import { decoupleListener } from './listeners/decouple.listener'
import { registerBotListeners } from './utils/register-bot-listeners'
import { processTerminateListener } from './service/process-terminate-listeners'
import { registerTextListeners } from './utils/register-text-listeners'
import { spyInviteLinksListener } from './listeners/spy-invite-links.listener'

async function main() {
  configDotenv({ path: '../.env.local' })
  console.log(`${chalk.blueBright.bold('[info]')} connecting to the database...`)
  const [err] = await to(connectDb())
  if (err) {
    console.log(`${chalk.red.bold('[Error]')} Failed to connect to the database!`)
    process.exit(-1)
  }
  console.log(`${chalk.greenBright.bold('[Success]')} connected`)
  registerBotListeners([startListener, whoamiListener, helpListener])
  registerTextListeners([decoupleListener, spyInviteLinksListener])

  setCommands()
  bot.launch(headerLogs)
  processTerminateListener()
}
main()
