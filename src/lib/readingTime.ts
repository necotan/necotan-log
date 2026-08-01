const CHARACTERS_PER_MINUTE = 500;

export function estimateReadingMinutes(rawMarkdown: string): number {
  const charCount = rawMarkdown.replace(/\s+/g, '').length;
  return Math.max(1, Math.ceil(charCount / CHARACTERS_PER_MINUTE));
}
