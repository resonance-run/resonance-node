import { serialize } from 'cookie';

import Cookies from '../__mocks__/js-cookie.js';

import { loadCustomizations } from './loadCustomizations.js';

vi.mock('js-cookie');
describe('loadCustomizations', () => {
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
    expect(customizations).toStrictEqual({ surfaceOne: {} });
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
      userData: {},
    });
  });
});
