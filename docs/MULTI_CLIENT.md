# Multi-Client Configuration

> Best practices for running multiple bridges or sharing OpenCode servers.

## Quick Answer

**Yes** — OpenCode server is stateless. Multiple clients can connect simultaneously.

## How It Works

```
┌──────────────┐     ┌─────────────────────┐
│ Slack Bridge │────▶│ OpenCode Server     │
└──────────────┘     │ localhost:4096/4097  │
                     └────────────┬────────┘
┌──────────────┐              │
│ Discord      │──────────────┘
│ Bridge      │
└──────────────┘
```

Each bridge creates isolated sessions via `POST /session`. Sessions don't interfere.

## Running Multiple Bridges

```bash
# Terminal 1: OpenCode server
opencode serve

# Terminal 2: Slack bridge
cd opencode-slack-bridge
npm run dev

# Terminal 3: Another bridge (Discord, etc.)
cd another-bridge
npm run dev
```

## Different Ports

For separate OpenCode servers per project:

```bash
# Project A
cd ~/project-a
opencode serve --port 4096

# Project B  
cd ~/project-b
opencode serve --port 4097
```

Then set `OPENCODE_URL=http://localhost:4097` in each bridge's `.env`.