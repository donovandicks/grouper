export const toKebab = (raw: string): string => {
  return raw.toLocaleLowerCase().replaceAll(" ", "-");
};
