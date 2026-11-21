/**
 * Safely converts single-backtick markdown inline code (e.g. `npm run dev`)
 * inside plain HTML text segments into <code>...</code> tags.
 *
 * Strictly skips:
 * - <pre>...</pre> (syntax-highlighted code blocks)
 * - <code>...</code> (already formatted inline code)
 * - <script>...</script>, <style>...</style>, <svg>...</svg> (RawHtml embeds)
 * - All HTML tags and their attributes (<...>)
 * - Triple/double backticks and empty/whitespace-only backtick pairs
 */
export function formatInlineCode(html: string): string {
  if (!html || !html.includes("`")) return html;

  const protectedOrTagRegex = /<(pre|code|script|style|svg)\b[^>]*>[\s\S]*?<\/\1>|<[^>]+>/gi;
  const inlineBacktickRegex = /(^|[^`])`([^`\r\n]+)`(?!`)/g;

  const replaceInline = (segment: string) =>
    segment.replace(inlineBacktickRegex, (fullMatch, prefix: string, code: string) =>
      code.trim().length > 0 ? `${prefix}<code>${code}</code>` : fullMatch,
    );

  let result = "";
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = protectedOrTagRegex.exec(html)) !== null) {
    if (match.index > lastIndex) {
      result += replaceInline(html.slice(lastIndex, match.index));
    }
    result += match[0];
    lastIndex = protectedOrTagRegex.lastIndex;
  }

  if (lastIndex < html.length) {
    result += replaceInline(html.slice(lastIndex));
  }

  return result;
}
