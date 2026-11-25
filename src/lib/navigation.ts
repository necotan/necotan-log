export type NavItem = {
  label: string;
  href: string;
  /** hrefと別の階層にある配下のページでも選択中にしたいときに、そのパスの先頭を渡す */
  activePrefixes?: string[];
};

export const navItems: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Tags', href: '/tags/', activePrefixes: ['/tag/'] },
  { label: 'About', href: '/about/' },
];

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

export function isNavActive(pathname: string, item: NavItem): boolean {
  if (item.href === '/') {
    return pathname === '/';
  }
  return [item.href, ...(item.activePrefixes ?? [])].some((prefix) => pathname.startsWith(prefix));
}
