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
            const keyParts = stringKey.split('.');
            let nextPart;
            let obj = res[lang][namespace];
            while (keyParts.length) {
                nextPart = keyParts.shift();
                const isLastPart = keyParts.length === 0;
                if (!isLastPart) {
                    if (!obj[nextPart]) {
                        obj[nextPart] = {};
                    }
                    obj = obj[nextPart];
                }
            }
            obj[nextPart] = customization.variation.fields.stringValue.value;
        }
        return res;
    }, {});
};
