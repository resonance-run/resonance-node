const IMPRESSION_EVENT_NAME = 'resonance_impression';
export const triggerGAImpressionEvent = async ({ gaTrackingId, gaAPISecret, gaClientId, customization, userId, }) => {
    try {
        await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${gaTrackingId}&api_secret=${gaAPISecret}`, {
            method: 'POST',
            body: JSON.stringify({
                client_id: gaClientId,
                events: [
                    {
                        name: 'resonance_impression',
                        params: {
                            customization_id: customization.id,
                            variation_id: customization.variation.id,
                            user_id: userId,
                        },
                    },
                ],
            }),
        });
        return 'success';
    }
    catch (error) {
        console.error('Error emitting GA Tracking event', error);
        return 'error';
    }
};
export const triggerGABrowserImpressionEvent = (customization, userId, gtag) => {
    gtag('event', IMPRESSION_EVENT_NAME, {
        customization_id: customization.id,
        variation_id: customization.variation.id,
        user_id: userId,
    });
};
