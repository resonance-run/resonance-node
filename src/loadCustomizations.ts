import { parse } from 'cookie';
import Cookies from 'js-cookie';
import { mergician } from 'mergician';

import { customizationToFieldsObject } from './util/index.js';

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

interface LoadCustomizationsArgs<K> {
  type: string;
  userData: K;
  baseUrl: string;
  surfaceId?: string;
  apiKey?: string;
  clientId?: string;
  request?: Request;
  defaultValue?: unknown;
}

interface LoadCustomizationArgs<K> {
  type: string;
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
      ? mergician({
          // This custom filter says to ignore custom values that are essentially empty.
          // This includes falsy values and arrays that contain only falsy values
          filter({ srcVal }) {
            return Array.isArray(srcVal)
              ? srcVal.length > 0 && srcVal.every((v) => Boolean(v))
              : Boolean(srcVal) || srcVal === 0;
          },
        })(
          defaultValue,
          customizationToFieldsObject(data.customizations[args.surfaceId]),
        )
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
        customizations: mergician({
          // This custom filter says to ignore custom values that are essentially empty.
          // This includes falsy values and arrays that contain only falsy values
          filter({ srcVal }) {
            return Array.isArray(srcVal)
              ? srcVal.length > 0 && srcVal.every((v) => Boolean(v))
              : Boolean(srcVal) || srcVal === 0;
          },
        })(
          defaultValue,
          Object.entries(data.customizations).reduce(
            (res, [surfaceId, customization]) => {
              res[surfaceId] = customizationToFieldsObject(customization);
              return res;
            },
            Object.create(null),
          ),
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
  type,
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
};
