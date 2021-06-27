type Area = string; // '北海道' | '青森' ｜ ...
export interface InputtedSearchToken {
  keyword?: string,
  job?: string,
  area?: Area
}

export const inputtedSearchToken: InputtedSearchToken = {};
