export function ngram(n: number, word: string): string[] {
  const result: string[] = [];

  const splitWords = word.split(' ');
  const splitWordLen = splitWords.length;
  for (let index = 0; index < splitWordLen; index++) {
    const _word = splitWords[index];
    const len = _word.length - n;
    for (let i = 0; i <= len; i++) {
      result.push(_word.substring(i, i + n));
    }
  }

  return [...new Set(result)];
}
