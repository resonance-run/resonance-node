import { serialize } from 'cookie';

import Cookies from '../__mocks__/js-cookie.js';

import { loadCustomization, loadCustomizations } from './loadCustomizations.js';

vi.mock('js-cookie');
describe('loadCustomizations', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: vi.fn().mockResolvedValue({
          userData: {},
          customizations: {
            surfaceOne: {
              name: 'A name',
              surfaceId: 'surfaceOne',
              variation: {
                fields: {
                  stringValue: { value: 'This is a string' },
                  imageValue: {
                    value: 'https://example.com/image.jpg',
                  },
                  ctaValue: { value: '' },
                  count: { value: 0 },
                  bullets: { value: [''] },
                },
              },
            },
          },
        }),
      }),
    );
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('loadCustomizations makes call to client cache service', async () => {
    const request = new Request('https://resonance.example.com');
    const userData = { id: 123 };
    await loadCustomizations({
      type: 'resonance-copy',
      userData,
      baseUrl: 'https://resonance.example.com',
      request,
    });
    const expectedUrl = `https://resonance.example.com/customizations`;
    expect(fetch).toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledWith(expectedUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userData,
        customizationType: 'resonance-copy',
      }),
    });
  });

  test('loadCustomizations makes call with preview data', async () => {
    const request = new Request('https://resonance.example.com');
    const overrideData = JSON.stringify({
      customizationId: 'ckdjk123kl',
      surfaceId: 'common:nav.cta',
      customizationName: 'Nav',
      variationId: 1234,
    });
    const cookie = serialize('resonance.preview', overrideData);
    request.headers.set('Cookie', cookie);
    const userData = { id: 123 };
    await loadCustomizations({
      type: 'resonance-copy',
      userData,
      baseUrl: 'https://resonance.example.com',
      request,
    });
    const expectedUrl = `https://resonance.example.com/customizations`;
    expect(fetch).toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledWith(expectedUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userData,
        customizationType: 'resonance-copy',
        previewOverrides: cookie.replace('resonance.preview=', ''),
      }),
    });
  });

  test('loadCustomizations makes call with preview data (browser)', async () => {
    const overrideData = JSON.stringify({
      customizationId: 'ckdjk123kl',
      surfaceId: 'common:nav.cta',
      customizationName: 'Nav',
      variationId: 1234,
    });
    vi.stubGlobal('window', {});
    Cookies.get.mockImplementation(() => {
      return encodeURIComponent(overrideData);
    });
    const userData = { id: 123 };
    await loadCustomizations({
      type: 'resonance-copy',
      userData,
      baseUrl: 'https://resonance.example.com',
    });
    const expectedUrl = `https://resonance.example.com/customizations`;
    expect(fetch).toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledWith(expectedUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userData,
        customizationType: 'resonance-copy',
        previewOverrides: encodeURIComponent(overrideData),
      }),
    });
  });

  test('it returns the result of the fetch', async () => {
    const request = new Request('https://resonance.example.com');
    const customizations = await loadCustomizations({
      type: 'resonance-copy',
      userData: { id: 123 },
      baseUrl: 'https://resonance.example.com',
      request,
    });
    expect(customizations).toStrictEqual({
      customizations: {
        surfaceOne: {
          name: 'A name',
          surfaceId: 'surfaceOne',
          variation: {
            fields: {
              stringValue: { value: 'This is a string' },
              imageValue: {
                value: 'https://example.com/image.jpg',
              },
              ctaValue: { value: '' },
              count: { value: 0 },
              bullets: { value: [''] },
            },
          },
        },
      },
      userData: {},
    });
  });

  test('it returns an empty object when an error is thrown', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: vi.fn().mockImplementation(() => {
          throw new Error();
        }),
      }),
    );

    const request = new Request('https://resonance.example.com');
    const customizations = await loadCustomizations({
      type: 'resonance-copy',
      userData: { id: 123 },
      baseUrl: 'https://resonance.example.com',
      request,
    });
    expect(customizations).toStrictEqual({
      customizations: {},
      userData: { id: 123 },
    });
  });

  test('it returns the defaultValue (if provided) when an error is thrown', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: vi.fn().mockImplementation(() => {
          throw new Error();
        }),
      }),
    );

    const request = new Request('https://resonance.example.com');
    const customizations = await loadCustomizations({
      type: 'resonance-copy',
      userData: { id: 123 },
      baseUrl: 'https://resonance.example.com',
      defaultValue: {
        a: 'bcdef',
      },
      request,
    });
    expect(customizations).toStrictEqual({
      customizations: {
        a: 'bcdef',
      },
      userData: { id: 123 },
    });
  });

  test('it returns the defaultValue merged with the customization values', async () => {
    const request = new Request('https://resonance.example.com');
    const customizations = await loadCustomizations({
      type: 'resonance-copy',
      userData: { id: 123 },
      baseUrl: 'https://resonance.example.com',
      request,
      defaultValue: {
        surfaceOne: {
          stringValue: 'Default string',
          imageValue: 'https://www.example.com',
          ctaValue: 'Click me',
          bullets: ['One', 'Two', 'Four'],
        },
      },
    });
    expect(customizations).toStrictEqual({
      customizations: {
        surfaceOne: {
          stringValue: 'This is a string',
          imageValue: 'https://example.com/image.jpg',
          ctaValue: 'Click me',
          count: 0,
          bullets: ['One', 'Two', 'Four'],
        },
      },
      userData: {},
    });
  });

  test('it returns the customization values and ignores the default if the default is not an object', async () => {
    const request = new Request('https://resonance.example.com');
    let customizations = await loadCustomizations({
      type: 'resonance-copy',
      userData: { id: 123 },
      baseUrl: 'https://resonance.example.com',
      request,
      defaultValue: 'hello',
    });
    expect(customizations).toStrictEqual({
      customizations: {
        surfaceOne: {
          name: 'A name',
          surfaceId: 'surfaceOne',
          variation: {
            fields: {
              stringValue: { value: 'This is a string' },
              imageValue: {
                value: 'https://example.com/image.jpg',
              },
              ctaValue: { value: '' },
              count: { value: 0 },
              bullets: { value: [''] },
            },
          },
        },
      },
      userData: {},
    });

    customizations = await loadCustomizations({
      type: 'resonance-copy',
      userData: { id: 123 },
      baseUrl: 'https://resonance.example.com',
      request,
      defaultValue: ['hello'],
    });
    expect(customizations).toStrictEqual({
      customizations: {
        surfaceOne: {
          name: 'A name',
          surfaceId: 'surfaceOne',
          variation: {
            fields: {
              stringValue: { value: 'This is a string' },
              imageValue: {
                value: 'https://example.com/image.jpg',
              },
              ctaValue: { value: '' },
              count: { value: 0 },
              bullets: { value: [''] },
            },
          },
        },
      },
      userData: {},
    });
  });
});

describe('loadCustomization', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: vi.fn().mockResolvedValue({
          userData: {},
          customizations: {
            surfaceOne: {
              name: 'A name',
              surfaceId: 'surfaceOne',
              variation: {
                fields: {
                  stringValue: { value: 'This is a string' },
                  imageValue: {
                    value: 'https://example.com/image.jpg',
                  },
                  ctaValue: { value: '' },
                  count: { value: 0 },
                  bullets: { value: [''] },
                },
              },
            },
          },
        }),
      }),
    );
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('loadCustomization makes call to client cache service', async () => {
    const request = new Request('https://resonance.example.com');
    const userData = { id: 123 };
    await loadCustomization({
      type: 'resonance-copy',
      userData,
      baseUrl: 'https://resonance.example.com',
      surfaceId: 'surfaceOne',
      request,
    });
    const expectedUrl = `https://resonance.example.com/customizations`;
    expect(fetch).toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledWith(expectedUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userData,
        customizationType: 'resonance-copy',
        surfaceId: 'surfaceOne',
      }),
    });
  });

  test('loadCustomization makes call with preview data', async () => {
    const request = new Request('https://resonance.example.com');
    const overrideData = JSON.stringify({
      customizationId: 'ckdjk123kl',
      surfaceId: 'common:nav.cta',
      customizationName: 'Nav',
      variationId: 1234,
    });
    const cookie = serialize('resonance.preview', overrideData);
    request.headers.set('Cookie', cookie);
    const userData = { id: 123 };
    await loadCustomization({
      type: 'resonance-copy',
      surfaceId: 'surfaceOne',
      userData,
      baseUrl: 'https://resonance.example.com',
      request,
    });
    const expectedUrl = `https://resonance.example.com/customizations`;
    expect(fetch).toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledWith(expectedUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userData,
        customizationType: 'resonance-copy',
        surfaceId: 'surfaceOne',
        previewOverrides: cookie.replace('resonance.preview=', ''),
      }),
    });
  });

  test('loadCustomization makes call with preview data (browser)', async () => {
    const overrideData = JSON.stringify({
      customizationId: 'ckdjk123kl',
      surfaceId: 'common:nav.cta',
      customizationName: 'Nav',
      variationId: 1234,
    });
    vi.stubGlobal('window', {});
    Cookies.get.mockImplementation(() => {
      return encodeURIComponent(overrideData);
    });
    const userData = { id: 123 };
    await loadCustomization({
      type: 'resonance-copy',
      surfaceId: 'surfaceOne',
      userData,
      baseUrl: 'https://resonance.example.com',
    });
    const expectedUrl = `https://resonance.example.com/customizations`;
    expect(fetch).toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledWith(expectedUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userData,
        customizationType: 'resonance-copy',
        surfaceId: 'surfaceOne',
        previewOverrides: encodeURIComponent(overrideData),
      }),
    });
  });
  test('Returns a single customization', async () => {
    const request = new Request('https://resonance.example.com');
    const customizations = await loadCustomization({
      type: 'resonance-copy',
      surfaceId: 'surfaceOne',
      userData: { id: 123 },
      baseUrl: 'https://resonance.example.com',
      request,
    });
    expect(customizations).toStrictEqual({
      customization: {
        count: 0,
        stringValue: 'This is a string',
        imageValue: 'https://example.com/image.jpg',
      },
      userData: {},
    });
  });

  test('it returns the defaultValue merged with the customization values', async () => {
    const request = new Request('https://resonance.example.com');
    const customization = await loadCustomization({
      type: 'resonance-copy',
      surfaceId: 'surfaceOne',
      userData: { id: 123 },
      baseUrl: 'https://resonance.example.com',
      request,
      defaultValue: {
        stringValue: 'Default string',
        imageValue: 'https://www.example.com',
        ctaValue: 'Click me',
        bullets: ['One', 'Two', 'Four'],
      },
    });
    expect(customization).toStrictEqual({
      customization: {
        stringValue: 'This is a string',
        count: 0,
        imageValue: 'https://example.com/image.jpg',
        ctaValue: 'Click me',
        bullets: ['One', 'Two', 'Four'],
      },
      userData: {},
    });
  });

  test('it returns an empty object when an error is thrown', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: vi.fn().mockImplementation(() => {
          throw new Error();
        }),
      }),
    );

    const request = new Request('https://resonance.example.com');
    const customizations = await loadCustomization({
      type: 'resonance-copy',
      surfaceId: 'surfaceOne',
      userData: { id: 123 },
      baseUrl: 'https://resonance.example.com',
      request,
    });
    expect(customizations).toStrictEqual({
      customization: {},
      userData: { id: 123 },
    });
  });

  test('it returns the defaultValue (if provided) when an error is thrown', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: vi.fn().mockImplementation(() => {
          throw new Error();
        }),
      }),
    );

    const request = new Request('https://resonance.example.com');
    const customizations = await loadCustomization({
      type: 'resonance-copy',
      surfaceId: 'surfaceOne',
      userData: { id: 123 },
      baseUrl: 'https://resonance.example.com',
      defaultValue: {
        a: 'bcdef',
      },
      request,
    });
    expect(customizations).toStrictEqual({
      customization: {
        a: 'bcdef',
      },
      userData: { id: 123 },
    });
  });

  test('Returns the default value if the surfaceId is not found in the result', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: vi.fn().mockResolvedValue({
          userData: {},
          customizations: {
            surfaceTwo: {
              name: 'A name',
              surfaceId: 'surfaceOne',
              variation: {
                fields: {
                  stringValue: { value: 'This is a string' },
                },
              },
            },
          },
        }),
      }),
    );

    const request = new Request('https://resonance.example.com');
    const customizations = await loadCustomization({
      type: 'resonance-copy',
      surfaceId: 'surfaceOne',
      userData: { id: 123 },
      baseUrl: 'https://resonance.example.com',
      defaultValue: {
        a: 'bcdef',
      },
      request,
    });

    expect(customizations).toStrictEqual({
      customization: {
        a: 'bcdef',
      },
      userData: {},
    });
  });
});
