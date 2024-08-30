import { CustomizationResult } from '../loadCustomizations.js';

export const customizationToFieldsObject = (
  customization: CustomizationResult,
) => {
  return Object.entries(customization?.variation?.fields || {}).reduce(
    (res, [key, { value, fields }]) => {
      if (value && value !== '') {
        res[key] = value;
      }
      if (fields) {
        res[key] = fields;
      }
      return res;
    },
    Object.create(null),
  );
};
