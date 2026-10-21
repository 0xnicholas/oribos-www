import { expect, type Page } from '@playwright/test';

export function sentenceCount(text: string): number {
  return text
    .trim()
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean).length;
}

export async function expectNoCustomerProof(page: Page): Promise<void> {
  const main = page.locator('main');

  await expect(
    main.locator('img, blockquote, [data-testimonial], [data-customer-logo]'),
  ).toHaveCount(0);
  await expect(main).not.toContainText(/trusted by|used by \d|testimonial/i);
}
