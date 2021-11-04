export function setLocal(key: string, value: any): void {
  const json = JSON.stringify(value);

  localStorage.setItem(key, json);
}

export function getLocal(key: string, deffault: any): any {
  const stored: any = localStorage.getItem(key);

  if (stored !== null) {
    try {
      const json = JSON.parse(stored);

      return json;
    } catch (err) {
      return deffault;
    }
  }
  return deffault;
}
