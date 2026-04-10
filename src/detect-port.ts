// Detect working OpenCode port before starting
export async function detectOpenCodePort(): Promise<string> {
  const ports = [4097, 4096, 4098, 4099, 5000, 61108, 62000]
  
  for (const port of ports) {
    try {
      const url = `http://localhost:${port}`
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 3000)
      
      const response = await fetch(`${url}/global/health`, { signal: controller.signal })
      clearTimeout(timeout)
      
      if (response.ok) {
        const data = await response.json() as any
        console.log(`✓ OpenCode ${data.version} on port ${port}`)
        return url
      }
    } catch {
      // Try next port
    }
  }
  
  // Try starting new server
  console.log('No OpenCode found, starting on port 4097...')
  const { spawn } = await import('child_process')
  spawn('opencode', ['serve', '--port', '4097'], {
    detached: true,
    stdio: 'ignore',
    shell: true,
    windowsHide: true
  }).unref()
  
  // Wait for server
  await new Promise(r => setTimeout(r, 15000))
  
  // Verify
  try {
    const url = 'http://localhost:4097'
    const response = await fetch(`${url}/global/health`)
    const data = await response.json() as any
    console.log(`✓ OpenCode ${data.version} started on port 4097`)
    return url
  } catch {
    throw new Error('Failed to start OpenCode')
  }
}