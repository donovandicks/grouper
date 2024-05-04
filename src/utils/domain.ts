export const toKebab = (raw: string): string => {
  return raw.toLocaleLowerCase().replaceAll(" ", "-");
};

export const capWords = (raw: string): string => {
  return raw
    .toLocaleLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toLocaleUpperCase() + w.slice(1))
    .join(" ");
};
