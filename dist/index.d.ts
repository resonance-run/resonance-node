import { i18n } from 'i18next';
import { CustomizationResult } from './loadCustomizations.js';
export { loadCustomizations, loadCustomizationDataForI18Next } from './loadCustomizations.js';
export { addListener as addAmpEventListener, EVENT_TYPE } from './events/index.js';
export { customizationToFieldsObject } from './util/index.js';
export default class Resonance {
    baseUrl: string;
    constructor(baseUrl: string);
    loadCustomizations(type: string, userData: unknown, request?: Request): Promise<Record<string, CustomizationResult>>;
    loadCustomizationDataForI18Next<K>({ type, userData, request, i18nextInstance, }: {
        type: string;
        userData: K;
        request?: Request;
        i18nextInstance: i18n;
    }): Promise<import("./i18next/index.js").CustomizationResource>;
    customizationToFieldsObject(customization: CustomizationResult): {};
}
