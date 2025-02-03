import { CustomizationResult } from '~/loadCustomizations.js';

const EVENT_NAME = 'resonance_impression';

const statSigImpressionUrl =
  'https://api.statsig.com/v1/webhooks/event_webhook';
export const triggerStatSigImpressionEvent = ({
  statSigApiKey,
  userId,
  customization,
}: {
  statSigApiKey: string;
  customization: CustomizationResult;
  userId?: string | number;
}) => {
  const headers = new Headers();
  headers.append('STATSIG-API-KEY', statSigApiKey);
  return fetch(statSigImpressionUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      user: {
        userId: userId ? '' + userId : undefined,
      },
      eventName: EVENT_NAME,
      value: '',
      timestamp: Date.now(),
      metadata: {
        customizationId: customization.id,
        variationId: customization.variation.id,
        userId,
      },
    }),
  });
};
