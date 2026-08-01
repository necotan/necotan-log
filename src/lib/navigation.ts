export type NavItem = {
  label: string;
  href: string;
};

// ヘッダーでグルーピング表示するための区切り単位
export const navGroups: NavItem[][] = [
  [{ label: 'Home', href: '/' }],
  [
    { label: 'Photo', href: '/category/photo/' },
    { label: 'Life', href: '/category/life/' },
    { label: 'Essay', href: '/category/essay/' },
  ],
  [{ label: 'About', href: '/about/' }],
];

export const navItems: NavItem[] = navGroups.flat();

export type SnsLink = {
  label: string;
  href: string;
};

export const snsLinks: SnsLink[] = [
  { label: 'X', href: 'https://x.com/necotanv2' },
  { label: 'Instagram', href: 'https://www.instagram.com/necotanv2/' },
  { label: 'YouTube', href: 'https://www.youtube.com/@NECOTAN' },
  { label: 'note', href: 'https://note.com/necofilm' },
  { label: 'RSS', href: '/rss.xml' },
];

export function isNavActive(pathname: string, href: string): boolean {
  if (href === '/') {
    return pathname === '/';
  }
  return pathname === href || pathname.startsWith(href);
}
