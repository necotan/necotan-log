export const CATEGORIES = ['photo', 'life', 'essay'] as const;
export type Category = (typeof CATEGORIES)[number];

export const categoryLabels: Record<Category, string> = {
  photo: 'Photo',
  life: 'Life',
  essay: 'Essay',
};

export const categoryDescriptions: Record<Category, string> = {
  photo: '写真エッセイ',
  life: '愛車(トヨタ86・ZN6)・ドライブなどの記録',
  essay: '日々の雑感、エッセイ',
};

export type CategoryFilter = {
  label: string;
  href: string;
};

export const categoryFilters: CategoryFilter[] = [
  { label: 'All', href: '/' },
  { label: 'Photo', href: '/category/photo/' },
  { label: 'Life', href: '/category/life/' },
  { label: 'Essay', href: '/category/essay/' },
];
