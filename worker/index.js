// Cloudflare Worker: serves the built site (static assets) and handles the
// Vera chat endpoint. This replaces server/index.js in production — same
// contract: POST /api/chat {prompt} -> {text}, 503 when no key is configured
// so the client falls back to its keyword bot.
//
// Secrets/vars:
//   ANTHROPIC_API_KEY  — set with `npx wrangler secret put ANTHROPIC_API_KEY`
//   ANTHROPIC_MODEL    — optional var in wrangler.jsonc (defaults below)

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (url.pathname === '/api/health') {
      return json({ ok: true, hasKey: !!env.ANTHROPIC_API_KEY, model: env.ANTHROPIC_MODEL || 'claude-sonnet-5' })
    }

    if (url.pathname === '/api/chat') {
      if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)
      let prompt = ''
      try {
        const body = await request.json()
        prompt = (body && body.prompt) || ''
      } catch {
        return json({ error: 'bad_json' }, 400)
      }
      if (!prompt.trim()) return json({ error: 'prompt required' }, 400)
      if (!env.ANTHROPIC_API_KEY) return json({ error: 'no_api_key' }, 503)

      try {
        const resp = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: env.ANTHROPIC_MODEL || 'claude-sonnet-5',
            max_tokens: 600,
            messages: [{ role: 'user', content: prompt }],
          }),
        })
        if (!resp.ok) {
          console.error('[chat] Anthropic API', resp.status, await resp.text())
          return json({ error: 'upstream_failed' }, 502)
        }
        const data = await resp.json()
        const text = (data.content || [])
          .filter((b) => b.type === 'text')
          .map((b) => b.text)
          .join('')
          .trim()
        return json({ text })
      } catch (err) {
        console.error('[chat] Anthropic call failed:', err && err.message)
        return json({ error: 'upstream_failed' }, 502)
      }
    }

    // Everything else: static assets (dist/), with SPA fallback per wrangler.jsonc.
    return env.ASSETS.fetch(request)
  },
}
