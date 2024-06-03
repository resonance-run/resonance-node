import Cookies from 'js-cookie';
import { parse } from 'cookie';
import { EVENT_TYPE, triggerEvent } from './events/index.js';
import { getCustomizationsFori18next } from './i18next/index.js';
const PREVIEW_COOKIE_NAME = 'resonance.preview';
export const loadCustomizations = async (type, userData, baseUrl, request) => {
    try {
        let previewOverrideCookie;
        if (typeof window === 'object') {
            previewOverrideCookie = Cookies.get(PREVIEW_COOKIE_NAME);
        }
        else {
            const parsedCookies = parse(request.headers.get('cookie') || '');
            previewOverrideCookie = parsedCookies?.[PREVIEW_COOKIE_NAME];
            previewOverrideCookie = previewOverrideCookie ? encodeURIComponent(previewOverrideCookie) : undefined;
        }
        const encodedUserData = encodeURIComponent(JSON.stringify(userData));
        const fullUrl = `${baseUrl}/customizations?userData=${encodedUserData}&customizationType=${type}${previewOverrideCookie ? `&previewOverrides=${previewOverrideCookie}` : ''}`;
        const res = await fetch(fullUrl);
        const data = await res.json();
        Object.entries(data).forEach(([surfaceId, customization]) => {
            triggerEvent(EVENT_TYPE.IMPRESSION, {
                type: EVENT_TYPE.IMPRESSION,
                payload: {
                    variationId: customization.variation.id,
                    timestamp: new Date(),
                    userData,
                },
            });
        });
        return data;
    }
    catch (error) {
        console.log('We had an error');
        // In case of an error, return an empty object instead of killing everything.
        console.error(error);
        return {};
    }
};
export const loadCustomizationDataForI18Next = async (type, userData, baseUrl, request) => {
    const customizationData = await loadCustomizations(type, userData, baseUrl, request);
    return getCustomizationsFori18next(customizationData);
};
