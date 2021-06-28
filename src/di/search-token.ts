export interface SearchToken {
  inputted: {
    keyword: string,
    job: string,
    area: string,
  },
  narrowDown: {} | null;
  sort: 'asc' | 'desc';
  query: string;
  isEmpty: boolean;
}
export const searchToken: SearchToken = {
  inputted: {
    keyword: '',
    job: '',
    area: ''
  },
  narrowDown: null,
  sort: 'desc',
  query: '',
  isEmpty: true
}
