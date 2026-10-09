import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '@fontsource-variable/inter';
import '@fontsource-variable/lora';
import '@fontsource-variable/lora/wght-italic.css';
import { SiteFooter, SiteHeader } from '../../components/landing/SiteChrome';
import { icons } from '../../components/landing/assets';
import { Eyebrow, Icon, focusRing, mutedLink, strokeTop } from '../../components/landing/primitives';

// Layout for the Bookla information pages (/about, /privacy, /terms), built from the landing page's
// design tokens and components.

const container = 'mx-auto w-full max-w-[1440px] px-6 md:px-10 xl:px-[88px]';

// A fact only the owner can supply (company name, contact address, ...). Shown highlighted so an
// unfinished draft is never mistaken for a final text.
export const Missing = ({ children }) => (
  <mark className="rounded-[4px] bg-bookla-blush px-1 py-px text-bookla-forest [box-decoration-break:clone]">
    [{children}]
  </mark>
);

export const InlineLink = ({ to, children }) => (
  <Link
    to={to}
    className={`rounded-[2px] font-semibold underline decoration-1 underline-offset-4 hover:decoration-2 ${focusRing}`}
  >
    {children}
  </Link>
);

export const SubHeading = ({ children }) => <h3 className="pt-2 font-semibold">{children}</h3>;

export const List = ({ items }) => (
  <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-bookla-clay">
    {items.map((item, index) => (
      <li key={index}>{item}</li>
    ))}
  </ul>
);

const useDocumentMeta = (title, draft) => {
  useEffect(() => {
    const root = document.documentElement;
    const previousTitle = document.title;
    const previousLang = root.lang;
    document.title = `${title} — Bookla`;
    root.lang = 'az';
    // Drafts are kept out of search results until the owner approves the text.
    let robots;
    if (draft) {
      robots = document.createElement('meta');
      robots.name = 'robots';
      robots.content = 'noindex';
      document.head.appendChild(robots);
    }
    return () => {
      document.title = previousTitle;
      root.lang = previousLang;
      robots?.remove();
    };
  }, [title, draft]);
};

const legalDraftText =
  'Bu mətn Bookla tətbiqinin hazırkı işləmə qaydasına əsasən hazırlanmış layihədir. Hüquqi baxışdan keçməyib və sahibkar tərəfindən təsdiqlənməyib. Rəngli mötərizədə göstərilən məlumatlar hələ müəyyənləşdirilməlidir.';

const DraftNotice = ({ text }) => (
  <div className="flex w-full max-w-[720px] items-start gap-3 rounded-[16px] bg-bookla-blush p-5 md:p-6">
    <Icon src={icons.info15} width={15} className="mt-[5px]" />
    <div className="flex flex-col gap-1.5 text-[14px]/[22px]">
      <p className="font-semibold">Layihə — hələ qüvvədə deyil</p>
      <p>{text}</p>
    </div>
  </div>
);

// `draft`: true for the standard legal-draft notice, or a string with a page-specific notice.
const InfoPage = ({ eyebrow, title, intro, updated, draft = false, sections }) => {
  useDocumentMeta(title, draft);
  // Open at the top, or at the section named in the URL (e.g. /privacy#saxlama).
  const { pathname, hash } = useLocation();
  useEffect(() => {
    const target = hash && document.getElementById(hash.slice(1));
    if (target) target.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [pathname, hash]);

  return (
    <div
      lang="az"
      className="min-h-screen bg-bookla-paper font-inter text-bookla-forest antialiased [font-feature-settings:'locl'_0]"
    >
      <SiteHeader />
      <main>
        <div className={`${container} flex flex-col items-start gap-6 pt-12 pb-10 xl:pt-16 xl:pb-14`}>
          <div className="flex items-center gap-2.5">
            <span className="h-px w-6 shrink-0 bg-bookla-clay" />
            <Eyebrow>{eyebrow}</Eyebrow>
          </div>
          <h1 className="font-lora text-[38px]/[46px] md:text-[54px]/[66px]">{title}</h1>
          <p className="w-full max-w-[720px] text-[15px]/[25px] text-bookla-muted md:text-[17px]/[28px]">{intro}</p>
          {updated && <p className="text-[12px]/[15px] text-bookla-muted">Son yenilənmə: {updated}</p>}
          {draft && <DraftNotice text={draft === true ? legalDraftText : draft} />}
        </div>

        <div className={`${container} flex flex-col items-start gap-10 pb-16 xl:flex-row xl:gap-[88px] xl:pb-[88px]`}>
          <nav
            aria-label="Bu səhifədə"
            className="w-full shrink-0 rounded-[16px] bg-white p-5 shadow-[inset_0_0_0_1px_var(--color-bookla-line)] xl:sticky xl:top-8 xl:w-[260px]"
          >
            <p className="mb-3 text-[11px]/[13px] font-semibold uppercase">Bu səhifədə</p>
            <ol className="flex flex-col gap-2 text-[13px]/[18px]">
              {sections.map((section, index) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className={`inline-block rounded-[2px] text-bookla-muted ${mutedLink} ${focusRing}`}
                  >
                    {index + 1}. {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <article className="flex w-full max-w-[720px] min-w-0 flex-col gap-10">
            {sections.map((section, index) => (
              <section
                key={section.id}
                id={section.id}
                aria-labelledby={`${section.id}-title`}
                className={`flex scroll-mt-6 flex-col gap-4 pt-8 text-[15px]/[25px] ${index ? strokeTop : ''}`}
              >
                <h2 id={`${section.id}-title`} className="font-lora text-[25px]/[32px] md:text-[31px]/[38px]">
                  {index + 1}. {section.title}
                </h2>
                {section.body}
              </section>
            ))}
          </article>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default InfoPage;
