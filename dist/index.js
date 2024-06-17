import { loadCustomizations, loadCustomizationDataForI18Next } from './loadCustomizations.js';
import { customizationToFieldsObject } from './util/index.js';
export { loadCustomizations, loadCustomizationDataForI18Next } from './loadCustomizations.js';
export { addListener as addAmpEventListener, EVENT_TYPE } from './events/index.js';
export { customizationToFieldsObject } from './util/index.js';
export default class Resonance {
    baseUrl;
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }
    loadCustomizations(type, userData, request) {
        return loadCustomizations(type, userData, this.baseUrl, request);
    }
    async loadCustomizationDataForI18Next({ type, userData, request, i18nextInstance, }) {
        const customizationResources = await loadCustomizationDataForI18Next(type, userData, this.baseUrl, request);
        return customizationResources;
    }
    customizationToFieldsObject(customization) {
        return customizationToFieldsObject(customization);
    }
}
