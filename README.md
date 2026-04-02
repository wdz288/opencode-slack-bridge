# OpenCode Slack Bridge

Chat with your OpenCode coding agent directly from Slack.

## Architecture

```
┌─────────────────┐         ┌──────────────────────────────────────┐
│     Slack        │         │  Bridge Service                      │
│                  │         │  (@slack/bolt + @opencode-ai/sdk)    │
│  You send msg    │─────────▶  1. Receive message                  │
│  in DM/channel   │         │  2. Map channel → session            │
│                  │◀────────│  3. POST /session/:id/message        │
│  Bot responds    │         │  4. Format response for Slack        │
└─────────────────┘         └──────────────┬───────────────────────┘
                                           │
                                           ▼
                                   ┌──────────────────┐
                                   │ OpenCode Server   │
                                   │ localhost:4096    │
                                   └──────────────────┘
```

## Features

- **Text in/out** — Send messages, get AI responses
- **Streaming** — Real-time token-by-token updates
- **File attachments** — Attach code files, images, docs
- **Tool output display** — See what tools OpenCode used
- **Session persistence** — SQLite-backed, survives restarts
- **Thread support** — Bot responds in threads

## Prerequisites

1. **Node.js** 18+ installed
2. **OpenCode** installed
3. **Slack workspace** where you can install apps

## Quick Start

```bash
# Clone
git clone https://github.com/wdz288-97/opencode-slack-bridge.git
cd opencode-slack-bridge

# Install
npm install

# Create .env from example
cp .env.example .env

# Follow the Slack app setup guide
open SETUP.md

# Fill in your tokens in .env

# Verify setup
npm run setup

# Start OpenCode server (in another terminal)
opencode serve

# Start the bridge
npm run dev
```

## Setup

See **[SETUP.md](SETUP.md)** for detailed Slack app creation steps.

## Multiple Clients / Shared Server

### Can Multiple Bridges Connect to the Same OpenCode Server?

**Yes.** OpenCode server (`opencode serve`) is a stateless HTTP API server. Multiple clients can connect simultaneously:

```
┌─────────────────┐
│ Slack Bridge     │──┐
└─────────────────┘  │
                     ▼
┌─────────────────┐  ┌──────────────────┐
│ Discord Bridge  │──▶│ OpenCode Server  │
└─────────────────┘  │ localhost:4096    │
                     └──────────────────┘
┌─────────────────┐  ▲
│ Web UI          │──┘
└─────────────────┘
```

### How Sessions Work

- Each bridge creates its own sessions via `POST /session`
- Sessions are isolated — your Slack sessions don't interfere with Discord sessions
- The server manages all sessions independently

### Running Multiple Bridges

```bash
# Terminal 1: OpenCode server
opencode serve

# Terminal 2: Slack bridge
cd opencode-slack-bridge
npm run dev

# Terminal 3: Discord bridge (like kimaki)
cd kimaki
npm run dev
```

### Different Project Directories

If you need separate OpenCode servers for different projects:

```bash
# Project A
cd ~/project-a
opencode serve --port 4096

# Project B
cd ~/project-b
opencode serve --port 4097
```

Then configure each bridge to point to its server:

```env
# Bridge for Project A
OPENCODE_URL=http://localhost:4096

# Bridge for Project B
OPENCODE_URL=http://localhost:4097
```

### Security Note

If connecting to a remote OpenCode server (not localhost), use HTTPS:

```env
# Remote server (use HTTPS)
OPENCODE_URL=https://your-server.example.com:4096
```

**Never expose OpenCode server to the internet without authentication.**

## Session Storage

Session data is stored in SQLite at `./data/sessions.db`:

| Table | Purpose |
|-------|---------|
| `channel_sessions` | Maps Slack channel → OpenCode session |
| `channel_directories` | Maps channel → project directory |

Data persists across restarts. Delete the `./data` folder to reset.

## Usage

### Chat in Slack

1. **DM the bot** — Find it under "Apps" in sidebar, send a message
2. **Mention in channel** — `@OpenCode Bridge your message`
3. **Reply in thread** — Continue conversations in threads

### Slash Commands

| Command | Description |
|---------|-------------|
| `/abort` | Stop the current running session |
| `/resume` | List and resume a previous session |
| `/queue` | View the message queue |
| `/queue clear` | Clear all queued messages |
| `/sessions` | Show current session info |
| `/help` | List all available commands |

### Tips

- End a message with `. queue` to manually queue it while session is busy
- Messages sent while busy are automatically queued and processed in order
- Sessions persist across bridge restarts (stored in SQLite)

## File Structure

```
opencode-slack-bridge/
├── src/
│   ├── index.ts        # Entry point
│   ├── slack.ts        # Slack Bolt handlers + slash commands
│   ├── opencode.ts     # OpenCode SDK client + SSE event bus
│   ├── sessions.ts     # Session management
│   ├── database.ts     # SQLite persistence (better-sqlite3)
│   ├── streaming.ts    # SSE → Slack message updates
│   ├── queue.ts        # Message queue for busy sessions
│   └── setup.ts        # Verification script
├── data/               # SQLite database (gitignored)
├── .env.example        # Token template
├── SETUP.md            # Slack app setup guide
├── README.md           # This file
└── package.json
```

## License

MIT
