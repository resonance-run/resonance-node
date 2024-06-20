export type CustomizationResult = {
    id: string;
    locale?: string;
    customizationTypeId: string;
    surfaceId: string;
    variation: {
        id: string;
        rampPercent: number;
        fields: Record<string, {
            value: string;
        }>;
    };
};
export declare const loadCustomizations: <K>(type: string, userData: K, baseUrl: string, request?: Request) => Promise<Record<string, CustomizationResult>>;
export declare const loadCustomizationDataForI18Next: <K>(type: string, userData: K, baseUrl: string, request?: Request) => Promise<import("./i18next/index.js").CustomizationResource>;
