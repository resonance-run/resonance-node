import { CustomizationResult } from '../loadCustomizations.js';
export declare const triggerGAImpressionEvent: ({ gaTrackingId, gaAPISecret, gaClientId, customization, userId, }: {
    userId?: string | number;
    customization: CustomizationResult;
    gaTrackingId: string;
    gaAPISecret: string;
    gaClientId: string;
}) => Promise<"error" | "success">;
export declare const triggerGABrowserImpressionEvent: (customization: CustomizationResult, userId: any, gtag: any) => void;
