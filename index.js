export const loadCustomizations = async (type, userData, clientId, apiKey) => {
  try {
    const baseUrl = `http://localhost:3000`;
    const formData = new FormData();
    formData.append(
      'body',
      JSON.stringify({
        customizationType: type,
        userData,
        clientId,
        apiKey,
      })
    );
    const res = await fetch(`${baseUrl}/api/getCustomizations`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    return data;
  } catch (error) {
    // In case of an error, return an empty object instead of killing everything.
    console.error(error);
    return {};
  }
};

export const loadCustomizationDataForI18Next = async (type, userData, clientId, apiKey) => {
  const customizationData = await loadCustomizations(type, userData, clientId, apiKey);
  const entries = Object.entries(customizationData);
  return entries.reduce((res, [key, customization]) => {
    const lang = customization.locale || 'en';
    const [namespace, stringKey] = key.split(':');
    if (!res[lang]) {
      res[lang] = {};
    }
    if (!res[lang][namespace]) {
      res[lang][namespace] = {};
    }
    const keyParts = stringKey.split('.');
    let nextPart;
    let obj = res[lang][namespace];
    while (keyParts.length) {
      nextPart = keyParts.shift();
      const isLastPart = keyParts.length === 0;
      if (!isLastPart) {
        if (!obj[nextPart]) {
          obj[nextPart] = {};
        }
        obj = obj[nextPart];
      }
    }
    obj[nextPart] = customization.variation.fields.stringValue.value;
    return res;
  }, {});
};
