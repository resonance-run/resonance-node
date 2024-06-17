import { CustomizationResult } from '../loadCustomizations.js';
export interface CustomizationResource {
    [lang: string]: {
        [namespace: string]: Record<string, string>;
    };
}
export declare const getCustomizationsFori18next: (customizationData: Record<string, CustomizationResult>) => CustomizationResource;
