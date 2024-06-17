export const getCustomizationsFori18next = (customizationData) => {
    const entries = Object.entries(customizationData);
    return entries.reduce((res, [key, customization]) => {
        const lang = customization.locale || 'en';
        const [namespace, stringKey] = key.split(':');
        if (!res[lang]) {
            res[lang] = {};
        }
        if (!res[lang][namespace]) {
            res[lang][namespace] = {};
        }
        if (customization.variation.id !== 'control') {
            res[lang][namespace][stringKey] = customization.variation.fields.stringValue.value;
        }
        return res;
    }, {});
};
