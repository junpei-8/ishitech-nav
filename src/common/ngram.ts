import { punctuationReplacer, spaceReplacer } from './replacer';

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

export function ngramWithReplacer(n: number, word: string): string[] {
  // 記号削除 => スペース添削
  const newWord = spaceReplacer(punctuationReplacer(word));
  return ngram(n, newWord);
}

export function createSearchToken(n: number, word: string, withReplacer?: boolean): {[key: string]: true} {
  const result: {[key: string]: true} = {};
  
  const words = withReplacer
    ? ngramWithReplacer(n, word)
    : ngram(n, word);
  const wordsLen = words.length;

  for (let i = 0; i < wordsLen; i++) {
    result[words[i]] = true;
  }

  return result;
}
