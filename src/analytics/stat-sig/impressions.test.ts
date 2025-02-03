import { triggerStatSigImpressionEvent } from '~/analytics/stat-sig/impressions.js';
import { CustomizationResult } from '~/loadCustomizations.js';

describe('triggerStatSigImpressionEvent', () => {
  const statSigApiKey = 'test-api-key';
  const userId = 'test-user-id';
  const customization: CustomizationResult = {
    id: 'customization-id',
    customizationTypeId: 'customization-type',
    surfaceId: 'abc',
    variation: {
      id: 'variation-id',
      rampPercent: 100,
      fields: {},
    },
  };

  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: vi.fn().mockResolvedValue({ surfaceOne: {} }),
      }),
    );
  });

  test('should call fetch with correct URL and options', async () => {
    await triggerStatSigImpressionEvent({
      statSigApiKey,
      userId,
      customization,
    });

    //@ts-expect-error `fetch` is being mocked, so this is okay
    expect(fetch.mock.calls[0][0]).toEqual(
      'https://api.statsig.com/v1/webhooks/event_webhook',
    );

    //@ts-expect-error `fetch` is being mocked, so this is okay
    expect(fetch.mock.calls[0][1]).toMatchObject({
      method: 'POST',
      headers: new Headers({
        'STATSIG-API-KEY': statSigApiKey,
      }),
      body: expect.any(String),
    });

    //@ts-expect-error `fetch` is being mocked, so this is okay
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toMatchObject({
      user: {
        userId,
      },
      eventName: 'resonance_impression',
      value: '',
      timestamp: expect.any(Number),
      metadata: {
        customizationId: customization.id,
        variationId: customization.variation.id,
        userId,
      },
    });
  });

  it('should handle missing userId', async () => {
    await triggerStatSigImpressionEvent({ statSigApiKey, customization });

    //@ts-expect-error `fetch` is being mocked, so this is okay
    expect(fetch.mock.calls[0][0]).toEqual(
      'https://api.statsig.com/v1/webhooks/event_webhook',
    );

    //@ts-expect-error `fetch` is being mocked, so this is okay
    expect(fetch.mock.calls[0][1]).toMatchObject({
      method: 'POST',
      headers: new Headers({
        'STATSIG-API-KEY': statSigApiKey,
      }),
      body: expect.any(String),
    });

    //@ts-expect-error `fetch` is being mocked, so this is okay
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toMatchObject({
      user: {},
      eventName: 'resonance_impression',
      value: '',
      timestamp: expect.any(Number),
      metadata: {
        customizationId: customization.id,
        variationId: customization.variation.id,
      },
    });
  });
});
