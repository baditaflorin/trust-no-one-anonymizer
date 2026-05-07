import { expect, test } from '@playwright/test';

test('loads the static anonymizer shell', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Trust No One Anonymizer' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
    'href',
    'https://github.com/baditaflorin/trust-no-one-anonymizer',
  );
  await expect(page.getByRole('link', { name: 'PayPal' })).toHaveAttribute(
    'href',
    'https://www.paypal.com/paypalme/florinbadita',
  );
  await expect(page.getByText(/Version .* Commit/)).toBeVisible();

  const seed = page.getByLabel('Seed');
  await seed.fill('activist-demo');
  await expect(seed).toHaveValue('activist-demo');
  await expect(page.getByRole('button', { name: 'Start' })).toBeEnabled();
});
