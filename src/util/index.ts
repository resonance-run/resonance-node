import { CustomizationResult } from '../loadCustomizations.js';

export const customizationToFieldsObject = (
  customization: CustomizationResult,
) => {
  return Object.entries(customization?.variation?.fields || {}).reduce(
    (res, [key, { value, fields }]) => {
      if (value !== undefined && value !== '') {
        res[key] = value;
      }
      if (fields) {
        res[key] = fields.map((innerField) => {
          return Object.entries(innerField).reduce(
            (innerRes, [nestedName, nestedField]) => {
              if (nestedField.value && nestedField.value !== '') {
                innerRes[nestedName] = nestedField.value;
              }
              return innerRes;
            },
            {},
          );
        }, {});
      }
      return res;
    },
    Object.create(null),
  );
};
