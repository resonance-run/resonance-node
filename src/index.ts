import {
  loadCustomizations,
  CustomizationResult,
} from './loadCustomizations.js';
import { customizationToFieldsObject } from './util/index.js';
import {
  triggerGABrowserImpressionEvent,
  triggerGAImpressionEvent,
} from './google-analytics/index.js';

export default class Resonance {
  baseUrl: string;
  gaTrackingId: string;
  gaAPISecret: string;
  private isBrowser = typeof window === 'object';

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  initGA(trackingId: string, APISecret: string) {
    this.gaTrackingId = trackingId;
    this.gaAPISecret = APISecret;
  }

  loadCustomizations({
    type,
    userData,
    surfaceId,
    request,
  }: {
    type: string;
    userData: unknown;
    surfaceId?: string;
    request?: Request;
  }) {
    return loadCustomizations({
      type,
      userData,
      surfaceId,
      baseUrl: this.baseUrl,
      request,
    });
  }

  customizationToFieldsObject(customization: CustomizationResult) {
    return customizationToFieldsObject(customization);
  }

  triggerGAImpressionEvent({
    customization,
    userId,
    gaClientId,
    gtag,
  }: {
    customization: CustomizationResult;
    userId: string | number;
    gaClientId?: string;
    gtag?: (...args: any[]) => void;
  }) {
    if (this.isBrowser) {
      if (gtag && typeof gtag === 'function') {
        return triggerGABrowserImpressionEvent(customization, userId, gtag);
      }
      console.warn(
        'gtag is required and must be a function when calling this method in the browser',
      );
      return false;
    }
    if (this.gaAPISecret && this.gaTrackingId) {
      if (gaClientId) {
        return triggerGAImpressionEvent({
          gaTrackingId: this.gaTrackingId,
          gaAPISecret: this.gaAPISecret,
          gaClientId,
          userId,
          customization,
        });
      }
      console.warn('gaClientId is required when calling this method in Node');
      return false;
    }
    console.warn(
      'GA Credentials have not been added. Please use `.initGA(trackingId, APISecret)` before making this call.',
    );
    return false;
  }
}
