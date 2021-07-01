export function createUrlSearchParams<T = {[key: string]: string}>(urlSearch: string): T {
  const params = new URLSearchParams(urlSearch);
  const token: {[key: string]: string} = {};

  params.forEach((value, key) => {
    token[key] = value;
  });

  return token as any;
}