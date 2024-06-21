import Cookies from 'js-cookie';
import { parse } from 'cookie';

export type CustomizationResult = {
  id: string;
  locale?: string;
  customizationTypeId: string;
  surfaceId: string;
  variation: {
    id: string;
    rampPercent: number;
    fields: Record<string, { value: string }>;
  };
};

const PREVIEW_COOKIE_NAME = 'resonance.preview';

export const loadCustomizations = async <K>(
  type: string,
  userData: K,
  baseUrl: string,
  request?: Request,
) => {
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
    const encodedUserData = encodeURIComponent(JSON.stringify(userData));
    const fullUrl = `${baseUrl}/customizations?userData=${encodedUserData}&customizationType=${type}${
      previewOverrideCookie ? `&previewOverrides=${previewOverrideCookie}` : ''
    }`;
    const res = await fetch(fullUrl);
    const data: Record<string, CustomizationResult> = await res.json();
    return data;
  } catch (error) {
    console.log('We had an error');
    // In case of an error, return an empty object instead of killing everything.
    console.error(error);
    return {};
  }
};
