/**
 * T020: port of build.js:20-35 (sortByProperty / sortByKeys), verbatim.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sortByProperty(property: string): (x: any, y: any) => number {
  return function (x, y) {
    if (typeof x[property] === 'string') {
      return x[property].toLowerCase() === y[property].toLowerCase()
        ? 0
        : x[property].toLowerCase() > y[property].toLowerCase()
          ? 1
          : -1;
    }
    return x[property] === y[property] ? 0 : x[property] > y[property] ? 1 : -1;
  };
}

export function sortByKeys<T>(unordered: Record<string, T>): Record<string, T> {
  const ordered: Record<string, T> = {};
  Object.keys(unordered)
    .sort()
    .forEach((key) => {
      ordered[key] = unordered[key]!;
    });
  return ordered;
}
