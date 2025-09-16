// src/utils/dom-splitter.ts

import * as cheerio from 'cherio';
import { Document } from 'langchain/document';

export interface DOMMetadata {
  url: string;
  tag: string;
  class?: string | undefined;
  id?: string | undefined;
  xpath?: string | null;
}

/**
 * Splits HTML content into Documents per DOM element.
 *
 * @param html - The HTML string to parse.
 * @param url - The URL of the page (stored in metadata).
 * @returns An array of LangChain Documents with metadata.
 */
export function domAwareSplit(html: string, url: string): Document[] {
  const $ = cheerio.load(html);
  const docs: Document[] = [];

  $('*').each((_, el) => {
    const text = $(el).text().trim();
    if (!text) return;

    const metadata: DOMMetadata = {
      url,
      tag: el.tagName,
      class: $(el).attr('class') ?? undefined,
      id: $(el).attr('id') ?? undefined,
      xpath: null, // Optional: you can compute xpath using a plugin if needed
    };

    docs.push(
      new Document({
        pageContent: text,
        metadata,
      })
    );
  });

  return docs;
}
