import { loadCustomizations, loadCustomizationDataForI18Next, CustomizationResult } from './loadCustomizations.js';
import { customizationToFieldsObject } from './util/index.js';
import { triggerGABrowserImpressionEvent, triggerGAImpressionEvent } from './google-analytics/index.js';
import { getCustomizationsFori18next } from './i18next/index.js';

export { loadCustomizations, loadCustomizationDataForI18Next } from './loadCustomizations.js';

export { addListener as addAmpEventListener, EVENT_TYPE } from './events/index.js';

export { customizationToFieldsObject } from './util/index.js';

export default class Resonance {
  baseUrl: string;
  gaTrackingId: string;
  gaAPISecret: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  initGA(trackingId: string, APISecret: string) {
    this.gaTrackingId = trackingId;
    this.gaAPISecret = APISecret;
  }

  loadCustomizations({ type, userData, request }: { type: string; userData: unknown; request?: Request }) {
    return loadCustomizations(type, userData, this.baseUrl, request);
  }

  async loadCustomizationDataForI18Next<K>({
    type,
    userData,
    request,
  }: {
    type: string;
    userData: K;
    request?: Request;
  }) {
    const customizationResources = await loadCustomizationDataForI18Next<K>(type, userData, this.baseUrl, request);
    return customizationResources;
  }

  customizationsToi18nextObject(customizations: Record<string, CustomizationResult>) {
    return getCustomizationsFori18next(customizations);
  }

  customizationToFieldsObject(customization: CustomizationResult) {
    return customizationToFieldsObject(customization);
  }

  triggerGAImpressionEvent(customization: CustomizationResult, gaClientId: string, userId: string | number) {
    if (!this.gaAPISecret || this.gaTrackingId) {
      console.warn(
        'GA Credentials have not been added. Please use `.initGA(trackingId, APISecret)` before making this call.'
      );
      return;
    }
    return triggerGAImpressionEvent({
      gaTrackingId: this.gaTrackingId,
      gaAPISecret: this.gaAPISecret,
      gaClientId,
      userId,
      customization,
    });
  }

  triggerGABrowserImpressionEvent(customization: CustomizationResult, userId, gtag) {
    triggerGABrowserImpressionEvent(customization, userId, gtag);
  }
}
