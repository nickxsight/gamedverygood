// Minimal Claude API proxy for the "Vera" AI chat assistant.
//
// The design prototype called window.claude.complete() inside the Claude Design
// runtime. In a real app that bridge doesn't exist, so the client posts the
// prompt here and this server calls the Anthropic Messages API with a
// server-side key. If ANTHROPIC_API_KEY is unset (or the call fails) we return
// 503 and the client transparently falls back to its built-in keyword bot.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import express from 'express'

// Load a local .env (KEY=VALUE per line) if present — no dependency needed.
try {
  const envPath = join(dirname(fileURLToPath(import.meta.url)), '..', '.env')
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/)
    if (m && !(m[1] in process.env)) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  }
} catch { /* no .env file — rely on real env vars */ }

const PORT = process.env.PORT || 8787
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5'

const app = express()
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, hasKey: !!process.env.ANTHROPIC_API_KEY, model: MODEL })
})

app.post('/api/chat', async (req, res) => {
  const prompt = (req.body && req.body.prompt) || ''
  if (!prompt.trim()) return res.status(400).json({ error: 'prompt required' })
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: 'no_api_key' }) // client falls back to keyword bot
  }
  try {
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    })
    const text = (msg.content || [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('')
      .trim()
    res.json({ text })
  } catch (err) {
    console.error('[chat] Anthropic call failed:', err?.message || err)
    res.status(502).json({ error: 'upstream_failed' })
  }
})

app.listen(PORT, () => {
  console.log(`[gvg] chat proxy on http://localhost:${PORT}  (model: ${MODEL}, key: ${process.env.ANTHROPIC_API_KEY ? 'set' : 'MISSING → keyword fallback'})`)
})
