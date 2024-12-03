import {
  triggerGABrowserImpressionEvent,
  triggerGAImpressionEvent,
} from './google-analytics/index.js';
import {
  loadCustomizations,
  CustomizationResult,
  loadCustomization,
} from './loadCustomizations.js';
import { customizationToFieldsObject } from './util/index.js';

export default class Resonance {
  baseUrl: string;
  private apiKey: string;
  private clientId: string;
  private gaTrackingId: string;
  private gaAPISecret: string;

  private isBrowser = typeof window === 'object';

  constructor(
    baseUrl: string,
    apiCredentials?: { clientId: string; apiKey: string },
  ) {
    this.baseUrl = baseUrl;
    if (apiCredentials) {
      if (this.isBrowser) {
        throw new Error(
          'Resonance API credentials cannot be used in a browser environment',
        );
      }
      this.apiKey = apiCredentials.apiKey;
      this.clientId = apiCredentials.clientId;
    }
  }

  initGA(trackingId: string, APISecret: string) {
    this.gaTrackingId = trackingId;
    this.gaAPISecret = APISecret;
  }

  async loadCustomization<K>(args: {
    customizationType: string;
    userData: Record<string, unknown>;
    surfaceId: string;
    request?: Request;
    defaultValue?: K;
  }) {
    const { customization } = await loadCustomization<K>({
      ...args,
      baseUrl: this.baseUrl,
      apiKey: this.apiKey,
      clientId: this.clientId,
    });
    return customization;
  }

  loadCustomizations<K>({
    customizationType,
    userData,
    surfaceId,
    request,
    defaultValue,
  }: {
    customizationType: string;
    userData: unknown;
    surfaceId?: string;
    request?: Request;
    defaultValue?: K;
  }) {
    return loadCustomizations({
      customizationType,
      userData,
      surfaceId,
      baseUrl: this.baseUrl,
      request,
      apiKey: this.apiKey,
      clientId: this.clientId,
      defaultValue,
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
    gtag?: (...args: unknown[]) => void;
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
