import {
  loadCustomization,
  loadCustomizations,
} from './__mocks__/loadCustomizations.js';
import {
  triggerGABrowserImpressionEvent,
  triggerGAImpressionEvent,
} from './google-analytics/__mocks__/index.js';
import { CustomizationResult } from './loadCustomizations.js';
import { customizationToFieldsObject } from './util/__mocks__/index.js';

import Resonance from './index.js';

vi.mock('./loadCustomizations');
vi.mock('./util/index');
vi.mock('./google-analytics/index');
describe('Resonance class', () => {
  const customization: CustomizationResult = {
    id: 'cust-id',
    customizationTypeId: 'resonance-copy',
    surfaceId: 'surface-one',
    variation: {
      id: '123',
      rampPercent: 50,
      fields: {
        stringValue: {
          value: 'Try me',
        },
      },
    },
  };
  describe('constructor', () => {
    test('adds the baseUrl', () => {
      const instance = new Resonance('https://www.example.com');
      expect(instance.baseUrl).toBe('https://www.example.com');
    });

    test('all public methods are present', () => {
      const instance = new Resonance('https://www.example.com');
      expect(instance.initGA).toBeTypeOf('function');
      expect(instance.loadCustomizations).toBeTypeOf('function');
      expect(instance.customizationToFieldsObject).toBeTypeOf('function');
      expect(instance.triggerGAImpressionEvent).toBeTypeOf('function');
    });
  });

  test('loadCustomizations', () => {
    const baseUrl = 'https://www.example.com';
    const customizationType = 'resonance-copy';
    const userData = { id: 'user-id-123' };
    const request = new Request('https://www.example.com');

    const instance = new Resonance(baseUrl);
    instance.loadCustomizations({
      customizationType,
      userData,
      request,
    });
    expect(loadCustomizations).toHaveBeenCalled();
    expect(loadCustomizations).toHaveBeenCalledWith({
      customizationType,
      userData,
      surfaceId: undefined,
      baseUrl: instance.baseUrl,
      request,
      apiKey: undefined,
      clientId: undefined,
      defaultValue: undefined,
    });
  });

  test('loadCustomizations with surfaceId', () => {
    const baseUrl = 'https://www.example.com';
    const customizationType = 'resonance-copy';
    const surfaceId = 'common:nav-1234';
    const userData = { id: 'user-id-123' };
    const request = new Request('https://www.example.com');

    const instance = new Resonance(baseUrl);
    instance.loadCustomizations({
      customizationType,
      userData,
      surfaceId,
      request,
    });
    expect(loadCustomizations).toHaveBeenLastCalledWith({
      customizationType,
      userData,
      surfaceId,
      baseUrl,
      request,
      apiKey: undefined,
      clientId: undefined,
      defaultValue: undefined,
    });
  });

  describe('loadCustomization', () => {
    test('loadCustomization without defaultValue', () => {
      const baseUrl = 'https://www.example.com';
      const customizationType = 'resonance-copy';
      const surfaceId = 'common:nav-1234';
      const userData = { id: 'user-id-123' };
      const request = new Request('https://www.example.com');

      const instance = new Resonance(baseUrl);
      instance.loadCustomization({
        customizationType,
        userData,
        surfaceId,
        request,
      });
      expect(loadCustomization).toHaveBeenLastCalledWith({
        customizationType,
        userData,
        surfaceId,
        baseUrl,
        request,
        apiKey: undefined,
        clientId: undefined,
        defaultValue: undefined,
      });
    });

    test('loadCustomization with defaultValue', () => {
      const baseUrl = 'https://www.example.com';
      const customizationType = 'resonance-copy';
      const surfaceId = 'common:nav-1234';
      const userData = { id: 'user-id-123' };
      const request = new Request('https://www.example.com');
      const defaultValue = {
        abc: 'def',
      };

      const instance = new Resonance(baseUrl);
      instance.loadCustomization({
        customizationType,
        userData,
        surfaceId,
        request,
        defaultValue,
      });
      expect(loadCustomization).toHaveBeenLastCalledWith({
        customizationType,
        userData,
        surfaceId,
        baseUrl,
        request,
        apiKey: undefined,
        clientId: undefined,
        defaultValue,
      });
    });

    test('loadCustomization return value', async () => {
      const baseUrl = 'https://www.example.com';
      const type = 'resonance-copy';
      const surfaceId = 'common:nav-1234';
      const userData = { id: 'user-id-123' };
      const request = new Request('https://www.example.com');
      const defaultValue = {
        abc: 'def',
      };

      loadCustomization.mockResolvedValue({
        customization: { abc: 'hello' },
        userData,
      });

      const instance = new Resonance(baseUrl);
      const result = await instance.loadCustomization({
        customizationType: type,
        userData,
        surfaceId,
        request,
        defaultValue,
      });
      expect(result).toStrictEqual({
        abc: 'hello',
      });
    });
  });

  test('customizationToFieldsObject', () => {
    const baseUrl = 'https://www.example.com';
    const instance = new Resonance(baseUrl);
    instance.customizationToFieldsObject(customization);
    expect(customizationToFieldsObject).toHaveBeenCalledOnce();
    expect(customizationToFieldsObject).toHaveBeenCalledWith(customization);
  });

  describe('triggerGAImpressionEvent', () => {
    describe('Node environment', () => {
      test('Does not make call if `initGA` has not been called', () => {
        const baseUrl = 'https://www.example.com';
        const instance = new Resonance(baseUrl);
        instance.triggerGAImpressionEvent({
          customization,
          gaClientId: 'G-123j4kl2',
          userId: 'user-id-123',
        });
        expect(triggerGAImpressionEvent).not.toHaveBeenCalled();
      });

      test('Does not make call if gaClientId is not supplied', () => {
        const secret = 'NoOneCanKnowThis';
        const id = '12345';
        const baseUrl = 'https://www.example.com';
        const instance = new Resonance(baseUrl);
        instance.initGA(id, secret);
        instance.triggerGAImpressionEvent({
          customization,
          userId: 'user-id-123',
        });
        expect(triggerGAImpressionEvent).not.toHaveBeenCalled();
      });

      test('Makes call once GA credentials are ready', () => {
        const baseUrl = 'https://www.example.com';
        const id = '12345';
        const secret = 'NoOneCanKnowThis';
        const gaClientId = 'G-123j4kl2';
        const userId = 'user-id-123';
        const instance = new Resonance(baseUrl);
        instance.initGA(id, secret);
        instance.triggerGAImpressionEvent({
          customization,
          gaClientId,
          userId,
        });
        expect(triggerGAImpressionEvent).toHaveBeenCalled();
        expect(triggerGAImpressionEvent).toHaveBeenCalledWith({
          gaTrackingId: id,
          gaAPISecret: secret,
          gaClientId,
          userId,
          customization,
        });
      });
    });

    describe('Browser environment', () => {
      beforeEach(() => {
        vi.stubGlobal('window', {});
      });
      afterEach(() => {
        vi.unstubAllGlobals();
      });

      test('Throws an error when calling constructor with API credentials in the browser', () => {
        expect(() => {
          new Resonance('https://www.example.com', {
            clientId: 'cfed1234',
            apiKey: '1234-example',
          });
        }).toThrow();
      });

      test('Does not call when gtag is not supplied', () => {
        const userId = 'user-id-123';
        const baseUrl = 'https://www.example.com';
        const instance = new Resonance(baseUrl);
        instance.triggerGAImpressionEvent({ customization, userId });
        expect(triggerGABrowserImpressionEvent).not.toHaveBeenCalled();
      });

      test('Does not call when gtag is not a function', () => {
        const gtag = 'this is not a function!';
        const userId = 'user-id-123';
        const baseUrl = 'https://www.example.com';
        const instance = new Resonance(baseUrl);
        // @ts-expect-error Consumers may not be using typescript, so we need to handle this
        instance.triggerGAImpressionEvent({ customization, userId, gtag });
        expect(triggerGABrowserImpressionEvent).not.toHaveBeenCalled();
      });

      test('Calls when gtag is supplied', () => {
        const gtag = vi.fn();
        const userId = 'user-id-123';
        const baseUrl = 'https://www.example.com';
        const instance = new Resonance(baseUrl);
        instance.triggerGAImpressionEvent({ customization, userId, gtag });
        expect(triggerGABrowserImpressionEvent).toHaveBeenCalled();
      });
    });
  });
});
