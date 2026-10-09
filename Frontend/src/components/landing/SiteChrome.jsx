import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { icons } from './assets';
import { Icon, Logo, focusRing, forestButton, mutedLink, stroke, textLink } from './primitives';

// Header and footer shared by the landing page and the Bookla information pages (/about, /privacy,
// /terms). On the landing page the section links are in-page anchors; elsewhere they lead back to
// the landing page sections.

const sectionLinks = (home) =>
  [
    { label: 'Ana səhifə', hash: '#top' },
    { label: 'Necə işləyir?', hash: '#nece-isleyir' },
    { label: 'Kitab klubları', hash: '#kitab-klublari' },
  ].map(({ label, hash }) => (home ? { label, href: hash } : { label, to: hash === '#top' ? '/' : `/${hash}` }));

// "Ana səhifə" is the current page on the landing page (Figma shows it in semibold).
const navLinks = (home) => [
  ...sectionLinks(home).map((link, index) => ({ ...link, active: home && index === 0 })),
  { label: 'Kitabları kəşf et', to: '/books' },
];

// NavLink marks links to the current route with aria-current="page".
export const NavItem = ({ link, className = '', onClick, ...props }) =>
  link.to ? (
    <NavLink to={link.to} end className={className} onClick={onClick} {...props}>
      {link.label}
    </NavLink>
  ) : (
    <a href={link.href} className={className} onClick={onClick} aria-current={link.active ? 'page' : undefined} {...props}>
      {link.label}
    </a>
  );

export const SiteHeader = ({ home = false }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef(null);
  const menuButtonRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const close = () => setMenuOpen(false);
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        close();
        menuButtonRef.current?.focus();
      }
    };
    const onPointerDown = (event) => {
      if (!headerRef.current?.contains(event.target)) close();
    };
    // The menu only exists below the desktop breakpoint, where the full nav takes over.
    const desktop = window.matchMedia('(min-width: 80rem)');
    const onBreakpoint = (event) => event.matches && close();

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    desktop.addEventListener('change', onBreakpoint);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
      desktop.removeEventListener('change', onBreakpoint);
    };
  }, [menuOpen]);

  return (
    <header ref={headerRef} className="relative bg-bookla-paper shadow-[inset_0_-1px_0_0_var(--color-bookla-line)]">
      <nav
        aria-label="Əsas naviqasiya"
        className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-6 md:h-[88px] md:px-10 xl:px-[88px]"
      >
        <NavItem
          link={{ label: <Logo />, ...(home ? { href: '#top' } : { to: '/' }) }}
          className={`flex rounded-[4px] ${focusRing}`}
          aria-label="Bookla — ana səhifə"
        />

        <div className="hidden items-center gap-7 text-[13px]/[16px] whitespace-nowrap xl:flex">
          {navLinks(home).map((link) => (
            <NavItem
              key={link.label}
              link={link}
              className={`${textLink} ${focusRing} ${link.active ? 'font-semibold' : ''}`}
            />
          ))}
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <Link to="/login" className={`hidden text-[13px]/[16px] whitespace-nowrap md:block ${textLink} ${focusRing}`}>
            Daxil ol
          </Link>
          {/* Figma: "Klub yarat". Clubs aren't in the app yet, so the button names what /register does;
              min-width keeps the Figma button size. */}
          <Link
            to="/register"
            className={`flex h-[42px] min-w-[100px] items-center justify-center rounded-[8px] bg-bookla-forest px-[18px] text-[13px]/[16px] font-semibold whitespace-nowrap text-bookla-paper max-[340px]:hidden ${forestButton} ${focusRing}`}
          >
            Qoşul
          </Link>
          <button
            ref={menuButtonRef}
            type="button"
            className={`shrink-0 cursor-pointer rounded-[4px] xl:hidden ${focusRing}`}
            aria-label={menuOpen ? 'Menyunu bağla' : 'Menyunu aç'}
            aria-expanded={menuOpen}
            aria-controls="landing-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Icon src={icons.menu24} width={24} />
          </button>
        </div>
      </nav>

      {menuOpen && (
        <nav
          id="landing-menu"
          aria-label="Menyu"
          className="absolute inset-x-0 top-full z-20 flex flex-col items-start gap-4 bg-bookla-paper px-6 py-5 text-[13px]/[16px] shadow-[inset_0_-1px_0_0_var(--color-bookla-line)] md:px-10 xl:hidden"
        >
          {navLinks(home).map((link) => (
            <NavItem
              key={link.label}
              link={link}
              className={`${textLink} ${focusRing} ${link.active ? 'font-semibold' : ''}`}
              onClick={() => setMenuOpen(false)}
            />
          ))}
          <Link to="/login" className={`md:hidden ${textLink} ${focusRing}`} onClick={() => setMenuOpen(false)}>
            Daxil ol
          </Link>
          {/* Shown only where the header is too narrow for the "Qoşul" button (< 340px). */}
          <Link
            to="/register"
            className={`font-semibold min-[340px]:hidden ${textLink} ${focusRing}`}
            onClick={() => setMenuOpen(false)}
          >
            Qoşul
          </Link>
        </nav>
      )}
    </header>
  );
};

const footerColumns = [
  {
    title: 'Platforma',
    links: (home) => [...sectionLinks(home), { label: 'Kitabları kəşf et', to: '/books' }, { label: 'Daxil ol', to: '/login' }],
  },
  {
    title: 'Bookla',
    links: () => [
      { label: 'Haqqımızda', to: '/about' },
      { label: 'Məxfilik siyasəti', to: '/privacy' },
      { label: 'İstifadə şərtləri', to: '/terms' },
    ],
  },
];

const socialLinks = [
  { label: 'Instagram', icon: icons.instagram15 },
  { label: 'Facebook', icon: icons.facebook15 },
  { label: 'LinkedIn', icon: icons.linkedin15 },
];

export const SiteFooter = ({ home = false }) => (
  <footer className="mx-auto flex max-w-[1440px] flex-col items-start gap-10 overflow-hidden px-6 pt-14 pb-7 md:px-10 xl:px-[88px]">
    <div className="flex w-full flex-col items-start gap-8 md:gap-14 xl:flex-row">
      <div className="flex w-full flex-col items-start gap-[18px] overflow-hidden xl:w-[460px] xl:shrink-0">
        <Logo />
        <p className="w-full text-[13px]/[21px] text-bookla-muted">
          Oxucular və kitab klubları üçün rəqəmsal məkan. Kitabları kəşf et, fikirlərini paylaş, birlikdə oxu.
        </p>
        <div className="flex items-start gap-4 overflow-hidden">
          {socialLinks.map((social) => (
            <span
              key={social.label}
              role="img"
              aria-label={social.label}
              className={`flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-[32px] ${stroke}`}
            >
              <Icon src={social.icon} width={15} />
            </span>
          ))}
        </div>
      </div>

      <div className="flex w-full items-start gap-6 text-[12px]/[15px] md:gap-14 xl:w-auto xl:min-w-px xl:flex-1">
        {footerColumns.map((column) => (
          <div key={column.title} className="flex min-w-px flex-1 flex-col items-start gap-3.5">
            <p className="font-semibold whitespace-nowrap">{column.title}</p>
            {column.links(home).map((link) => (
              <NavItem
                key={link.label}
                link={link}
                className={`block w-fit rounded-[2px] leading-[18px] text-bookla-muted ${mutedLink} ${focusRing}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>

    <div className="flex w-full flex-col items-start gap-[22px] overflow-hidden">
      <div className="h-px w-full bg-bookla-line" />
      <div className="flex w-full items-start justify-between overflow-hidden text-[11px]/[13px] whitespace-nowrap text-bookla-muted">
        <p>© 2026 Bookla</p>
        <p>Birlikdə oxumaq üçün.</p>
      </div>
    </div>
  </footer>
);
