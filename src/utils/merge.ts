export const merge = <T = {}>(source: T, ...overwrites: Partial<T>[]): T => {
  return overwrites.reduce(
    (acc, cur) => ({
      ...source,
      ...cur,
    }),
    source
  ) as T;
};
