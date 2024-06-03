export type CustomizationResult = {
    id: number;
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
export declare const loadCustomizations: <K>(type: string, userData: K, request?: Request) => Promise<Record<string, CustomizationResult>>;
export declare const loadCustomizationDataForI18Next: <K>(type: string, userData: K, request?: Request) => Promise<{}>;
