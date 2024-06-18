import { loadCustomizations, loadCustomizationDataForI18Next } from './loadCustomizations.js';
import { customizationToFieldsObject } from './util/index.js';
import { triggerGABrowserImpressionEvent, triggerGAImpressionEvent } from './google-analytics/index.js';
import { getCustomizationsFori18next } from './i18next/index.js';
export { loadCustomizations, loadCustomizationDataForI18Next } from './loadCustomizations.js';
export { addListener as addAmpEventListener, EVENT_TYPE } from './events/index.js';
export { customizationToFieldsObject } from './util/index.js';
export default class Resonance {
    baseUrl;
    gaTrackingId;
    gaAPISecret;
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }
    initGA(trackingId, APISecret) {
        this.gaTrackingId = trackingId;
        this.gaAPISecret = APISecret;
    }
    loadCustomizations({ type, userData, request }) {
        return loadCustomizations(type, userData, this.baseUrl, request);
    }
    async loadCustomizationDataForI18Next({ type, userData, request, }) {
        const customizationResources = await loadCustomizationDataForI18Next(type, userData, this.baseUrl, request);
        return customizationResources;
    }
    customizationsToi18nextObject(customizations) {
        return getCustomizationsFori18next(customizations);
    }
    customizationToFieldsObject(customization) {
        return customizationToFieldsObject(customization);
    }
    triggerGAImpressionEvent(customization, gaClientId, userId) {
        if (!this.gaAPISecret || this.gaTrackingId) {
            console.warn('GA Credentials have not been added. Please use `.initGA(trackingId, APISecret)` before making this call.');
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
    triggerGABrowserImpressionEvent(customization, userId, gtag) {
        triggerGABrowserImpressionEvent(customization, userId, gtag);
    }
}
