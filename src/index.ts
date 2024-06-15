import { i18n } from 'i18next';
import { loadCustomizations, loadCustomizationDataForI18Next, CustomizationResult } from './loadCustomizations.js';
import { customizationToFieldsObject } from './util/index.js';

export { loadCustomizations, loadCustomizationDataForI18Next } from './loadCustomizations.js';

export { addListener as addAmpEventListener, EVENT_TYPE } from './events/index.js';

export { customizationToFieldsObject } from './util/index.js';

export default class Resonance {
  baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  loadCustomizations(type: string, userData: unknown, request?: Request) {
    return loadCustomizations(type, userData, this.baseUrl, request);
  }

  async loadCustomizationDataForI18Next<K>({
    type,
    userData,
    request,
    i18nextInstance,
  }: {
    type: string;
    userData: K;
    request?: Request;
    i18nextInstance: i18n;
  }) {
    const customizationResources = await loadCustomizationDataForI18Next<K>(type, userData, this.baseUrl, request);
    Object.entries(customizationResources).forEach(([lang, langResource]) => {
      Object.entries(langResource).forEach(([namespace, namespaceResource]) => {
        i18nextInstance.addResourceBundle(lang || 'en', namespace, namespaceResource, true, true);
      });
    });
    return customizationResources;
  }

  customizationToFieldsObject(customization: CustomizationResult) {
    return customizationToFieldsObject(customization);
  }
}
