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
  try {
    const apiKey = resolveApiKey();
    if (!apiKey) {
      console.error('[/api/generate] ANTHROPIC_API_KEY could not be resolved');
      return Response.json({ error: 'API key not configured' }, { status: 500 });
    }

    const anthropic = new Anthropic({ apiKey });

    const body: GenerateRequest = await request.json();
    const { mbtiType, workBackground } = body;

    if (!mbtiType || typeof mbtiType !== 'string') {
      return Response.json({ error: 'mbtiType is required' }, { status: 400 });
    }

    const type = getTypeByCode(mbtiType.toUpperCase());
    if (!type) {
      return Response.json({ error: 'Invalid MBTI type' }, { status: 400 });
    }

    const message = await anthropic.messages.create({
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

    const content = message.content[0];
    if (content.type !== 'text') {
      return Response.json({ error: 'Unexpected response format' }, { status: 500 });
    }

    // Strip any accidental markdown fences before parsing
    const raw = content.text.trim().replace(/^```json\s*/i, '').replace(/```\s*$/, '');
    const profile = JSON.parse(raw);

    return Response.json(profile);
  } catch (err) {
    console.error('[/api/generate]', err);
    const message = err instanceof SyntaxError
      ? 'Failed to parse AI response as JSON'
      : 'Internal server error';
    return Response.json({ error: message }, { status: 500 });
  }
}
