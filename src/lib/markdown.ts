import { markdownToHtml } from 'satteri';

export function renderMarkdown(source: string): string {
  return markdownToHtml(source).html;
}
