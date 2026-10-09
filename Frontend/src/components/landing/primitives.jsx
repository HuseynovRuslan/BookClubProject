import { avatarGroups, icons } from './assets';

// Figma notes that apply to every text/box on the landing page:
// - Line heights are rounded to whole pixels in Figma, so each text sets an explicit
//   `text-[size]/[line-height]` instead of `leading-normal` / unitless ratios.
// - Strokes are "inside" and excluded from auto layout, so borders are drawn as inset
//   shadows to keep paddings identical to the design.
export const stroke = 'shadow-[inset_0_0_0_1px_var(--color-bookla-line)]';
export const strokeTop = 'shadow-[inset_0_1px_0_0_var(--color-bookla-line)]';

// Interaction states. The Figma file defines no hover/focus variants, so these only add a hover
// colour/underline and a keyboard focus outline; the resting appearance is unchanged.
export const focusRing = 'outline-offset-2 focus-visible:outline-2 focus-visible:outline-bookla-forest';
export const focusRingOnDark = 'outline-offset-2 focus-visible:outline-2 focus-visible:outline-bookla-paper';
export const textLink = 'underline-offset-4 hover:underline';
export const mutedLink = 'transition-colors hover:text-bookla-forest';
export const forestButton = 'transition-colors hover:bg-bookla-forest/90';
export const outlineButton = 'transition-colors hover:bg-bookla-sand';
export const paperButton = 'transition-colors hover:bg-bookla-sage';

export const Icon = ({ src, width, height = width, className = '' }) => (
  <img
    src={src}
    alt=""
    aria-hidden="true"
    width={width}
    height={height}
    className={`block shrink-0 ${className}`}
  />
);

export const Logo = ({ className = '' }) => (
  <span className={`flex shrink-0 items-center gap-2 ${className}`}>
    <Icon src={icons.bookOpen27} width={27} height={28} />
    <span className="font-lora text-[30px]/[38px] font-semibold whitespace-nowrap text-bookla-forest">Bookla</span>
    <span className="size-[5px] shrink-0 rounded-[5px] bg-bookla-clay" />
  </span>
);

// The page is lang="az", where CSS uppercase turns i into İ. Figma renders the eyebrows with English
// casing (YENI), so the visible copy is uppercased as English and screen readers get the az text.
export const Eyebrow = ({ children, className = 'text-bookla-forest' }) => (
  <p className={`text-[11px]/[13px] font-semibold whitespace-nowrap ${className}`}>
    <span className="sr-only">{children}</span>
    <span aria-hidden="true" lang="en" className="uppercase">
      {children}
    </span>
  </p>
);

// Not part of the Figma file: marks which advertised features the app already has.
const statusTags = {
  available: { label: 'Mövcuddur', dot: 'bg-bookla-forest' },
  partial: { label: 'Qismən', srLabel: 'Qismən mövcuddur', dot: 'bg-bookla-clay' },
  soon: { label: 'Tezliklə', dot: 'bg-bookla-muted' },
};

export const StatusTag = ({ status, label, className = '' }) => {
  const tag = statusTags[status];
  const text = label ?? tag.label;
  return (
    <span
      className={`inline-flex h-5 shrink-0 items-center gap-1 rounded-full bg-white px-1.5 text-[10px]/[12px] font-semibold whitespace-nowrap text-bookla-forest ${stroke} ${className}`}
    >
      <span aria-hidden="true" className={`size-[6px] shrink-0 rounded-full ${tag.dot}`} />
      {tag.srLabel && !label ? (
        <>
          <span aria-hidden="true">{text}</span>
          <span className="sr-only">{tag.srLabel}</span>
        </>
      ) : (
        text
      )}
    </span>
  );
};

export const AvatarStack = ({ group, size }) => (
  <div className="flex shrink-0 items-start">
    {avatarGroups[group].map((src, index) => (
      <img
        key={src}
        src={src}
        alt=""
        aria-hidden="true"
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className={`block shrink-0 rounded-full ${index < 2 ? 'mr-[-6px]' : ''}`}
      />
    ))}
  </div>
);

const coverSizes = {
  hero: {
    box: 'h-[205px] w-[138px] p-[13.8px] md:h-[318px] md:w-[218px] md:p-[21.8px]',
    author: 'text-[7px]/[10px] md:text-[10px]/[14px]',
    title: 'text-[16px]/[19px] md:text-[27px]/[31px]',
  },
  club: { box: 'h-[176px] w-[120px] p-3', author: 'text-[7px]/[10px]', title: 'text-[16px]/[19px]' },
  shelf: {
    box: 'h-[94px] w-[64px] p-2.5 xl:h-[116px] xl:w-[82px]',
    author: 'text-[7px]/[10px]',
    title: 'text-[11px]/[13px] xl:text-[16px]/[19px]',
  },
  progress: { box: 'h-[73px] w-[50px] p-2.5', author: 'text-[7px]/[10px]', title: 'text-[11px]/[13px]' },
  reading: {
    box: 'h-[123px] w-[84px] p-2.5 md:h-[156px] md:w-[108px] md:p-[10.8px]',
    author: 'text-[7px]/[10px]',
    title: 'text-[16px]/[19px]',
  },
};

export const BookCover = ({ book, size }) => {
  const s = coverSizes[size];
  return (
    <div
      className={`relative flex shrink-0 flex-col items-start overflow-hidden rounded-[3px] shadow-[0px_8px_28px_0px_rgba(24,61,53,0.06)] ${book.color} ${s.box}`}
    >
      <img
        src={book.image}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 h-[44%] w-full max-w-none object-cover"
      />
      <div className="absolute top-0 left-[3px] h-full w-[2px] bg-[rgba(255,255,255,0.13)]" />
      <p className={`relative w-full text-bookla-paper ${s.author}`}>{book.author}</p>
      <p className={`relative w-full font-lora text-bookla-paper ${s.title}`}>{book.title}</p>
    </div>
  );
};

export const SampleCard = ({ children, className = '' }) => (
  <div className={`flex w-full flex-col items-start gap-3 rounded-[16px] bg-white p-4 ${stroke} ${className}`}>
    {children}
  </div>
);

const PollOption = ({ title, votes, barWidth, tone }) => (
  <div className={`flex w-full flex-col items-start gap-[7px] overflow-hidden rounded-[8px] p-2.5 ${tone}`}>
    <div className="flex w-full items-start justify-between text-[11px]/[13px] whitespace-nowrap">
      <p>{title}</p>
      <p className="text-bookla-muted">{votes}</p>
    </div>
    <div className="h-[3px] shrink-0 rounded-[3px] bg-bookla-forest" style={{ width: barWidth }} />
  </div>
);

export const PollCard = ({ className = '' }) => (
  <SampleCard className={className}>
    <p className="text-[12px]/[15px] font-semibold whitespace-nowrap">Növbəti kitabımız hansıdır?</p>
    <PollOption title="Kiçik şahzadə" votes="5 səs" barWidth={145} tone="bg-bookla-sage" />
    <PollOption title="Səfillər" votes="3 səs" barWidth={88} tone="bg-bookla-paper" />
  </SampleCard>
);

export const MeetingCard = ({ className = '' }) => (
  <SampleCard className={className}>
    <div className="flex w-full items-center gap-3.5">
      <div className="flex h-[56px] w-[48px] shrink-0 flex-col items-center justify-center gap-0.5 overflow-hidden rounded-[8px] bg-bookla-blush whitespace-nowrap">
        <p className="text-[9px]/[11px]">OKT</p>
        <p className="font-lora text-[24px]/[31px]">18</p>
      </div>
      <div className="flex min-w-px flex-1 flex-col items-start gap-[5px] overflow-hidden">
        <p className="w-full text-[12px]/[15px] font-semibold">Bir kitab, bir söhbət</p>
        <p className="w-full text-[11px]/[13px] text-bookla-muted">Bazar · 19:00 · Onlayn</p>
      </div>
    </div>
    <div className="flex h-[30px] w-full items-center justify-center overflow-hidden rounded-[6px] bg-bookla-sage">
      <p className="text-[11px]/[13px] font-medium whitespace-nowrap">Təqvimə əlavə et</p>
    </div>
  </SampleCard>
);

export const DiscussionCard = ({ className = '' }) => (
  <SampleCard className={className}>
    <div className="flex items-center gap-2.5">
      <AvatarStack group="discussion" size={25} />
      <p className="text-[11px]/[13px] font-semibold whitespace-nowrap">Aysel · bu gün</p>
    </div>
    <p className="w-full text-[13px]/[20px] text-bookla-ink">Sizcə, Nino üçün ev nə deməkdir?</p>
    <div className="flex items-center gap-[7px]">
      <Icon src={icons.messageCircle14} width={14} />
      <p className="text-[11px]/[13px] whitespace-nowrap text-bookla-muted">4 cavab · Söhbətə qoşul</p>
    </div>
  </SampleCard>
);

export const ProgressBlock = ({ textSize, fillWidth }) => (
  <div className="flex w-full flex-col items-start gap-2.5 overflow-hidden">
    <div className={`flex w-full items-center justify-between whitespace-nowrap ${textSize}`}>
      <p className="text-bookla-muted">8 / 12 fəsil</p>
      <p className="font-semibold">67%</p>
    </div>
    <div className="flex h-[5px] w-full items-start overflow-hidden rounded-full bg-bookla-sage">
      <div className={`h-[5px] shrink-0 rounded-full bg-bookla-forest ${fillWidth}`} />
    </div>
  </div>
);
