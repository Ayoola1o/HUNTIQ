/** Converts legacy HTML-only Gmail bodies into readable plain text for the inbox UI. */
export function emailBodyText(value: string): string {
  let text = value || '';
  if (/<(?:html|body|style|script|head|div|p|table|br)\b/i.test(text)) {
    text = text
      .replace(/<(style|script|head)[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<\/(p|div|br|li|tr|h[1-6])\s*>/gi, '\n')
      .replace(/<[^>]+>/g, ' ');
  }

  // Older syncs stripped HTML tags but kept the CSS text inside <style> blocks.
  if (/(?:\{\s*(?:box-sizing|font-family|margin|padding|color|background|display)\s*:|@media\s|@import\s)/i.test(text)) {
    text = text.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/[^{}]+\{[^{}]*\}/g, ' ');
  }

  return text
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
    .replace(/&quot;|&#34;/gi, '"').replace(/&#39;|&apos;/gi, "'")
    .replace(/[ \t]+\n/g, '\n').replace(/\n[ \t]+/g, '\n').replace(/\n{3,}/g, '\n\n')
    .trim();
}
