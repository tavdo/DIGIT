import path from 'path'
import { pathToFileURL } from 'url'
import app from './app.js'
import { prepareServer } from './lib/prepare.js'

export { default } from './app.js'
export { app }

export async function startServer() {
  try {
    await prepareServer()
    const PORT = process.env.PORT || 5000
    app.listen(PORT, () => {
      console.log(`[Express] Backend server running at http://localhost:${PORT}`)
    })
  } catch (err) {
    console.error('[PostgreSQL] Initial connection failed:', err)
    process.exit(1)
  }
}

const isDirectRun =
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href

if (isDirectRun) {
  import('./bootstrap.js').catch((err) => {
    console.error('[Server] Failed to start:', err?.message || err)
    process.exit(1)
  })
}
