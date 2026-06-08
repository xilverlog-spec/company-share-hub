export interface Memo {
  id: string;
  type: 'account' | 'site';
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}
