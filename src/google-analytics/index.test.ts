import type { CustomizationResult } from '../loadCustomizations.js';
import {
  triggerGABrowserImpressionEvent,
  triggerGAImpressionEvent,
} from './index.js';

describe('Google Analytics events', () => {
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
  describe('Server events', () => {
    beforeEach(() => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          json: vi.fn().mockResolvedValue({ surfaceOne: {} }),
        }),
      );
    });
    afterEach(() => {
      vi.unstubAllGlobals();
    });
    test('Makes fetch call to the right URL', async () => {
      const gaTrackingId = 'GA-JFESIKDS3243';
      const gaAPISecret = 'this-is-the-secret';
      const gaClientId = 'id-for-client';
      const userId = 'user-id-321';
      const res = await triggerGAImpressionEvent({
        gaTrackingId,
        gaAPISecret,
        gaClientId,
        customization,
        userId,
      });
      const expectedUrl = `https://www.google-analytics.com/mp/collect?measurement_id=${gaTrackingId}&api_secret=${gaAPISecret}`;
      expect(fetch).toHaveBeenCalled();
      // @ts-expect-error TS doesn't know that fetch is mocked
      expect(fetch.mock.lastCall[0]).toBe(expectedUrl);
      // @ts-expect-error TS doesn't know that fetch is mocked
      const fetchBody = JSON.parse(fetch.mock.lastCall[1].body);
      expect(fetchBody.client_id).toBe(gaClientId);
      expect(fetchBody.events).toStrictEqual([
        {
          name: 'resonance_impression',
          params: {
            customization_id: customization.id,
            variation_id: customization.variation.id,
            user_id: userId,
          },
        },
      ]);
      expect(res).toBe('success');
    });

    test('it returns "error" when the fetch throws', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockImplementation(() => {
          throw new Error();
        }),
      );
      const gaTrackingId = 'GA-JFESIKDS3243';
      const gaAPISecret = 'this-is-the-secret';
      const gaClientId = 'id-for-client';
      const userId = 'user-id-321';
      const res = await triggerGAImpressionEvent({
        gaTrackingId,
        gaAPISecret,
        gaClientId,
        customization,
        userId,
      });
      expect(fetch).toHaveBeenCalledOnce();
      expect(res).toBe('error');
    });
  });

  describe('Browser events', () => {
    test('Calls gtag function that is passed in', async () => {
      const gtag = vi.fn();
      const userId = 'user-id-321';
      const res = await triggerGABrowserImpressionEvent(
        customization,
        userId,
        gtag,
      );
      expect(gtag).toHaveBeenCalledOnce();
      expect(gtag).toHaveBeenCalledWith('event', 'resonance_impression', {
        customization_id: customization.id,
        variation_id: customization.variation.id,
        user_id: userId,
      });
      expect(res).toBe('success');
    });

    test('Returns "error" if gtag call throws an error', async () => {
      const gtag = vi.fn().mockImplementation(() => {
        throw new Error('Mock error');
      });
      const userId = 'user-id-321';
      const res = await triggerGABrowserImpressionEvent(
        customization,
        userId,
        gtag,
      );
      expect(gtag).toHaveBeenCalledOnce();
      expect(gtag).toHaveBeenCalledWith('event', 'resonance_impression', {
        customization_id: customization.id,
        variation_id: customization.variation.id,
        user_id: userId,
      });
      expect(res).toBe('error');
    });
  });
});
