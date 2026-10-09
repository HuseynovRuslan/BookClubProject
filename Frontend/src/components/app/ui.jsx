import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../../utils/imageHelper';
import { bookAuthor, bookGenre, displayName, formatRating, openLibraryCover } from './format';

// Building blocks of the Bookla 2.0 application UI. Markup and class names follow the Figma Make
// project "Bookla 2.0 — Application" (styles in src/styles/bookla-app.css); the data always comes from
// the API, never from the Make sample content.

const iconPaths = {
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  arrow: <path d="m9 18 6-6-6-6" />,
  back: <path d="m15 18-6-6 6-6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  star: <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z" />,
  more: (
    <>
      <circle cx="5" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
    </>
  ),
  edit: (
    <>
      <path d="M4 20h4L19 9l-4-4L4 16v4Z" />
      <path d="m13 7 4 4" />
    </>
  ),
  send: (
    <>
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </>
  ),
  // Not in the Make icon set; drawn in the same 1.7px stroke style.
  heart: <path d="M19.5 12.6 12 20l-7.5-7.4a4.8 4.8 0 1 1 7.5-6 4.8 4.8 0 1 1 7.5 6Z" />,
  comment: <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-5A8 8 0 1 1 21 12Z" />,
  trash: (
    <>
      <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
      <path d="M10 11v6M14 11v6" />
    </>
  ),
  check: <path d="m5 12 5 5L20 7" />,
  logout: (
    <>
      <path d="M15 4h4v16h-4" />
      <path d="M10 8l-4 4 4 4M6 12h10" />
    </>
  ),
  book: (
    <>
      <path d="M12 7v13M12 7a3 3 0 0 0-3-3H4v13h6a2 2 0 0 1 2 2M12 7a3 3 0 0 1 3-3h5v13h-6a2 2 0 0 0-2 2" />
    </>
  ),
};

export const Icon = ({ name, size = 18, className = '' }) => (
  <svg aria-hidden="true" className={`icon ${className}`} height={size} viewBox="0 0 24 24" width={size}>
    {iconPaths[name]}
  </svg>
);

export const Button = ({ children, variant = 'primary', className = '', type = 'button', ...props }) => (
  <button className={`button button-${variant} ${className}`} type={type} {...props}>
    {children}
  </button>
);

// Same look as Button, for navigation.
export const ButtonLink = ({ children, variant = 'primary', className = '', ...props }) => (
  <Link className={`button button-${variant} ${className}`} {...props}>
    {children}
  </Link>
);

export const Eyebrow = ({ children, className = '' }) => <p className={`eyebrow ${className}`}>{children}</p>;

export const SectionTitle = ({ eyebrow, title, action, id }) => (
  <div className="section-heading">
    <div>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 id={id}>{title}</h2>
    </div>
    {action}
  </div>
);

// Search field with the magnifier icon (Make "Field").
export const SearchField = ({ value, onChange, placeholder, label, large = false, inputRef, ...props }) => (
  <label className={`field ${large ? 'field-large' : ''}`}>
    <span className="sr-only">{label}</span>
    <Icon name="search" />
    <input
      ref={inputRef}
      aria-label={label}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      value={value}
      {...props}
    />
  </label>
);

const coverTones = ['emerald', 'ochre', 'night', 'rose', 'sand', 'blue', 'forest', 'clay', 'moss', 'ink', 'wine', 'sage'];
const toneFor = (text = '') => coverTones[[...text].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % coverTones.length];

// Real cover image when the API has one (backend upload, then Open Library by ISBN, as before);
// otherwise the Make typographic cover, coloured from the title.
export const BookCover = ({ book, large = false, className = '' }) => {
  const backend = getImageUrl(book?.coverImageUrl || book?.bookCoverImageUrl || null);
  const openLib = openLibraryCover(book?.isbn || book?.ISBN);
  const sources = [backend, openLib].filter(Boolean);
  const [failed, setFailed] = useState([]);
  const src = sources.find((url) => !failed.includes(url));
  const title = book?.title || book?.bookTitle || '';

  return (
    <div
      aria-label={`${title} kitabının üz qabığı`}
      className={`book-cover cover-${toneFor(title)} ${src ? 'has-image' : ''} ${large ? 'book-cover-large' : ''} ${className}`}
      role="img"
    >
      {src ? (
        <img alt="" src={src} loading="lazy" onError={() => setFailed((urls) => [...urls, src])} />
      ) : (
        <>
          <span className="cover-mark">{bookGenre(book)}</span>
          <strong>{title}</strong>
          <small>{bookAuthor(book)}</small>
          <i />
        </>
      )}
    </div>
  );
};

export const BookCard = ({ book, children }) => {
  const rating = formatRating(book.averageRating);
  return (
    <article className="book-card">
      <Link className="book-card-link" to={`/books/${book.id}`}>
        <BookCover book={book} />
        <div className="book-meta">
          {bookGenre(book) && <p className="book-genre">{bookGenre(book)}</p>}
          <h3>{book.title}</h3>
          <p>{bookAuthor(book) || 'Müəllif məlum deyil'}</p>
          {rating && (
            <span className="rating">
              <Icon name="star" size={13} /> {rating}
              <span className="sr-only"> ulduz</span>
            </span>
          )}
        </div>
      </Link>
      {children}
    </article>
  );
};

const initialsOf = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toLocaleUpperCase('az');

// Profile photo from the API, or initials when the person has none.
export const Avatar = ({ src, name = '', size = 'medium', className = '' }) => {
  const url = getImageUrl(src || null);
  const [brokenUrl, setBrokenUrl] = useState(null);
  if (url && url !== brokenUrl) {
    return (
      <img
        alt={`${name} profil şəkli`}
        className={`avatar avatar-${size} ${className}`}
        src={url}
        onError={() => setBrokenUrl(url)}
      />
    );
  }
  return (
    <span aria-label={`${name} profil şəkli`} role="img" className={`avatar avatar-${size} avatar-initials ${className}`}>
      {initialsOf(name) || '?'}
    </span>
  );
};

export const Tabs = ({ tabs, active, onChange, label }) => (
  <div className="tabs" role="tablist" aria-label={label}>
    {tabs.map((tab) => {
      const value = typeof tab === 'string' ? tab : tab.value;
      const text = typeof tab === 'string' ? tab : tab.label;
      return (
        <button
          aria-selected={active === value}
          className={active === value ? 'active' : ''}
          key={value}
          onClick={() => onChange(value)}
          role="tab"
          type="button"
        >
          {text}
        </button>
      );
    })}
  </div>
);

export const EmptyState = ({ title, text, action }) => (
  <div className="empty-state">
    <div className="empty-books" aria-hidden="true">
      <i />
      <i />
      <i />
    </div>
    <h3>{title}</h3>
    {text && <p>{text}</p>}
    {action}
  </div>
);

export const LoadingState = ({ kind = 'books', count }) => {
  const total = count ?? (kind === 'readers' ? 6 : kind === 'feed' ? 3 : 5);
  return (
    <div aria-label="Məzmun yüklənir" aria-live="polite" className={`loading-state loading-${kind}`} role="status">
      {Array.from({ length: total }, (_, index) => (
        <div className="skeleton-card" key={index}>
          <i />
          <span />
          <span />
        </div>
      ))}
    </div>
  );
};

const focusableSelector =
  'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

// Modal dialog with focus trap and Escape to close (Make "Dialog").
export const Dialog = ({ children, labelledBy, onClose, className = '' }) => {
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const first = dialogRef.current?.querySelector(focusableSelector);
    (first || dialogRef.current)?.focus();
    return () => returnFocus?.focus();
  }, []);

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onCloseRef.current();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = Array.from(dialogRef.current?.querySelectorAll(focusableSelector) ?? []);
    if (!focusable.length) {
      event.preventDefault();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div
        aria-labelledby={labelledBy}
        aria-modal="true"
        className={`modal ${className}`}
        onKeyDown={handleKeyDown}
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <button aria-label="Bağla" className="modal-close" onClick={onClose} type="button">
          <Icon name="close" />
        </button>
        {children}
      </div>
    </div>
  );
};

// A person did something: avatar, sentence, time (Make "Activity").
export const Activity = ({ person, text, time, compact = false, action, to }) => {
  const name = displayName(person);
  return (
    <article className={`activity ${compact ? 'activity-compact' : ''}`}>
      <Avatar name={name} size="small" src={person?.profilePictureUrl || person?.userProfilePictureUrl} />
      <div>
        <p>
          {to ? (
            <Link className="activity-name" to={to}>
              {name}
            </Link>
          ) : (
            <strong>{name}</strong>
          )}{' '}
          {text}
        </p>
        {time && <span>{time}</span>}
      </div>
      {action}
    </article>
  );
};

export const Pagination = ({ page, totalPages, onChange }) => {
  if (!totalPages || totalPages < 2) return null;
  const pages = [];
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  for (let p = start; p <= Math.min(totalPages, start + 4); p += 1) pages.push(p);
  return (
    <nav aria-label="Səhifələmə" className="pagination">
      <button aria-label="Əvvəlki səhifə" disabled={page <= 1} onClick={() => onChange(page - 1)} type="button">
        ‹
      </button>
      {pages.map((p) => (
        <button
          aria-current={p === page ? 'page' : undefined}
          className={p === page ? 'active' : ''}
          key={p}
          onClick={() => onChange(p)}
          type="button"
        >
          {p}
        </button>
      ))}
      <button aria-label="Növbəti səhifə" disabled={page >= totalPages} onClick={() => onChange(page + 1)} type="button">
        ›
      </button>
    </nav>
  );
};
