import { CustomizationResult } from './loadCustomizations.js';
export { loadCustomizations, loadCustomizationDataForI18Next } from './loadCustomizations.js';
export { addListener as addAmpEventListener, EVENT_TYPE } from './events/index.js';
export { customizationToFieldsObject } from './util/index.js';
export default class Resonance {
    baseUrl: string;
    constructor(baseUrl: string);
    loadCustomizations(type: string, userData: unknown, request?: Request): Promise<Record<string, CustomizationResult>>;
    loadCustomizationDataForI18Next(type: string, userData: unknown, request?: Request): Promise<{}>;
    customizationToFieldsObject(customization: CustomizationResult): {};
}
