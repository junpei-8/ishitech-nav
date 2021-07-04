export function punctuationReplacer(word: string): string {
  return word.replace(/[\u3001-\u3003]|,|\./g, ' ');
}

export function spaceReplacer(word: string): string {
  return word.trim().replace(/\s+|u3000/g, ' ');
}
