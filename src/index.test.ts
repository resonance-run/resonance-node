import {
  loadCustomization,
  loadCustomizations,
} from './__mocks__/loadCustomizations.js';
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
        timeout: 1234,
      });
      expect(loadCustomization).toHaveBeenLastCalledWith({
        customizationType,
        userData,
        surfaceId,
        baseUrl,
        request,
        timeout: 1234,
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

    test('calls this.triggerAnalytics', async () => {
      const baseUrl = 'https://www.example.com';
      const type = 'resonance-copy';
      const surfaceId = 'common:nav-1234';
      const userData = { id: 'user-id-123' };
      const request = new Request('https://www.example.com');
      const defaultValue = {
        abc: 'def',
      };
      const rawCustomization = {
        id: 'sample-id',
        customizationTypeId: 'customize-me',
        surfaceId: 'abc',
      };

      loadCustomization.mockResolvedValue({
        customization: { abc: 'hello' },
        rawCustomization,
        userData,
      });

      const instance = new Resonance(baseUrl);
      vi.spyOn(instance, 'triggerAnalytics');
      await instance.loadCustomization({
        customizationType: type,
        userData,
        surfaceId,
        request,
        defaultValue,
      });

      expect(instance.triggerAnalytics).toHaveBeenCalledOnce();
      expect(instance.triggerAnalytics).toHaveBeenCalledWith(
        rawCustomization,
        userData,
      );
    });
  });

  test('customizationToFieldsObject', () => {
    const baseUrl = 'https://www.example.com';
    const instance = new Resonance(baseUrl);
    instance.customizationToFieldsObject(customization);
    expect(customizationToFieldsObject).toHaveBeenCalledOnce();
    expect(customizationToFieldsObject).toHaveBeenCalledWith(customization);
  });
});
