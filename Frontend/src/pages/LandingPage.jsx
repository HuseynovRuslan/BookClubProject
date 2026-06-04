import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  LibraryBig,
  MessageCircle,
  Search,
  Users,
} from 'lucide-react';

const navLinks = [
  { label: 'Why it works', href: '#benefits' },
  { label: 'Inside the club', href: '#inside' },
  { label: 'Reader notes', href: '#notes' },
];

const benefits = [
  {
    icon: BookOpen,
    title: 'A shared shelf that stays tidy',
    description:
      'Keep current reads, next picks, and finished books in one place without turning it into a spreadsheet.',
    className: 'lg:col-span-7',
  },
  {
    icon: MessageCircle,
    title: 'Discussions with a little structure',
    description:
      'Add prompts, chapter threads, and spoiler-safe notes so the conversation starts naturally.',
    className: 'lg:col-span-5',
  },
  {
    icon: CalendarDays,
    title: 'A reading pace people can follow',
    description:
      'Set gentle milestones and reminders that help the group keep moving without making reading feel assigned.',
    className: 'lg:col-span-5',
  },
  {
    icon: Search,
    title: 'Better ways to choose the next book',
    description:
      'Collect suggestions, compare mood and length, then vote before the group chat gets too long.',
    className: 'lg:col-span-7',
  },
];

const details = [
  'Monthly picks with notes and member votes',
  'Private club rooms for friends, teams, or local groups',
  'Quote saving for the lines everyone wants to talk about',
  'Lightweight profiles that show what people actually read',
];

const testimonials = [
  {
    name: 'Leila M.',
    role: 'Runs a small Sunday book club',
    quote:
      'We used to lose track of whose turn it was to pick. Now we keep the list in one place and spend more time talking about the book.',
  },
  {
    name: 'Daniel R.',
    role: 'Reads with coworkers',
    quote:
      'The reminders are useful without being noisy. It feels like a calm place for the group, not another busy feed.',
  },
  {
    name: 'Nina A.',
    role: 'Member of two clubs',
    quote:
      'I like that it does not try too hard. I can see the next meeting, save a note, and check what everyone thought.',
  },
];

const PhotoPanel = () => (
  <div className="relative">
    <div className="absolute -left-4 top-8 hidden h-24 w-24 border border-[#C9A66B]/40 md:block" />
    <div className="relative overflow-hidden rounded-lg bg-[#2B2A27] shadow-2xl shadow-[#2B2A27]/20 transition-all duration-300 hover:-translate-y-1">
      <img
        src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=85"
        alt="A quiet reading room with shelves of books"
        className="h-[420px] w-full object-cover sm:h-[520px]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#1F1D1A]/80 via-transparent to-transparent" />
      <div className="absolute bottom-5 left-5 right-5 rounded-lg border border-white/15 bg-[#1F1D1A]/75 p-4 text-[#F7F0E6] backdrop-blur-md">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#C9A66B]">
          This month
        </p>
        <div className="mt-3 flex items-end justify-between gap-4">
          <div>
            <p className="text-lg font-semibold tracking-tight">The book everyone is reading</p>
            <p className="mt-1 text-sm leading-6 text-[#E8DDCB]/80">
              18 notes saved, 6 chapters left, meeting on Thursday.
            </p>
          </div>
          <div className="hidden items-center gap-1 text-sm font-medium text-[#F7F0E6] sm:flex">
            <Users className="h-4 w-4" />
            24
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SectionIntro = ({ eyebrow, title, text }) => (
  <div className="max-w-2xl">
    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#2F5D46]">{eyebrow}</p>
    <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-[#1F1D1A] sm:text-4xl lg:text-5xl">
      {title}
    </h2>
    <p className="mt-5 text-base leading-8 text-[#625B50] sm:text-lg">{text}</p>
  </div>
);

const BenefitCard = ({ benefit, index }) => {
  const Icon = benefit.icon;
  const isLarge = benefit.className.includes('7');

  return (
    <article
      className={`group rounded-lg border border-[#DDD0BC] bg-[#FFF9EF] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#B86545]/40 hover:shadow-xl hover:shadow-[#2B2A27]/10 sm:p-8 ${benefit.className}`}
    >
      <div className="flex h-full flex-col justify-between gap-10">
        <div>
          <div className="mb-7 flex h-11 w-11 items-center justify-center rounded-lg bg-[#2F5D46] text-[#F7F0E6] transition-all duration-300 group-hover:bg-[#B86545]">
            <Icon className="h-5 w-5" />
          </div>
          <h3
            className={`font-semibold tracking-[-0.02em] text-[#1F1D1A] ${
              isLarge ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
            }`}
          >
            {benefit.title}
          </h3>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[#625B50] sm:text-base">
            {benefit.description}
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-[#E6D9C5] pt-5">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9B7B4D]">
            0{index + 1}
          </span>
          <ArrowRight className="h-5 w-5 text-[#B86545] transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </div>
    </article>
  );
};

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#F7F0E6] text-[#1F1D1A]">
      <header className="sticky top-0 z-50 border-b border-[#E2D4BE]/80 bg-[#F7F0E6]/85 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
          <a
            href="#top"
            className="text-lg font-semibold tracking-[-0.03em] text-[#1F1D1A] transition-colors duration-300 hover:text-[#2F5D46]"
          >
            BookClub
          </a>

          <div className="hidden items-center gap-9 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-[#625B50] transition-colors duration-300 hover:text-[#1F1D1A]"
              >
                {link.label}
              </a>
            ))}
          </div>

          <Link
            to="/login"
            className="rounded-lg border border-[#D6C6AD] px-4 py-2 text-sm font-medium text-[#1F1D1A] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#2F5D46] hover:bg-[#FDF8EF]"
          >
            Log in
          </Link>
        </nav>
      </header>

      <main id="top">
        <section className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:px-10 lg:py-28">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#2F5D46]">
              For readers who meet around books
            </p>
            <h1 className="mt-6 text-5xl font-semibold leading-[0.98] tracking-[-0.06em] text-[#1F1D1A] sm:text-6xl lg:text-7xl">
              A calmer home for your book club.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#625B50] sm:text-xl sm:leading-9">
              Pick what to read next, keep notes in one place, and give every meeting a little more shape.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/register"
                className="group inline-flex items-center justify-center gap-3 rounded-lg bg-[#2F5D46] px-6 py-4 text-sm font-semibold text-[#FFF9EF] shadow-lg shadow-[#2F5D46]/20 transition-all duration-300 hover:-translate-y-1 hover:bg-[#244936] hover:shadow-xl"
              >
                Join the club
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/books"
                className="inline-flex items-center justify-center rounded-lg border border-[#D6C6AD] px-6 py-4 text-sm font-semibold text-[#1F1D1A] transition-all duration-300 hover:-translate-y-1 hover:border-[#B86545] hover:bg-[#FFF9EF]"
              >
                Explore books
              </Link>
            </div>

            <div className="mt-12 grid max-w-lg grid-cols-2 gap-5 border-t border-[#D8C9B3] pt-8 sm:grid-cols-3">
              {[
                ['2 min', 'to set up a club'],
                ['24k', 'notes saved'],
                ['430', 'clubs reading now'],
              ].map(([value, label]) => (
                <div key={label}>
                  <p className="text-2xl font-semibold tracking-[-0.03em] text-[#1F1D1A]">{value}</p>
                  <p className="mt-1 text-sm leading-6 text-[#756B5E]">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <PhotoPanel />
        </section>

        <section id="benefits" className="border-y border-[#E2D4BE] bg-[#EFE4D2] px-5 py-24 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
              <SectionIntro
                eyebrow="Why it works"
                title="Enough structure to help, not so much that it gets in the way."
                text="BookClub is built for the ordinary parts of reading together: choosing the book, remembering the plan, and making room for everyone to say something."
              />

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
                {benefits.map((benefit, index) => (
                  <BenefitCard key={benefit.title} benefit={benefit} index={index} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="inside" className="px-5 py-24 sm:px-8 lg:px-10">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="rounded-lg border border-[#DDD0BC] bg-[#FFF9EF] p-5 shadow-xl shadow-[#2B2A27]/8 sm:p-8">
              <div className="grid gap-5 md:grid-cols-[1fr_0.72fr]">
                <div className="rounded-lg bg-[#2B2A27] p-6 text-[#F7F0E6]">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C9A66B]">
                        Current room
                      </p>
                      <h3 className="mt-4 text-2xl font-semibold tracking-[-0.03em]">
                        Thursday fiction group
                      </h3>
                    </div>
                    <LibraryBig className="h-7 w-7 text-[#C9A66B]" />
                  </div>

                  <div className="mt-10 space-y-4">
                    {['Pick closes tonight', 'Chapter 8 thread is active', 'Meeting notes are ready'].map(
                      (item) => (
                        <div key={item} className="flex items-center gap-3 text-sm text-[#E8DDCB]">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#3F6F54]">
                            <Check className="h-3.5 w-3.5" />
                          </span>
                          {item}
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="rounded-lg border border-[#E6D9C5] bg-[#F7F0E6] p-5">
                    <p className="text-sm font-medium text-[#756B5E]">Next meeting</p>
                    <p className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Thu 7:30</p>
                  </div>
                  <div className="rounded-lg border border-[#E6D9C5] bg-[#F7F0E6] p-5">
                    <p className="text-sm font-medium text-[#756B5E]">Book votes</p>
                    <div className="mt-4 h-2 rounded-full bg-[#E4D6C0]">
                      <div className="h-full w-2/3 rounded-full bg-[#B86545]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <SectionIntro
                eyebrow="Inside the club"
                title="The details that keep the group moving."
                text="A few thoughtful tools make the club feel organized, even when everyone reads at a different pace."
              />

              <div className="mt-8 space-y-4">
                {details.map((detail) => (
                  <div
                    key={detail}
                    className="flex gap-4 rounded-lg border border-transparent p-3 transition-all duration-300 hover:-translate-y-1 hover:border-[#E2D4BE] hover:bg-[#FFF9EF]"
                  >
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2F5D46] text-[#FFF9EF]">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <p className="text-base leading-7 text-[#4D473F]">{detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="notes" className="bg-[#1F1D1A] px-5 py-24 text-[#F7F0E6] sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#C9A66B]">
                  Reader notes
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl lg:text-5xl">
                  Quiet praise from real reading groups.
                </h2>
              </div>
              <Link
                to="/register"
                className="inline-flex w-fit items-center gap-3 rounded-lg bg-[#F7F0E6] px-5 py-3 text-sm font-semibold text-[#1F1D1A] transition-all duration-300 hover:-translate-y-1 hover:bg-[#E8DDCB]"
              >
                Join the club
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-14 grid gap-5 lg:grid-cols-[1.1fr_0.9fr_1fr]">
              {testimonials.map((testimonial, index) => (
                <article
                  key={testimonial.name}
                  className={`rounded-lg border border-white/10 bg-white/[0.04] p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.07] sm:p-8 ${
                    index === 1 ? 'lg:mt-10' : ''
                  }`}
                >
                  <p className="text-lg leading-8 text-[#EFE4D2]">"{testimonial.quote}"</p>
                  <div className="mt-8 border-t border-white/10 pt-5">
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="mt-1 text-sm text-[#CFC0AA]">{testimonial.role}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#F7F0E6] px-5 py-12 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 border-t border-[#D8C9B3] pt-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg font-semibold tracking-[-0.03em]">BookClub</p>
            <p className="mt-2 text-sm text-[#756B5E]">A quieter way to read together.</p>
          </div>

          <div className="flex flex-wrap gap-6 text-sm font-medium text-[#625B50]">
            <a href="#benefits" className="transition-colors duration-300 hover:text-[#1F1D1A]">
              Why it works
            </a>
            <a href="#inside" className="transition-colors duration-300 hover:text-[#1F1D1A]">
              Inside the club
            </a>
            <Link to="/login" className="transition-colors duration-300 hover:text-[#1F1D1A]">
              Log in
            </Link>
          </div>

          <p className="text-sm text-[#756B5E]">&copy; 2026 BookClub</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
