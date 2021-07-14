export function punctuationReplacer(word: string): string {
  return word.replace(/[\u3001-\u3003]|,|\./g, ' ');
}

export function spaceReplacer(word: string): string {
  return word.trim().replace(/\s+|u3000/g, ' ');
}

export function fullWidthReplacer(word: string): string {
  return word.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
}

export function replacerForUrl(word: string): string {
  return spaceReplacer(punctuationReplacer(fullWidthReplacer(word)));
}