export const find = <T extends unknown>(
  array: T[],
  predicate: (value: T, index: number, array: T[]) => boolean
): [number, T] | null => {
  const index = array.findIndex(predicate);

  if (index) return [index, array[index]];

  return null;
};
