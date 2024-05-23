import { EVENT_TYPE, triggerEvent } from './events/index.js';
import { getCustomizationsFori18next } from './i18next/index.js';

export type CustomizationResult = {
  id: number;
  locale?: string;
  customizationTypeId: string;
  surfaceId: string;
  variation: {
    id: string;
    rampPercent: number;
    fields: Record<string, { value: string }>;
  };
};

export const loadCustomizations = async <K>(type: string, userData: K) => {
  try {
    const baseUrl = `http://localhost:4500`;
    const encodedUserData = encodeURIComponent(JSON.stringify(userData));
    const fullUrl = `${baseUrl}/customizations?userData=${encodedUserData}&customizationType=${type}`;
    const res = await fetch(fullUrl);
    const data: Record<string, CustomizationResult> = await res.json();
    Object.entries(data).forEach(([surfaceId, customization]) => {
      triggerEvent(EVENT_TYPE.IMPRESSION, {
        type: EVENT_TYPE.IMPRESSION,
        payload: {
          variationId: customization.variation.id,
          timestamp: new Date(),
          userData,
        },
      });
    });
    return data;
  } catch (error) {
    console.log('We had an error');
    // In case of an error, return an empty object instead of killing everything.
    console.error(error);
    return {};
  }
};

export const loadCustomizationDataForI18Next = async <K>(type: string, userData: K) => {
  const customizationData = await loadCustomizations(type, userData);
  return getCustomizationsFori18next(customizationData);
};
