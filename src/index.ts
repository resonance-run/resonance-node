import {
  triggerGABrowserImpressionEvent,
  triggerGAImpressionEvent,
} from './analytics/google-analytics/impressions.js';
import { triggerStatSigImpressionEvent } from './analytics/stat-sig/impressions.js';
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
  private gaClientId: string;
  private statSigApiKey: string;

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

  initGA(trackingId: string, APISecret: string, clientId: string) {
    this.gaTrackingId = trackingId;
    this.gaAPISecret = APISecret;
    this.gaClientId = clientId;
  }

  initStatSig(apiKey: string) {
    this.statSigApiKey = apiKey;
  }

  async loadCustomization<K>(args: {
    customizationType: string;
    userData: Record<string, unknown>;
    surfaceId: string;
    request?: Request;
    defaultValue?: K;
    timeout?: number;
  }) {
    const { customization, rawCustomization } = await loadCustomization<K>({
      ...args,
      baseUrl: this.baseUrl,
      apiKey: this.apiKey,
      clientId: this.clientId,
    });
    this.triggerAnalytics(rawCustomization, args.userData);
    return customization;
  }

  loadCustomizations<K>({
    customizationType,
    userData,
    surfaceId,
    request,
    defaultValue,
    timeout,
  }: {
    customizationType: string;
    userData: unknown;
    surfaceId?: string;
    request?: Request;
    defaultValue?: K;
    timeout?: number;
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
      timeout,
    });
  }

  customizationToFieldsObject(customization: CustomizationResult) {
    return customizationToFieldsObject(customization);
  }

  triggerAnalytics(customization: CustomizationResult, userData: unknown) {
    const userId = (
      typeof userData === 'object' && 'id' in userData ? userData.id : undefined
    ) as string | number;
    if (this.gaTrackingId) {
      triggerGAImpressionEvent({
        customization,
        userId,
        gaClientId: this.gaClientId,
        gaAPISecret: this.gaAPISecret,
        gaTrackingId: this.gaTrackingId,
      });
    }
    if (this.statSigApiKey) {
      triggerStatSigImpressionEvent({
        customization,
        userId,
        statSigApiKey: this.statSigApiKey,
      });
    }
  }

  triggerGAImpressionEvent({
    customization,
    userId,
    gaClientId,
    gtag,
  }: {
    customization: CustomizationResult;
    userId?: string | number;
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
