// lib/domain-check.ts

import { headers } from 'next/headers';

export type AppMode = 'saas' | 'storefront';

export async function checkAppMode(): Promise<AppMode> {
  try {
    // Get the host from request headers
    const headersList = await headers();
    const host = headersList.get('host');
    const storeId = headersList.get('x-store-id');

    if (!host) {
      throw new Error('No host found in request headers');
    }

    // Get the expected domain from environment variables
    const saasDomain = process.env.SAAS_SITE_NAME;
    const saasStoreId = process.env.SAAS_STORE_ID


    if (saasDomain && host === saasDomain) return 'saas';
    if (saasStoreId && storeId === saasStoreId) return 'saas';


    return "storefront"

  } catch (error) {
    console.error('Error checking domain:', error);
    throw new Error(error as string)
  }
}
