export declare enum EVENT_TYPE {
    IMPRESSION = "impression"
}
type ImpressionEventPayload = {
    timestamp: Date;
    variationId: string;
    userData: any;
};
export type AmpEventListener = (event: AmpEvent) => void;
export type AmpEvent = {
    type: EVENT_TYPE;
    payload: ImpressionEventPayload;
};
export declare const addListener: (eventType: EVENT_TYPE, listener: AmpEventListener) => void;
export declare const triggerEvent: (eventType: EVENT_TYPE, eventData: AmpEvent) => void;
export {};
