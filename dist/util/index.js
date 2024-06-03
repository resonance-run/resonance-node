export const customizationToFieldsObject = (customization) => {
    return Object.entries(customization.variation.fields).reduce((res, [key, { value }]) => {
        res[key] = value;
        return res;
    }, {});
};
