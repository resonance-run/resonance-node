export const loadCustomizations = async (type, integration, userData) => {
  try {
    const baseUrl = `http://localhost:4500`;
    const encodedUserData = encodeURIComponent(JSON.stringify(userData));
    const fullUrl = `${baseUrl}/customizations?userData=${encodedUserData}&customizationType=${type}&integration=${integration}`;
    const res = await fetch(fullUrl);
    const data = await res.json();
    return data;
  } catch (error) {
    console.log('We had an error');
    // In case of an error, return an empty object instead of killing everything.
    console.error(error);
    return {};
  }
};

export const loadCustomizationDataForI18Next = async (type, userData) => {
  const customizationData = await loadCustomizations(type, 'i18next', userData);
  return customizationData;
};
