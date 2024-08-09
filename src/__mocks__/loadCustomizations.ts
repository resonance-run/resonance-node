export const loadCustomizations = vi.fn();
export const loadCustomization = vi.fn().mockResolvedValue({
  customization: { abc: 'hello' },
  userData: { id: 123 },
});
