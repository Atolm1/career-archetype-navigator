import fs from 'fs';
import path from 'path';
import Anthropic from '@anthropic-ai/sdk';
import { getTypeByCode } from '@/lib/archetypes';
import { SYSTEM_PROMPT, buildUserPrompt } from '@/lib/prompts';
import type { GenerateRequest } from '@/lib/types';

// Turbopack's route-handler worker doesn't always inject .env.local into
// process.env. Read the file directly as a fallback.
function resolveApiKey(): string | undefined {
  if (process.env.ANTHROPIC_API_KEY) return process.env.ANTHROPIC_API_KEY;
  try {
    const content = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
    const match = content.match(/^ANTHROPIC_API_KEY=(.+)$/m);
    return match?.[1]?.trim();
  } catch {
    return undefined;
  }
}

export async function POST(request: Request) {
  const apiKey = resolveApiKey();
  if (!apiKey) {
    return Response.json({ error: 'API key not configured' }, { status: 500 });
  }

  const body: GenerateRequest = await request.json();
  const { mbtiType, workBackground } = body;

  if (!mbtiType || typeof mbtiType !== 'string') {
    return Response.json({ error: 'mbtiType is required' }, { status: 400 });
  }

  const type = getTypeByCode(mbtiType.toUpperCase());
  if (!type) {
    return Response.json({ error: 'Invalid MBTI type' }, { status: 400 });
  }

  const anthropic = new Anthropic({ apiKey });

  const stream = anthropic.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: buildUserPrompt(type.code, type.archetypeName, workBackground),
      },
    ],
  });

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            controller.enqueue(new TextEncoder().encode(chunk.delta.text));
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
