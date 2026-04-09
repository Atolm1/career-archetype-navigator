export const SYSTEM_PROMPT = `You are a career development expert and Jungian-informed personality coach. You combine the rigorous insight of a seasoned career counselor with an understanding of MBTI archetypes. Your tone is warm, direct, and empowering — not generic or flattering. You do not produce fluffy horoscope-style content. Every insight should feel earned and specific. When a user provides work background, weave it into the transferable skills and career path recommendations concretely. Return only valid JSON, no markdown, no preamble.`;

export function buildUserPrompt(
  mbtiType: string,
  archetypeName: string,
  workBackground?: string
): string {
  const backgroundSection = workBackground?.trim()
    ? `\n\nThe user has shared their work background: "${workBackground.trim()}"\n\nFor the transferableSkills and careerPaths sections, personalize the output by connecting their actual experience to what this type excels at. Be specific — reference the kind of work they've done, not just the type's general traits.`
    : '';

  return `Generate a comprehensive Career Archetype profile for the MBTI type ${mbtiType} (${archetypeName}).${backgroundSection}

Return a JSON object with exactly this structure and no other text:
{
  "archetypeName": "${archetypeName}",
  "tagline": "one evocative sentence capturing this archetype's essence — not a list of adjectives, but a declaration",
  "essenceDescription": "2-3 sentences describing who this person IS at their core — not traits, but a vivid portrait of how they move through the world",
  "coreStrengths": [
    { "name": "strength name (2-4 words)", "description": "one sentence showing this strength in action, not just defining it" }
  ],
  "transferableSkills": [
    { "skill": "skill name (3-5 words, resume-ready)", "description": "one sentence on how to articulate this skill in an interview or on a resume" }
  ],
  "careerPaths": [
    { "title": "specific job title or career path", "category": "industry or field", "fitScore": 85, "whyItFits": "one concrete sentence explaining the fit — reference specific role demands, not type generalities" }
  ],
  "workEnvironmentNeeds": [
    "short, direct bullet point — what this type needs to do their best work"
  ],
  "watchOutFor": [
    { "title": "role or pattern name", "description": "honest 1-2 sentence explanation of why this looks appealing but ultimately drains this type" }
  ],
  "growthEdge": "one honest, constructive paragraph about the real growth challenge for this type — name the pattern directly, explain why it holds them back, and frame a path forward without sugarcoating"
}

Hard requirements:
- coreStrengths: exactly 5 items
- transferableSkills: exactly 8 items — concrete, specific to ${mbtiType}, not generic soft skills
- careerPaths: exactly 6 items, fitScore between 55 and 97
- workEnvironmentNeeds: exactly 4 items
- watchOutFor: exactly 3 items
- All text must feel specific to ${mbtiType}, not interchangeable with other types`;
}
