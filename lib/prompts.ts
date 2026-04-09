export const SYSTEM_PROMPT = `You are a career development expert and Jungian-informed personality coach. You combine the rigorous insight of a seasoned career counselor with an understanding of MBTI archetypes. Your tone is warm, direct, and empowering — not generic or flattering. You do not produce fluffy horoscope-style content. Every insight should feel earned and specific. When a user provides work background, weave it into the transferable skills and career path recommendations concretely.

Output exactly 5 lines of NDJSON (newline-delimited JSON). Each line must be a single complete JSON object with no line breaks inside it, followed by a newline. No other text, no markdown, no preamble.`;

export function buildUserPrompt(
  mbtiType: string,
  archetypeName: string,
  workBackground?: string
): string {
  const backgroundSection = workBackground?.trim()
    ? `\n\nThe user has shared their work background: "${workBackground.trim()}"\n\nFor line 3 (skills) and line 4 (paths), personalize by connecting their actual experience to what this type excels at. Be specific.`
    : '';

  return `Generate a Career Archetype profile for the MBTI type ${mbtiType} (${archetypeName}).${backgroundSection}

Output exactly these 5 lines in order, each a single-line JSON object:

Line 1 — intro:
{"section":"intro","archetypeName":"${archetypeName}","tagline":"one evocative sentence — a declaration, not a list of adjectives","essenceDescription":"2-3 sentences describing who this person IS at their core — vivid, not a trait list"}

Line 2 — strengths:
{"section":"strengths","coreStrengths":[{"name":"2-4 word name","description":"one sentence showing this strength in action"}]}

Line 3 — skills:
{"section":"skills","transferableSkills":[{"skill":"3-5 word resume-ready skill name","description":"one sentence on how to articulate this in an interview or on a resume"}]}

Line 4 — paths:
{"section":"paths","careerPaths":[{"title":"specific job title","category":"industry or field","fitScore":85,"whyItFits":"one concrete sentence referencing specific role demands"}]}

Line 5 — environment:
{"section":"environment","workEnvironmentNeeds":["short direct bullet"],"watchOutFor":[{"title":"role or pattern name","description":"1-2 honest sentences on why this looks appealing but drains this type"}],"growthEdge":"one honest constructive paragraph — name the pattern, explain the cost, frame a path forward"}

Hard requirements:
- coreStrengths: exactly 5 items
- transferableSkills: exactly 8 items — concrete and specific to ${mbtiType}
- careerPaths: exactly 6 items, fitScore between 55 and 97
- workEnvironmentNeeds: exactly 4 items
- watchOutFor: exactly 3 items
- Every insight must feel specific to ${mbtiType}, not interchangeable with other types
- Each JSON object must fit on one line with no internal newlines`;
}
