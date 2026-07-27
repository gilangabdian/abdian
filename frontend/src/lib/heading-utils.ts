export interface TocItem {
  id: string;
  text: string;
  level: string;
}

export interface ProcessedHtml {
  processedHtml: string;
  toc: TocItem[];
}

/**
 * Injects `id` attributes into <h2> and <h3> tags that don't already have one.
 * IDs are generated from the heading's text content (lowercase, hyphenated).
 * Also returns the extracted ToC items synchronously from the HTML string.
 *
 * This avoids relying on DOM querySelectorAll timing in useEffect,
 * preventing race conditions with Turbopack / React.memo caching.
 */
export function injectHeadingIds(html: string): ProcessedHtml {
  if (!html) return { processedHtml: html, toc: [] };

  const toc: TocItem[] = [];
  let idx = 0;

  const processedHtml = html.replace(
    /<h([2-3])(\s[^>]*)?>([\s\S]*?)<\/h\1>/gi,
    (match, level, attrs, innerContent) => {
      idx++;

      // Strip inner HTML tags to get clean text
      const textContent = innerContent.replace(/<[^>]*>/g, "").trim();

      // Check if heading already has an id attribute
      if (attrs && /\bid\s*=/i.test(attrs)) {
        const idMatch = attrs.match(/\bid\s*=\s*"([^"]+)"/i);
        const id = idMatch ? idMatch[1] : `heading-${level}-${idx}`;
        toc.push({ id, text: textContent, level: `h${level}` });
        return match;
      }

      // Generate ID from text content
      const id =
        textContent
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]/g, "") || `heading-${level}-${idx}`;

      toc.push({ id, text: textContent, level: `h${level}` });

      // Inject id into the opening tag
      return `<h${level}${attrs || ""} id="${id}">${innerContent}</h${level}>`;
    },
  );

  return { processedHtml, toc };
}
