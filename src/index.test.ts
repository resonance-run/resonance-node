import { loadCustomizations } from './__mocks__/loadCustomizations.js';
import {
  triggerGABrowserImpressionEvent,
  triggerGAImpressionEvent,
} from './google-analytics/__mocks__/index.js';
import Resonance from './index.js';
import { CustomizationResult } from './loadCustomizations.js';
import { customizationToFieldsObject } from './util/__mocks__/index.js';

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

  test('initGA', () => {
    const id = '12345';
    const secret = 'NoOneCanKnowThis';
    const instance = new Resonance('https://www.example.com');
    instance.initGA(id, secret);
    expect(instance.gaTrackingId).toBe(id);
    expect(instance.gaAPISecret).toBe(secret);
  });

  test('loadCustomizations', () => {
    const baseUrl = 'https://www.example.com';
    const type = 'resonance-copy';
    const userData = { id: 'user-id-123' };
    const request = new Request('https://www.example.com');

    const instance = new Resonance(baseUrl);
    instance.loadCustomizations({
      type,
      userData,
      request,
    });
    expect(loadCustomizations).toHaveBeenCalledOnce();
    expect(loadCustomizations).toHaveBeenCalledWith(
      type,
      userData,
      baseUrl,
      request,
    );
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

    describe('Broswer environment', () => {
      beforeEach(() => {
        vi.stubGlobal('window', {});
      });
      afterEach(() => {
        vi.unstubAllGlobals();
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
