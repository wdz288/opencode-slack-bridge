import { config } from 'dotenv'
import { SlackBridge } from './slack.js'
import { detectOpenCodePort } from './detect-port.js'

config()

async function main() {
  const slackAppToken = process.env.SLACK_APP_TOKEN
  const slackBotToken = process.env.SLACK_BOT_TOKEN
  const opencodeAgent = process.env.OPENCODE_AGENT || 'slack-agent'
  const allowedUsers = process.env.ALLOWED_USERS?.split(',').filter(Boolean) || []
  const allowedChannels = process.env.ALLOWED_CHANNELS?.split(',').filter(Boolean) || []

  if (!slackAppToken || !slackBotToken) {
    console.error('Missing required environment:')
    console.error('  SLACK_APP_TOKEN')
    console.error('  SLACK_BOT_TOKEN')
    console.error('See SETUP.md')
    process.exit(1)
  }

  // Detect OpenCode port
  console.log('Detecting OpenCode...')
  const opencodeUrl = await detectOpenCodePort()

  console.log('')
  console.log('Starting OpenCode Slack Bridge...')
  console.log(`OpenCode: ${opencodeUrl}`)
  console.log(`Agent: ${opencodeAgent}`)

  const bridge = new SlackBridge({
    appToken: slackAppToken,
    botToken: slackBotToken,
    opencodeUrl,
    opencodeAgent,
    allowedUsers: allowedUsers.length > 0 ? allowedUsers : undefined,
    allowedChannels: allowedChannels.length > 0 ? allowedChannels : undefined,
  })

  const shutdown = async () => {
    await bridge.stop()
    process.exit(0)
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)

  await bridge.start()
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})