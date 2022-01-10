const WIN_SCORE = 1000;

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

export function px(px: number) {
  return `${px}px`;
}

export function capitalizeFirstLetter(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// https://stackoverflow.com/questions/5306680/move-an-array-element-from-one-array-position-to-another?rq=1
export function arrayMove(arr: any[], old_index: number, new_index: number) {
  if (new_index >= arr.length) {
    var k = new_index - arr.length + 1;
    while (k--) {
      arr.push(undefined);
    }
  }
  arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
  return arr; // for testing
}

export function md2html(md: string): string {
  let imgMatch = md.match(/!\[\]\(([^\)]+)\)/);
  while (imgMatch) {
    md = md.replace(imgMatch[0], `<img src="${imgMatch[1]}" />`);
    imgMatch = md.match(/!\[\]\(([^\)]+)\)/);
  }
  let aMatch = md.match(/\[([^\]]*)\]\(([^\)]+)\)/);
  while (aMatch) {
    md = md.replace(
      aMatch[0],
      `<a href="${aMatch[2]}">${aMatch[1] || aMatch[2]}</a>`
    );
    aMatch = md.match(/\[([^\]]*)\]\(([^\)]+)\)/);
  }
  let boldMatch = md.match(/\*\*([^\*]+)\*\*/);
  while (boldMatch) {
    md = md.replace(boldMatch[0], `<b>${boldMatch[1]}</b>`);
    boldMatch = md.match(/\*\*([^\*]+)\*\*/);
  }
  let italicMatch = md.match(/\*([^\*]+)\*/);
  while (italicMatch) {
    md = md.replace(italicMatch[0], `<i>${italicMatch[1]}</i>`);
    italicMatch = md.match(/\*([^\*]+)\*/);
  }
  return md;
}

export function uid(): string {
  return (
    "uid_" + Date.now().toString(36) + Math.random().toString(36).substr(2)
  );
}

export function pause(delay: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, delay);
  });
}

export type ColorDisposition = "text" | "background";

export function scoreColor(disposition: ColorDisposition, score: number) {
  const capped = Math.min(Math.abs(score), WIN_SCORE);
  const normalized = 63 + Math.floor((capped / WIN_SCORE) * 192);

  return score > 0 ? `rgb(0, ${normalized}, 0)` : `rgb(${normalized}, 0, 0)`;
}
