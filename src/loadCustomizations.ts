import { parse } from 'cookie';
import Cookies from 'js-cookie';

import { customizationToFieldsObject } from './util/index.js';

export interface CustomizationResult {
  id: string;
  locale?: string;
  customizationTypeId: string;
  surfaceId: string;
  variation: {
    id: string;
    rampPercent: number;
    fields: Record<
      string,
      { value?: string; fields?: Record<string, { value: string }>[] }
    >;
  };
}

const PREVIEW_COOKIE_NAME = 'resonance.preview';

interface LoadCustomizationsArgs<K> {
  customizationType: string;
  userData: K;
  baseUrl: string;
  surfaceId?: string;
  apiKey?: string;
  clientId?: string;
  request?: Request;
  defaultValue?: unknown;
}

interface LoadCustomizationArgs<K> {
  customizationType: string;
  userData: K;
  baseUrl: string;
  surfaceId: string;
  apiKey?: string;
  clientId?: string;
  request?: Request;
  defaultValue?: unknown;
}

export const loadCustomization = async <K>(args: LoadCustomizationArgs<K>) => {
  const { defaultValue = {} } = args;
  try {
    const data = await fetchCustomizations(args);

    const customization = data.customizations[args.surfaceId]
      ? customizationToFieldsObject(data.customizations[args.surfaceId])
      : defaultValue;
    return { customization, userData: data.userData };
  } catch (error) {
    console.log(
      'An error occurred in the Resonance Node SDK while trying to load customizations:',
    );
    // In case of an error, return an empty object instead of killing everything.
    console.error(error);
    return { userData: args.userData, customization: defaultValue ?? {} };
  }
};

export const loadCustomizations = async <K>(
  args: LoadCustomizationsArgs<K>,
): Promise<{
  userData: Record<string, unknown>;
  customizations: Record<string, CustomizationResult>;
}> => {
  const { defaultValue } = args;
  try {
    const data = await fetchCustomizations(args);
    if (
      defaultValue &&
      typeof defaultValue === 'object' &&
      !Array.isArray(defaultValue)
    ) {
      return {
        userData: data.userData,
        // mergician does a deep merge on the objects
        customizations: Object.entries(data.customizations).reduce(
          (res, [surfaceId, customization]) => {
            res[surfaceId] = customizationToFieldsObject(customization);
            return res;
          },
          Object.create(null),
        ),
      };
    }
    return data;
  } catch (error) {
    console.log(
      'An error occurred in the Resonance Node SDK while trying to load customizations:',
    );
    // In case of an error, return defaultValue or an empty object instead of killing everything.
    console.error(error);
    // @ts-expect-error: We have to assume these are the right types
    return { userData: args.userData, customizations: defaultValue ?? {} };
  }
};

const fetchCustomizations = async <K>({
  request,
  userData,
  surfaceId,
  customizationType,
  apiKey,
  clientId,
  baseUrl,
}: Omit<LoadCustomizationsArgs<K>, 'defaultValue'>) => {
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
    customizationType,
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
};
