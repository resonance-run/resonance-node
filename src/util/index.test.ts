import { CustomizationResult } from '~/loadCustomizations.js';
import { customizationToFieldsObject } from '~/util/index.js';

describe('util', () => {
  describe('customizationToFieldsObject', () => {
    const mockCustomizationResult: CustomizationResult = {
      id: 'some-id',
      customizationTypeId: 'customization-type',
      surfaceId: 'SOME_ID',
      variation: {
        id: 'variation-id',
        rampPercent: 100,
        fields: {
          a: {
            value: 'bc',
          },
        },
      },
    };
    test('returns an object', () => {
      expect(customizationToFieldsObject(mockCustomizationResult)).toBeTypeOf(
        'object',
      );
    });

    test('returns the values of the fields', () => {
      expect(customizationToFieldsObject(mockCustomizationResult)).toEqual({
        a: 'bc',
      });
    });

    test('nested fields', () => {
      const mockCustomizationResult: CustomizationResult = {
        id: 'some-id',
        customizationTypeId: 'customization-type',
        surfaceId: 'SOME_ID',
        variation: {
          id: 'variation-id',
          rampPercent: 100,
          fields: {
            a: {
              value: 'bc',
            },
            items: {
              fields: [
                {
                  c: { value: 'de' },
                  xk: { value: 'cd' },
                },
                {
                  c: { value: 'ede' },
                  xk: { value: 'dc' },
                },
              ],
            },
          },
        },
      };

      expect(customizationToFieldsObject(mockCustomizationResult)).toEqual({
        a: 'bc',
        items: [
          { c: 'de', xk: 'cd' },
          { c: 'ede', xk: 'dc' },
        ],
      });
    });
  });
});
