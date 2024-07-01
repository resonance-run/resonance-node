import { CustomizationResult } from '../loadCustomizations.js';

export const customizationToFieldsObject = (
  customization: CustomizationResult,
) => {
  return Object.entries(customization?.variation?.fields || {}).reduce(
    (res, [key, { value }]) => {
      if (value !== '') {
        res[key] = value;
      }
      return res;
    },
    {},
  );
};
