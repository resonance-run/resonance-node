import { CustomizationResult } from '../loadCustomizations.js';

const IMPRESSION_EVENT_NAME = 'resonance_impression';
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
    await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${gaTrackingId}&api_secret=${gaAPISecret}`,
      {
        method: 'POST',
        body: JSON.stringify({
          client_id: gaClientId,
          events: [
            {
              name: IMPRESSION_EVENT_NAME,
              params: {
                customization_id: customization.id,
                variation_id: customization.variation.id,
                user_id: userId,
              },
            },
          ],
        }),
      },
    );
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
