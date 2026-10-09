import { useState } from 'react';
import { Link } from 'react-router-dom';
import '@fontsource-variable/inter';
import '@fontsource-variable/lora';
import '@fontsource-variable/lora/wght-italic.css';
import { books, icons, readingCircle } from '../components/landing/assets';
import {
  AvatarStack,
  BookCover,
  DiscussionCard,
  Eyebrow,
  Icon,
  Logo,
  MeetingCard,
  PollCard,
  ProgressBlock,
  SampleCard,
  stroke,
  strokeTop,
} from '../components/landing/primitives';

// Layout follows the three Figma frames: base = "Bookla — Mobil" (390),
// md = "Bookla — Planşet" (768), xl = "Bookla — Masaüstü" (1440).

const navLinks = [
  { label: 'Ana səhifə', href: '#top', active: true },
  { label: 'Necə işləyir?', href: '#nece-isleyir' },
  { label: 'Kitab klubları', href: '#kitab-klublari' },
  { label: 'Kitabları kəşf et', to: '/books' },
];

const sectionPadding = 'px-6 py-14 md:px-10 md:py-16 xl:p-[88px]';
const sectionHeading = 'w-full font-lora';

const NavItem = ({ link, className = '', onClick }) =>
  link.to ? (
    <Link to={link.to} className={className} onClick={onClick}>
      {link.label}
    </Link>
  ) : (
    <a href={link.href} className={className} onClick={onClick}>
      {link.label}
    </a>
  );

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="relative bg-bookla-paper shadow-[inset_0_-1px_0_0_var(--color-bookla-line)]">
      <nav className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between overflow-hidden px-6 md:h-[88px] md:px-10 xl:px-[88px]">
        <a href="#top" className="flex" aria-label="Bookla — ana səhifə">
          <Logo />
        </a>

        <div className="hidden items-center gap-7 text-[13px]/[16px] whitespace-nowrap xl:flex">
          {navLinks.map((link) => (
            <NavItem key={link.label} link={link} className={link.active ? 'font-semibold' : ''} />
          ))}
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <Link to="/login" className="hidden text-[13px]/[16px] whitespace-nowrap md:block">
            Daxil ol
          </Link>
          <Link
            to="/register"
            className="flex h-[42px] items-center justify-center rounded-[8px] bg-bookla-forest px-[18px] text-[13px]/[16px] font-semibold whitespace-nowrap text-bookla-paper"
          >
            Klub yarat
          </Link>
          <button
            type="button"
            className="cursor-pointer xl:hidden"
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
        <div
          id="landing-menu"
          className="absolute inset-x-0 top-full z-20 flex flex-col gap-4 bg-bookla-paper px-6 py-5 text-[13px]/[16px] shadow-[inset_0_-1px_0_0_var(--color-bookla-line)] md:px-10 xl:hidden"
        >
          {navLinks.map((link) => (
            <NavItem
              key={link.label}
              link={link}
              className={link.active ? 'font-semibold' : ''}
              onClick={() => setMenuOpen(false)}
            />
          ))}
          <Link to="/login" className="md:hidden" onClick={() => setMenuOpen(false)}>
            Daxil ol
          </Link>
        </div>
      )}
    </header>
  );
};

const HeroPreview = () => (
  <div className="relative h-[734px] w-full shrink-0 overflow-hidden rounded-[24px] bg-bookla-sage md:h-[614px] xl:w-[624px]">
    {/* Absolute composition from Figma; centred when the card is wider than the frame it was drawn in. */}
    <div className="absolute top-0 left-[max(0px,calc(50%-171px))] h-full w-[342px] md:left-[max(0px,calc(50%-344px))] md:w-[688px] xl:left-0 xl:w-[624px]">
      <p className="absolute top-5 left-6 text-[9px]/[11px] whitespace-nowrap">
        BOOKLA · NÜMUNƏ GÖRÜNÜŞ
      </p>

      <div className="absolute top-[56px] left-5 md:top-[65px] md:left-[60px]">
        <BookCover book={books.aliVeNino} size="hero" />
      </div>

      <div className="absolute top-[70px] left-[180px] flex w-[140px] flex-col items-start gap-2 overflow-hidden md:top-[54px] md:left-[318px] md:w-[255px]">
        <p className="w-full font-lora text-[20px]/[26px] italic md:text-[25px]/[32px]">
          Birlikdə oxuduğumuz hekayə.
        </p>
        <p className="text-[10px]/[12px] whitespace-nowrap text-bookla-muted">Azərbaycan ədəbiyyatı</p>
      </div>

      <div className="absolute top-[202px] left-[82px] flex w-[242px] flex-col items-start gap-3.5 overflow-hidden rounded-[16px] bg-white p-[18px] shadow-[0px_16px_40px_0px_rgba(24,61,53,0.11)] md:top-[158px] md:left-[266px] md:w-[316px] md:p-6">
        <div className="flex w-full items-start justify-between text-[10px]/[12px] whitespace-nowrap">
          <p className="text-bookla-muted">OXU KLUBUM</p>
          <p className="text-bookla-clay">Nümunə</p>
        </div>
        <p className="font-lora text-[26px]/[33px] whitespace-nowrap">Səhifə arası</p>
        <div className="flex w-full items-center gap-3 overflow-hidden">
          <AvatarStack group="hero" size={28} />
          <p className="min-w-px flex-1 text-[11px]/[13px] text-bookla-muted">Hazırda: Əli və Nino</p>
        </div>
        <ProgressBlock textSize="text-[11px]/[13px] md:text-[12px]/[15px]" fillWidth="w-[128px] md:w-[180px]" />
        <p className="text-[11px]/[13px] font-medium whitespace-nowrap">8-ci fəsli müzakirə et →</p>
      </div>

      <div className="absolute top-[429px] left-4 flex w-[240px] items-start overflow-hidden drop-shadow-[0px_16px_20px_rgba(24,61,53,0.11)] md:top-[383px] md:left-6 md:w-[268px]">
        <PollCard />
      </div>

      <div className="absolute top-[582px] left-[74px] flex w-[250px] items-start overflow-hidden drop-shadow-[0px_8px_14px_rgba(24,61,53,0.06)] md:top-[446px] md:left-[318px] md:w-[282px]">
        <MeetingCard />
      </div>
    </div>
  </div>
);

const Hero = () => (
  <>
    <section className="mx-auto flex max-w-[1440px] flex-col items-start justify-center gap-9 overflow-hidden px-6 pt-12 pb-10 md:px-10 xl:flex-row xl:items-center xl:justify-start xl:gap-10 xl:px-[88px] xl:pt-16 xl:pb-14">
      <div className="flex w-full flex-col items-start gap-6 overflow-hidden xl:w-auto xl:max-w-[600px] xl:min-w-0 xl:flex-1">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className="h-px w-6 shrink-0 bg-bookla-clay" />
          <Eyebrow>Oxumağın yeni sosial məkanı</Eyebrow>
        </div>
        <h1 className={`${sectionHeading} text-[38px]/[46px] md:text-[54px]/[66px] xl:text-[61px]/[74px]`}>
          Hər kitab yeni bir söhbətin başlanğıcıdır.
        </h1>
        <p className="w-full text-[15px]/[25px] text-bookla-muted md:text-[17px]/[28px]">
          Öz kitab klubunu yarat, dostlarınla birlikdə oxu, fikirlərini paylaş və yeni hekayələr kəşf et.
        </p>
        <div className="flex w-full flex-col items-start gap-3 overflow-hidden md:flex-row">
          <Link
            to="/register"
            className="flex h-[52px] w-full items-center justify-center gap-3 overflow-hidden rounded-[8px] bg-bookla-forest px-[22px] md:w-auto"
          >
            <span className="text-[14px]/[17px] font-semibold whitespace-nowrap text-bookla-paper">Pulsuz klub yarat</span>
            <Icon src={icons.arrowUpRight17Light} width={17} />
          </Link>
          <Link
            to="/books"
            className={`flex h-[52px] w-full items-center justify-center gap-3 overflow-hidden rounded-[8px] px-[22px] md:w-auto md:min-w-[180px] ${stroke}`}
          >
            <span className="text-[14px]/[17px] font-semibold whitespace-nowrap">Kitabları kəşf et</span>
            <Icon src={icons.arrowUpRight17} width={17} />
          </Link>
        </div>
        <div className="flex w-full flex-col items-start gap-2 overflow-hidden pt-2">
          <p className="w-full font-lora text-[19px]/[24px] italic">Kitablar bizi bir araya gətirir.</p>
          <p className="w-full text-[11px]/[18px] text-bookla-muted">Oxu. Paylaş. Birlikdə kəşf et.</p>
        </div>
      </div>

      <HeroPreview />
    </section>

    <div className="shadow-[inset_0_1px_0_0_var(--color-bookla-line),inset_0_-1px_0_0_var(--color-bookla-line)]">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between overflow-hidden px-6 py-[22px] md:px-10 xl:px-[88px]">
        <p className="min-w-px flex-1 font-lora text-[17px]/[22px] md:text-[22px]/[28px]">Bir kitab. Fərqli baxışlar. Ortaq söhbət.</p>
        <p className="hidden text-[11px]/[13px] whitespace-nowrap text-bookla-muted md:block">BOOKLA.ORG</p>
      </div>
    </div>
  </>
);

const steps = [
  {
    number: '01',
    title: 'Klubunu yarat',
    text: 'Dostlarını dəvət et və öz oxu icmanı formalaşdır.',
    preview: (
      <SampleCard>
        <p className="text-[11px]/[13px] whitespace-nowrap text-bookla-muted">Klubun adı</p>
        <div className={`flex w-full items-start overflow-hidden rounded-[7px] p-3 ${stroke}`}>
          <p className="text-[12px]/[15px] whitespace-nowrap">Səhifə arası</p>
        </div>
        <div className="flex w-full items-center justify-between overflow-hidden">
          <AvatarStack group="invite" size={24} />
          <p className="text-[11px]/[13px] font-semibold whitespace-nowrap">+ Dostunu dəvət et</p>
        </div>
      </SampleCard>
    ),
  },
  {
    number: '02',
    title: 'Kitabını seç',
    text: 'Təkliflər paylaşın, səsvermə keçirin və növbəti kitabı birlikdə seçin.',
    preview: <PollCard />,
  },
  {
    number: '03',
    title: 'Birlikdə oxuyun',
    text: 'Oxu irəliləyişini izləyin, qeydlər paylaşın və kitabları müzakirə edin.',
    preview: <DiscussionCard />,
  },
];

const HowItWorks = () => (
  <section
    id="nece-isleyir"
    className={`mx-auto flex max-w-[1440px] flex-col items-start gap-10 ${sectionPadding}`}
  >
    <div className="flex w-full flex-col items-start gap-4 overflow-hidden">
      <Eyebrow>Sadə başlanğıc</Eyebrow>
      <div className="flex w-full flex-col items-start justify-end gap-6 overflow-hidden xl:flex-row xl:items-end xl:justify-start">
        <h2 className={`${sectionHeading} text-[31px]/[38px] md:text-[43px]/[52px] xl:w-[720px] xl:shrink-0`}>
          Bookla ilə oxumaq daha maraqlıdır.
        </h2>
        <p className="w-full text-[15px]/[25px] text-bookla-muted xl:w-auto xl:min-w-px xl:flex-1">
          İlk dəvətdən son səhifəyədək — oxu yolunuzun hər addımı bir yerdə.
        </p>
      </div>
    </div>

    <div className="flex w-full flex-col items-start gap-8 overflow-hidden md:gap-7 xl:flex-row">
      {steps.map((step) => (
        <div
          key={step.number}
          className={`flex w-full flex-col items-start gap-[22px] overflow-hidden pt-5 md:flex-row md:gap-8 xl:w-auto xl:min-w-px xl:flex-1 xl:flex-col xl:gap-[22px] ${strokeTop}`}
        >
          <div className="flex w-full flex-col items-start gap-3 overflow-hidden md:min-w-px md:flex-1 xl:w-full xl:flex-none">
            <p className="font-lora text-[31px]/[40px] whitespace-nowrap text-bookla-clay">{step.number}</p>
            <h3 className="font-lora text-[25px]/[32px] whitespace-nowrap">{step.title}</h3>
            <p className="min-h-[74px] w-full text-[15px]/[25px] text-bookla-muted md:min-h-[50px] xl:min-h-[74px]">
              {step.text}
            </p>
          </div>
          <div className="flex h-[188px] w-full shrink-0 flex-col items-start justify-center overflow-hidden md:w-[300px] xl:w-full">
            {step.preview}
          </div>
        </div>
      ))}
    </div>
  </section>
);

const clubs = [
  {
    book: books.aliVeNino,
    tint: 'bg-bookla-sage',
    mood: 'Doğma hekayələr, yeni baxışlar.',
    genre: 'Azərbaycan ədəbiyyatı',
    name: 'Səhifə arası',
    description:
      'Doğma hekayələrə yeni baxış. Birlikdə oxuyur, şəhərimizi və özümüzü yenidən kəşf edirik.',
  },
  {
    book: books.kicikSahzade,
    tint: 'bg-bookla-blush',
    mood: 'Bir fincan çay, bir yaxşı kitab.',
    genre: 'Dünya ədəbiyyatı',
    name: 'Bazar günü oxuları',
    description: 'Həftənin ən sakit vaxtını yaxşı bir kitaba və səmimi bir söhbətə ayıranların klubu.',
  },
  {
    book: books.sefiller,
    tint: 'bg-bookla-sand',
    mood: 'Bəzi hekayələr həmişə yenidir.',
    genre: 'Klassik ədəbiyyat',
    name: 'Klassiklərə qayıdış',
    description: 'Zamanı aşan əsərləri tələsmədən oxuyuruq. Hər görüşdə başqa bir məna tapırıq.',
  },
];

const ClubCard = ({ club }) => (
  <article className="flex w-full flex-col items-start overflow-hidden rounded-[16px] bg-white md:flex-row xl:w-auto xl:min-w-px xl:flex-1 xl:flex-col">
    <div
      className={`flex h-[240px] w-full shrink-0 items-center gap-5 p-6 md:h-auto md:min-h-[340px] md:w-[250px] md:flex-col md:justify-center md:self-stretch xl:h-[240px] xl:min-h-0 xl:w-full xl:flex-row xl:justify-start xl:self-auto ${club.tint}`}
    >
      <BookCover book={club.book} size="club" />
      <div className="flex min-w-px flex-1 flex-col items-start gap-[18px] md:w-full md:flex-none xl:w-auto xl:flex-1">
        <p className="text-[9px]/[11px] whitespace-nowrap">NÜMUNƏ KLUB</p>
        <p className="w-full font-lora text-[21px]/[29px] italic md:text-[17px]/[24px] xl:text-[21px]/[29px]">{club.mood}</p>
      </div>
    </div>

    <div className="flex w-full flex-col items-start gap-4 overflow-hidden p-6 md:min-w-px md:flex-1 xl:w-full xl:flex-none">
      <p className="text-[10px]/[12px] font-semibold whitespace-nowrap text-bookla-clay">{club.genre}</p>
      <h3 className="w-full font-lora text-[25px]/[32px]">{club.name}</h3>
      <p className="min-h-[76px] w-full text-[13px]/[21px] text-bookla-muted md:min-h-[50px] xl:min-h-[76px]">
        {club.description}
      </p>
      <div className={`flex w-full flex-col items-start gap-[5px] overflow-hidden pt-3.5 ${strokeTop}`}>
        <p className="text-[10px]/[12px] whitespace-nowrap text-bookla-muted">Hazırda oxunur</p>
        <p className="w-full text-[12px]/[15px] font-medium">
          {club.book.title} · {club.book.author}
        </p>
      </div>
      <div className="flex w-full items-center justify-between overflow-hidden pt-1">
        <AvatarStack group="club" size={26} />
        <Link to="/register" className="flex items-center gap-2.5 overflow-hidden">
          <span className="text-[12px]/[15px] font-semibold whitespace-nowrap">Kluba bax</span>
          <Icon src={icons.arrowUpRight16} width={16} />
        </Link>
      </div>
    </div>
  </article>
);

const BookClubs = () => (
  <section id="kitab-klublari" className="bg-bookla-sand">
    <div className={`mx-auto flex max-w-[1440px] flex-col items-start gap-9 ${sectionPadding}`}>
      <div className="flex w-full flex-col items-start gap-4 overflow-hidden">
        <Eyebrow>Öz oxu dairəni tap</Eyebrow>
        <h2 className={`${sectionHeading} text-[31px]/[38px] md:text-[43px]/[52px] xl:w-[760px]`}>
          Eyni kitabı sevən insanlarla tanış ol.
        </h2>
        <div className="flex w-full items-center gap-2 overflow-hidden">
          <Icon src={icons.info15} width={15} />
          <p className="min-w-px flex-1 text-[12px]/[20px] text-bookla-muted">
            Bu klublar platformanı göstərmək üçün hazırlanmış nümunələrdir.
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col items-start gap-6 overflow-hidden xl:flex-row">
        {clubs.map((club) => (
          <ClubCard key={club.name} club={club} />
        ))}
      </div>
    </div>
  </section>
);

// Card widths per row: desktop 510px + 2 flexible / 3 equal, tablet 2 per row, mobile 1 per row.
const featureBasis = {
  first: 'md:basis-[calc(50%-10.1px)] md:grow xl:basis-[510px] xl:grow-0',
  rest: 'md:basis-[calc(50%-10.1px)] md:grow xl:basis-[calc((100%-550.2px)/2)] xl:grow',
  third: 'md:basis-[calc(50%-10.1px)] md:grow xl:basis-[calc((100%-40.2px)/3)] xl:grow',
};

const features = [
  {
    title: 'Kitab rəfi',
    text: 'Oxuduğun və oxumaq istədiyin kitabları bir yerdə saxla.',
    tint: 'bg-bookla-sage',
    basis: featureBasis.first,
    preview: (
      <SampleCard>
        <div className="flex w-full items-start gap-4 overflow-hidden text-[11px]/[13px] whitespace-nowrap">
          <p className="font-semibold">Oxuyuram</p>
          <p className="text-bookla-muted">Oxumaq istəyirəm</p>
        </div>
        <div className="flex w-full items-start justify-center gap-3.5">
          <BookCover book={books.aliVeNino} size="shelf" />
          <BookCover book={books.kicikSahzade} size="shelf" />
          <BookCover book={books.sefiller} size="shelf" />
        </div>
      </SampleCard>
    ),
  },
  {
    title: 'Birgə səsvermə',
    text: 'Növbəti kitabı klub üzvləri ilə birlikdə seç.',
    tint: 'bg-bookla-sand',
    basis: featureBasis.rest,
    preview: <PollCard />,
  },
  {
    title: 'Oxu irəliləyişi',
    text: 'Fəsillər üzrə irəliləyişi izləyin.',
    tint: 'bg-bookla-sand',
    basis: featureBasis.rest,
    preview: (
      <SampleCard>
        <div className="flex w-full items-center gap-3">
          <BookCover book={books.aliVeNino} size="progress" />
          <div className="flex min-w-px flex-1 flex-col items-start gap-1.5 overflow-hidden">
            <p className="text-[13px]/[16px] font-semibold whitespace-nowrap">Əli və Nino</p>
            <p className="w-full text-[11px]/[13px] text-bookla-muted">Oxumağa davam et</p>
          </div>
        </div>
        <ProgressBlock textSize="text-[11px]/[13px]" fillWidth="w-[128px]" />
      </SampleCard>
    ),
  },
  {
    title: 'Qeydlər və sitatlar',
    text: 'Sevdiyin fikirləri yadda saxla və paylaş.',
    tint: 'bg-bookla-blush',
    basis: featureBasis.third,
    preview: (
      <SampleCard>
        <p className="text-[10px]/[12px] whitespace-nowrap text-bookla-muted">ŞƏXSİ QEYDİM · 8-Cİ FƏSİL</p>
        <p className="w-full font-lora text-[16px]/[24px] italic">
          “Bu fəsil mənə doğma şəhərimə yenidən baxmağı öyrətdi.”
        </p>
        <div className="flex items-center gap-2 overflow-hidden">
          <Icon src={icons.bookmark14} width={14} />
          <p className="text-[10px]/[12px] whitespace-nowrap text-bookla-muted">Yadda saxlanıldı</p>
        </div>
      </SampleCard>
    ),
  },
  {
    title: 'Kitab müzakirələri',
    text: 'Fikirlərini klub üzvləri ilə bölüş.',
    tint: 'bg-bookla-sand',
    basis: featureBasis.third,
    preview: <DiscussionCard />,
  },
  {
    title: 'Klub görüşləri',
    text: 'Növbəti görüşlərinizi planlaşdırın.',
    tint: 'bg-bookla-sage',
    basis: featureBasis.third,
    preview: <MeetingCard />,
  },
];

const ReadingTools = () => (
  <section className={`mx-auto flex max-w-[1440px] flex-col items-start gap-10 ${sectionPadding}`}>
    <div className="flex w-full flex-col items-start gap-4 overflow-hidden xl:w-[810px]">
      <Eyebrow>Oxu həyatın, bir yerdə</Eyebrow>
      <h2 className={`${sectionHeading} text-[31px]/[38px] md:text-[43px]/[52px]`}>Yaxşı kitablar paylaşdıqca daha da dəyərlənir.</h2>
      <p className="w-full text-[15px]/[25px] text-bookla-muted">
        Kitablarını, fikirlərini və görüşlərini eyni məkanda topla. Sənə sadəcə oxumaq qalsın.
      </p>
    </div>

    <div className="flex w-full flex-wrap items-stretch gap-5 overflow-hidden">
      {features.map((feature) => (
        <div
          key={feature.title}
          className={`flex min-w-px basis-full flex-col items-start gap-[22px] overflow-hidden rounded-[16px] p-5 md:p-6 ${feature.tint} ${feature.basis}`}
        >
          <div className="flex min-h-[100px] w-full flex-col items-start gap-2.5 overflow-hidden xl:min-h-[105px]">
            <h3 className="w-full font-lora text-[25px]/[31px]">{feature.title}</h3>
            <p className="w-full text-[13px]/[21px] text-bookla-muted">{feature.text}</p>
          </div>
          <div className="flex min-h-[176px] w-full flex-col items-start justify-center">{feature.preview}</div>
        </div>
      ))}
    </div>
  </section>
);

const sideMenu = [
  { label: 'İcmal', icon: icons.layoutDashboard16, active: true },
  { label: 'Klublarım', icon: icons.users16 },
  { label: 'Kitab rəfim', icon: icons.library16 },
  { label: 'Qeydlərim', icon: icons.bookmark16 },
  { label: 'Görüşlər', icon: icons.calendarDays16 },
];

const productTabs = ['İcmal', 'Klublarım', 'Kitab rəfim', 'Qeydlərim'];
const myClubs = ['Səhifə arası', 'Bazar günü oxuları', 'Klassiklərə qayıdış'];

const ReadingCard = () => (
  <div className="flex w-full flex-col items-start gap-[18px] rounded-[16px] bg-bookla-paper p-4 md:p-5">
    <div className="flex w-full items-start justify-between overflow-hidden whitespace-nowrap">
      <p className="text-[11px]/[13px] font-semibold">Hazırda oxuyuram</p>
      <p className="text-[10px]/[12px] text-bookla-muted">Səhifə arası</p>
    </div>
    <div className="flex w-full items-center gap-[18px]">
      <BookCover book={books.aliVeNino} size="reading" />
      <div className="flex min-w-px flex-1 flex-col items-start gap-3 overflow-hidden">
        <p className="w-full font-lora text-[22px]/[28px] md:text-[28px]/[36px]">Əli və Nino</p>
        <p className="text-[11px]/[13px] whitespace-nowrap text-bookla-muted">Qurban Səid</p>
        <p className="w-full text-[11px]/[17px]">Bu həftə: 7–9-cu fəsillər</p>
        <AvatarStack group="invite" size={24} />
      </div>
    </div>
    <ProgressBlock textSize="text-[11px]/[13px] md:text-[12px]/[15px]" fillWidth="w-[128px] md:w-[180px]" />
    <div className="flex h-9 w-full items-center justify-center overflow-hidden rounded-[8px] bg-bookla-forest">
      <p className="text-[11px]/[13px] font-medium whitespace-nowrap text-bookla-paper">İrəliləyişi yenilə</p>
    </div>
  </div>
);

const ProductPreview = () => (
  <div className="relative flex w-full flex-col items-start overflow-hidden rounded-[16px] bg-white shadow-[0px_16px_40px_0px_rgba(24,61,53,0.11)] after:pointer-events-none after:absolute after:inset-0 after:rounded-[16px] after:border after:border-[rgba(24,61,53,0.13)] after:content-['']">
    <div className="flex h-[38px] w-full shrink-0 items-center justify-between overflow-hidden bg-bookla-paper px-4 shadow-[inset_0_-1px_0_0_var(--color-bookla-line)] md:px-6">
      <div className="flex items-start gap-[5px] overflow-hidden">
        {[0, 1, 2].map((dot) => (
          <span key={dot} className="size-[6px] shrink-0 rounded-[6px] bg-bookla-line" />
        ))}
      </div>
      <p className="text-[10px]/[12px] whitespace-nowrap text-bookla-muted">bookla.org · Nümunə hesab</p>
      <Icon src={icons.lockKeyhole12} width={12} />
    </div>

    <div className="flex w-full flex-col items-start overflow-hidden xl:flex-row">
      <aside className="hidden w-[190px] shrink-0 flex-col items-start gap-9 self-stretch overflow-hidden bg-bookla-paper p-5 shadow-[inset_-1px_0_0_0_var(--color-bookla-line)] xl:flex">
        <Logo />
        <div className="flex w-full flex-col items-start gap-2 overflow-hidden">
          {sideMenu.map((item) => (
            <div
              key={item.label}
              className={`flex w-full items-center gap-2.5 overflow-hidden rounded-[8px] p-2.5 ${item.active ? 'bg-bookla-sage' : ''}`}
            >
              <Icon src={item.icon} width={16} />
              <p className={`text-[11px]/[13px] whitespace-nowrap ${item.active ? 'font-semibold' : ''}`}>{item.label}</p>
            </div>
          ))}
        </div>
        <div className={`flex h-9 w-full items-center justify-center overflow-hidden rounded-[8px] ${stroke}`}>
          <p className="text-[11px]/[13px] font-medium whitespace-nowrap">+ Yeni klub yarat</p>
        </div>
        <div className="flex w-full flex-col items-start gap-3 overflow-hidden pt-[155px]">
          <AvatarStack group="club" size={26} />
          <p className="text-[11px]/[13px] whitespace-nowrap">Aysel Məmmədova</p>
          <p className="text-[10px]/[12px] whitespace-nowrap text-bookla-muted">Nümunə hesab</p>
        </div>
      </aside>

      <div className="flex w-full flex-col items-start gap-4 overflow-hidden bg-bookla-paper p-4 md:p-6 xl:hidden">
        <div className="flex w-full items-center justify-between overflow-hidden">
          <Logo />
          <Icon src={icons.bell19} width={19} />
        </div>
        <div className="flex w-full items-start gap-[18px] overflow-hidden text-[10px]/[12px] whitespace-nowrap md:gap-7 md:text-[12px]/[15px]">
          {productTabs.map((tab, index) => (
            <p key={tab} className={index === 0 ? 'font-semibold' : 'text-bookla-muted'}>
              {tab}
            </p>
          ))}
        </div>
      </div>

      <div className="flex w-full flex-col items-start gap-6 overflow-hidden p-4 md:p-7 xl:w-auto xl:min-w-px xl:flex-1">
        <div className="flex w-full items-center justify-between overflow-hidden">
          <div className="flex min-w-px flex-1 flex-col items-start gap-[7px] overflow-hidden">
            <p className="font-lora text-[26px]/[33px] whitespace-nowrap md:text-[30px]/[38px]">Salam, Aysel.</p>
            <p className="w-full text-[11px]/[17px] text-bookla-muted">Bu gün hansı hekayəyə davam edirik?</p>
          </div>
          <Icon src={icons.bell20} width={20} className="hidden xl:block" />
        </div>

        <div className="flex w-full flex-col items-start gap-3 overflow-hidden">
          <p className="text-[12px]/[15px] font-semibold whitespace-nowrap">Mənim kitab klublarım</p>
          <div className="flex w-full flex-col items-start gap-2.5 overflow-hidden md:flex-row">
            {myClubs.map((club, index) => (
              <div
                key={club}
                className={`flex w-full items-center gap-2 overflow-hidden rounded-[8px] p-3 md:w-auto md:min-w-px md:flex-1 md:flex-col md:items-start ${index === 0 ? 'bg-bookla-sage' : 'bg-bookla-paper'}`}
              >
                <Icon src={icons.bookOpen16} width={16} />
                <p
                  className={`min-w-px flex-1 text-[11px]/[15px] md:w-full md:flex-none ${index === 0 ? 'font-semibold' : ''}`}
                >
                  {club}
                </p>
                <Icon src={icons.chevronRight13} width={13} className="md:hidden" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex w-full flex-col items-start gap-5 xl:flex-row">
          <div className="flex w-full flex-col items-start gap-5 xl:w-auto xl:min-w-px xl:flex-1">
            <ReadingCard />
            <div className="flex w-full flex-col items-start gap-3 overflow-hidden">
              <p className="text-[12px]/[15px] font-semibold whitespace-nowrap">Klubda son söhbət</p>
              <DiscussionCard />
            </div>
          </div>

          <div className="flex w-full flex-col items-start gap-5 overflow-hidden xl:w-[270px] xl:shrink-0">
            <div className="flex w-full flex-col items-start gap-3 overflow-hidden">
              <p className="text-[12px]/[15px] font-semibold whitespace-nowrap">Növbəti görüş</p>
              <MeetingCard />
            </div>
            <div className="flex w-full flex-col items-start gap-3 overflow-hidden">
              <p className="text-[12px]/[15px] font-semibold whitespace-nowrap">Klubun seçimi</p>
              <PollCard />
            </div>
            <div className="flex w-full flex-col items-start gap-2.5 overflow-hidden rounded-[16px] bg-bookla-blush p-4">
              <p className="text-[10px]/[12px] whitespace-nowrap text-bookla-muted">OXU QEYDİ</p>
              <p className="w-full font-lora text-[16px]/[24px] italic">
                Hər oxucu eyni kitabda başqa bir hekayə tapır.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const InsideBookla = () => (
  <section className="bg-bookla-sage">
    <div className={`mx-auto flex max-w-[1440px] flex-col items-start gap-10 ${sectionPadding}`}>
      <div className="flex w-full flex-col items-start gap-4 overflow-hidden xl:w-[760px]">
        <Eyebrow>Oxu məkanına xoş gəlmisən</Eyebrow>
        <h2 className={`${sectionHeading} text-[31px]/[38px] md:text-[43px]/[52px]`}>Kitabın açıq, söhbətin davam edir.</h2>
        <p className="w-full text-[15px]/[25px]">
          Klubunun gündəliyi, oxuduğun kitab və paylaşmaq istədiyin fikirlər — hamısı bir baxışda.
        </p>
      </div>
      <ProductPreview />
      <p className="w-full text-[11px]/[18px]">
        Nümunə məhsul görünüşü. Kitablar, klublar və söhbətlər tanışlıq məqsədilə göstərilir.
      </p>
    </div>
  </section>
);

const ReadingCommunity = () => (
  <section
    className={`mx-auto flex max-w-[1440px] flex-col items-start justify-center gap-8 xl:flex-row xl:items-center xl:justify-start xl:gap-[72px] ${sectionPadding}`}
  >
    <div className="flex w-full flex-col items-start gap-6 overflow-hidden xl:w-[552px] xl:shrink-0">
      <Eyebrow>Səhifələrin o tayında</Eyebrow>
      <h2 className={`${sectionHeading} text-[32px]/[39px] md:text-[44px]/[54px]`}>
        Tək oxumaq gözəldir. Birlikdə oxumaq isə başqa dünyadır.
      </h2>
      <p className="w-full text-[15px]/[25px] text-bookla-muted">
        Bəzən bir kitabı bitirmək yox, onun haqqında danışmaq istəyirsən. Səni düşündürən bir cümləni, sevdiyin bir
        obrazı, cavabını axtardığın sualı paylaşmaq.
      </p>
      <p className="w-full text-[15px]/[25px] text-bookla-muted">
        Bookla həmin söhbətə yer açır. Tanış dostlarla və hələ tanımadığın oxucularla yeni hekayələrə birlikdə başlamaq
        üçün.
      </p>
      <Link to="/register" className="flex items-center gap-3 overflow-hidden">
        <span className="text-[13px]/[16px] font-semibold whitespace-nowrap">Öz oxu dairəni tap</span>
        <Icon src={icons.arrowUpRight18} width={18} />
      </Link>
    </div>

    <figure className="flex w-full flex-col items-start gap-4 overflow-hidden xl:w-auto xl:min-w-px xl:flex-1">
      <picture className="block h-[350px] w-full md:h-[430px] xl:h-[500px]">
        <source media="(min-width: 80rem)" srcSet={readingCircle.desktop} />
        <source media="(min-width: 48rem)" srcSet={readingCircle.tablet} />
        <img
          src={readingCircle.mobile}
          alt="Kafedə bir masa arxasında kitab müzakirə edən oxucular"
          loading="lazy"
          className="block size-full rounded-[16px] object-cover"
        />
      </picture>
      <figcaption className="flex w-full items-center justify-between overflow-hidden">
        <p className="min-w-px flex-1 text-[11px]/[13px] text-bookla-muted">Yaxşı söhbətlər çox vaxt bir kitabla başlayır.</p>
        <p className="font-lora text-[14px]/[18px] whitespace-nowrap text-bookla-clay italic">Bookla</p>
      </figcaption>
    </figure>
  </section>
);

const Invitation = () => (
  <section className="bg-bookla-forest">
    <div
      className={`mx-auto flex max-w-[1440px] flex-col items-start gap-8 overflow-hidden xl:flex-row xl:items-center xl:gap-[100px] ${sectionPadding}`}
    >
      <div className="flex w-full flex-col items-start gap-5 overflow-hidden xl:w-auto xl:min-w-px xl:flex-1">
        <Eyebrow className="text-bookla-sage">Növbəti səhifə səninlə başlayır</Eyebrow>
        <h2 className={`${sectionHeading} text-[35px]/[43px] text-bookla-paper md:text-[45px]/[55px] xl:text-[52px]/[63px]`}>
          Növbəti sevimli kitabını birlikdə kəşf et.
        </h2>
        <p className="w-full text-[16px]/[26px] text-bookla-sage">Öz oxu icmanı yaratmağa bu gün başla.</p>
      </div>
      <div className="flex w-full flex-col items-start gap-3.5 overflow-hidden xl:w-[240px] xl:shrink-0">
        <Link
          to="/register"
          className="flex h-[52px] w-full items-center justify-center gap-3 overflow-hidden rounded-[8px] bg-bookla-paper px-[22px] md:w-auto"
        >
          <span className="text-[14px]/[17px] font-semibold whitespace-nowrap">Bookla-ya qoşul</span>
          <Icon src={icons.arrowUpRight17} width={17} />
        </Link>
        <p className="text-[11px]/[13px] whitespace-nowrap text-bookla-sage">Bir kitab, yeni bir başlanğıc.</p>
      </div>
    </div>
  </section>
);

const footerColumns = [
  {
    title: 'Platforma',
    links: [
      { label: 'Ana səhifə', href: '#top' },
      { label: 'Necə işləyir?', href: '#nece-isleyir' },
      { label: 'Kitab klubları', href: '#kitab-klublari' },
      { label: 'Kitabları kəşf et', to: '/books' },
      { label: 'Daxil ol', to: '/login' },
    ],
  },
  {
    title: 'Bookla',
    // These pages don't exist in the app yet, so they render as plain text.
    links: [{ label: 'Haqqımızda' }, { label: 'Məxfilik siyasəti' }, { label: 'İstifadə şərtləri' }],
  },
];

const socialLinks = [
  { label: 'Instagram', icon: icons.instagram15 },
  { label: 'Facebook', icon: icons.facebook15 },
  { label: 'LinkedIn', icon: icons.linkedin15 },
];

const Footer = () => (
  <footer className="mx-auto flex max-w-[1440px] flex-col items-start gap-10 overflow-hidden px-6 pt-14 pb-7 md:px-10 xl:px-[88px]">
    <div className="flex w-full flex-col items-start gap-8 overflow-hidden md:gap-14 xl:flex-row">
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

      <div className="flex w-full items-start gap-6 overflow-hidden text-[12px]/[15px] md:gap-14 xl:w-auto xl:min-w-px xl:flex-1">
        {footerColumns.map((column) => (
          <div key={column.title} className="flex min-w-px flex-1 flex-col items-start gap-3.5 overflow-hidden">
            <p className="font-semibold whitespace-nowrap">{column.title}</p>
            {column.links.map((link) =>
              link.to || link.href ? (
                <NavItem key={link.label} link={link} className="block w-full leading-[18px] text-bookla-muted" />
              ) : (
                <p key={link.label} className="w-full leading-[18px] text-bookla-muted">
                  {link.label}
                </p>
              )
            )}
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

const LandingPage = () => (
  <div id="top" className="min-h-screen bg-bookla-paper font-inter text-bookla-forest antialiased">
    <Header />
    <main>
      <Hero />
      <HowItWorks />
      <BookClubs />
      <ReadingTools />
      <InsideBookla />
      <ReadingCommunity />
      <Invitation />
    </main>
    <Footer />
  </div>
);

export default LandingPage;
