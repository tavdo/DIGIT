import app from '../server/app.js'
import { prepareServer } from '../server/lib/prepare.js'

app.use(async (req, res, next) => {
  try {
    await prepareServer()
    next()
  } catch (err) {
    console.error('[API] Init failed:', err?.message || err)
    res.status(503).json({ message: 'Database unavailable' })
  }
})

export default app
