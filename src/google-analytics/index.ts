import { CustomizationResult } from '../loadCustomizations.js';

const IMPRESSION_EVENT_NAME = 'resonance_impression';
const EXPERIENCE_IMPRESSION = 'experience_impression';
export const triggerGAImpressionEvent = async ({
  gaTrackingId,
  gaAPISecret,
  gaClientId,
  customization,
  userId,
}: {
  userId?: string | number;
  customization: CustomizationResult;
  gaTrackingId: string;
  gaAPISecret: string;
  gaClientId: string;
}) => {
  try {
    await Promise.all([
      fetch(
        `https://www.google-analytics.com/mp/collect?measurement_id=${gaTrackingId}&api_secret=${gaAPISecret}`,
        {
          signal: AbortSignal.timeout(1000),
          method: 'POST',
          body: JSON.stringify({
            client_id: gaClientId,
            events: [
              {
                name: IMPRESSION_EVENT_NAME,
                params: {
                  exp_variant_string: `RESAMP-${customization.id}-${customization.variation.id}`,
                  customization_id: customization.id,
                  variation_id: customization.variation.id,
                  user_id: userId,
                },
              },
            ],
          }),
        },
      ),
      fetch(
        `https://www.google-analytics.com/mp/collect?measurement_id=${gaTrackingId}&api_secret=${gaAPISecret}`,
        {
          signal: AbortSignal.timeout(1000),
          method: 'POST',
          body: JSON.stringify({
            client_id: gaClientId,
            events: [
              {
                name: EXPERIENCE_IMPRESSION,
                params: {
                  exp_variant_string: `RESAMP-${customization.id}-${customization.variation.id}`,
                },
              },
            ],
          }),
        },
      ),
    ]);
    return 'success';
  } catch (error) {
    console.error('Error emitting GA Tracking event', error);
    return 'error';
  }
};

export const triggerGABrowserImpressionEvent = async (
  customization: CustomizationResult,
  userId,
  gtag,
) => {
  if (gtag && typeof gtag === 'function') {
    try {
      await gtag('event', IMPRESSION_EVENT_NAME, {
        customization_id: customization.id,
        variation_id: customization.variation.id,
        user_id: userId,
      });
      return 'success';
    } catch (error) {
      console.error('Error emitting GA Tracking event', error);
      return 'error';
    }
  }
};
