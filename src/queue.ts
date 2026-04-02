interface QueuedMessage {
  id: string
  channelId: string
  userId: string
  text: string
  threadTs?: string
  createdAt: number
}

const MAX_QUEUE_SIZE = 100

export class MessageQueue {
  private queues = new Map<string, QueuedMessage[]>()
  private processing = new Map<string, boolean>()

  enqueue(sessionKey: string, message: Omit<QueuedMessage, 'id' | 'createdAt'>): string | null {
    const queue = this.queues.get(sessionKey) || []

    // Enforce max queue size
    if (queue.length >= MAX_QUEUE_SIZE) {
      return null
    }

    const id = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const queued: QueuedMessage = {
      ...message,
      id,
      createdAt: Date.now(),
    }

    queue.push(queued)
    this.queues.set(sessionKey, queue)

    return id
  }

  dequeue(sessionKey: string): QueuedMessage | undefined {
    const queue = this.queues.get(sessionKey)
    if (!queue || queue.length === 0) return undefined
    return queue.shift()
  }

  peek(sessionKey: string): QueuedMessage | undefined {
    const queue = this.queues.get(sessionKey)
    if (!queue || queue.length === 0) return undefined
    return queue[0]
  }

  size(sessionKey: string): number {
    return this.queues.get(sessionKey)?.length || 0
  }

  clear(sessionKey: string): number {
    const queue = this.queues.get(sessionKey)
    const count = queue?.length || 0
    this.queues.set(sessionKey, [])
    return count
  }

  isProcessing(sessionKey: string): boolean {
    return this.processing.get(sessionKey) === true
  }

  setProcessing(sessionKey: string, value: boolean): void {
    this.processing.set(sessionKey, value)
  }

  getAll(sessionKey: string): QueuedMessage[] {
    return this.queues.get(sessionKey) || []
  }
}
