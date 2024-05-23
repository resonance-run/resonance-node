export enum EVENT_TYPE {
  IMPRESSION = 'impression',
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

const listeners: Record<EVENT_TYPE, AmpEventListener[]> = {
  [EVENT_TYPE.IMPRESSION]: [],
};
export const addListener = (eventType: EVENT_TYPE, listener: AmpEventListener) => {
  console.log('add a listener');
  listeners[eventType].push(listener);
};

export const triggerEvent = (eventType: EVENT_TYPE, eventData: AmpEvent) => {
  listeners[eventType].forEach(cb => cb(eventData));
};
