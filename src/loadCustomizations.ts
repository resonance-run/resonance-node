import { parse } from 'cookie';
import Cookies from 'js-cookie';

export interface CustomizationResult {
  id: string;
  locale?: string;
  customizationTypeId: string;
  surfaceId: string;
  variation: {
    id: string;
    rampPercent: number;
    fields: Record<string, { value: string }>;
  };
}

const PREVIEW_COOKIE_NAME = 'resonance.preview';

export const loadCustomizations = async <K>({
  type,
  userData,
  baseUrl,
  surfaceId,
  apiKey,
  clientId,
  request,
}: {
  type: string;
  userData: K;
  baseUrl: string;
  surfaceId?: string;
  apiKey?: string;
  clientId?: string;
  request?: Request;
}): Promise<{
  userData: Record<string, unknown>;
  customizations: Record<string, CustomizationResult>;
}> => {
  try {
    let previewOverrideCookie;
    if (typeof window === 'object') {
      previewOverrideCookie = Cookies.get(PREVIEW_COOKIE_NAME);
    } else {
      const parsedCookies = parse(request.headers.get('cookie') || '');
      previewOverrideCookie = parsedCookies?.[PREVIEW_COOKIE_NAME];
      previewOverrideCookie = previewOverrideCookie
        ? encodeURIComponent(previewOverrideCookie)
        : undefined;
    }
    const body = {
      userData,
      customizationType: type,
      surfaceId,
      previewOverrides: previewOverrideCookie,
      apiKey,
      clientId,
    };
    const fullUrl = `${baseUrl}/customizations`;
    const res = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data: {
      userData: Record<string, unknown>;
      customizations: Record<string, CustomizationResult>;
    } = await res.json();
    return data;
  } catch (error) {
    console.log(
      'An error occurred in the Resonance Node SDK while trying to load customizations:',
    );
    // In case of an error, return an empty object instead of killing everything.
    console.error(error);
    return { userData: {}, customizations: {} };
  }
};
