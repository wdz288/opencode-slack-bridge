import { SessionDatabase } from './database.js'

export class SessionManager {
  private db: SessionDatabase

  constructor(dbPath?: string) {
    this.db = new SessionDatabase(dbPath)
  }

  get(sessionKey: string): string | undefined {
    const row = this.db.getSession(sessionKey)
    return row?.session_id
  }

  set(sessionKey: string, sessionId: string): void {
    this.db.setSession(sessionKey, sessionId)
  }

  delete(sessionKey: string): boolean {
    const existed = this.get(sessionKey) !== undefined
    this.db.deleteSession(sessionKey)
    return existed
  }

  list(): Array<{ channelId: string; sessionId: string }> {
    return this.db.listSessions().map(row => ({
      channelId: row.channel_id,
      sessionId: row.session_id,
    }))
  }

  listKeys(): string[] {
    return this.db.listSessions().map(row => row.channel_id)
  }

  // Directory mapping for multi-project support
  getDirectory(channelId: string): string | undefined {
    const row = this.db.getDirectory(channelId)
    return row?.directory
  }

  setDirectory(channelId: string, directory: string): void {
    this.db.setDirectory(channelId, directory)
  }

  close(): void {
    this.db.close()
  }
}
