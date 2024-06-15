import { CustomizationResult } from '../loadCustomizations.js';
export interface CustomizationResource {
    [lang: string]: {
        [namespace: string]: Record<string, unknown>;
    };
}
export declare const getCustomizationsFori18next: (customizationData: Record<string, CustomizationResult>) => CustomizationResource;
