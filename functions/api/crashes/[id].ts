// Cloudflare Pages Function — serves GET /api/crashes/:id.
// Ported from app/api/crashes/[id]/route.ts.
import { KVCrashRepository, type KVNamespaceLike } from '../../../lib/storage/kv'

export const onRequestGet = async (context: {
  params: { id: string }
  env: { SIGNAGE_KV: KVNamespaceLike }
}): Promise<Response> => {
  const { id } = context.params
  const crash = await new KVCrashRepository(context.env.SIGNAGE_KV).get(id)
  if (!crash) {
    return new Response(JSON.stringify({ error: 'Crash report not found' }), {
      status: 404,
      headers: { 'content-type': 'application/json' },
    })
  }
  return new Response(JSON.stringify(crash), {
    headers: { 'content-type': 'application/json' },
  })
}
