import { CustomizationResult } from '../loadCustomizations.js';

export interface CustomizationResource {
  [lang: string]: {
    [namespace: string]: Record<string, string>;
  };
}
export const getCustomizationsFori18next = (
  customizationData: Record<string, CustomizationResult>
): CustomizationResource => {
  const entries = Object.entries(customizationData);
  return entries.reduce((res, [key, customization]) => {
    const lang = customization.locale || 'en';
    const [namespace, stringKey] = key.split(':');
    if (!res[lang]) {
      res[lang] = {};
    }
    if (!res[lang][namespace]) {
      res[lang][namespace] = {};
    }
    if (customization.variation.id !== 'control') {
      res[lang][namespace][stringKey] = customization.variation.fields.stringValue.value;
    }
    return res;
  }, {});
};
