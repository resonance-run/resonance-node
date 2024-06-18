import { CustomizationResult } from './loadCustomizations.js';
export { loadCustomizations, loadCustomizationDataForI18Next } from './loadCustomizations.js';
export { addListener as addAmpEventListener, EVENT_TYPE } from './events/index.js';
export { customizationToFieldsObject } from './util/index.js';
export default class Resonance {
    baseUrl: string;
    gaTrackingId: string;
    gaAPISecret: string;
    constructor(baseUrl: string);
    initGA(trackingId: string, APISecret: string): void;
    loadCustomizations({ type, userData, request }: {
        type: string;
        userData: unknown;
        request?: Request;
    }): Promise<Record<string, CustomizationResult>>;
    loadCustomizationDataForI18Next<K>({ type, userData, request, }: {
        type: string;
        userData: K;
        request?: Request;
    }): Promise<import("./i18next/index.js").CustomizationResource>;
    customizationsToi18nextObject(customizations: Record<string, CustomizationResult>): import("./i18next/index.js").CustomizationResource;
    customizationToFieldsObject(customization: CustomizationResult): {};
    triggerGAImpressionEvent(customization: CustomizationResult, gaClientId: string, userId: string | number): Promise<"error" | "success">;
    triggerGABrowserImpressionEvent(customization: CustomizationResult, userId: any, gtag: any): void;
}
