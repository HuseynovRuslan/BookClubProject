import { useEffect, useRef, useState } from 'react';
import { getImageUrl } from '../../../utils/imageHelper';
import { openLibraryCover } from '../format';
import { BookCard, Button, Dialog, Eyebrow } from '../ui';
import { SHELF_NAME_MAX } from './shelfUtils';

// Pieces shared by "Kitab rəflərim" (/my-shelves) and the shelf page (/shelves/:id).
// Markup and class names follow the Make "Shelves" screen; every value comes from the API.

// Same colour choice as the Make typographic cover in BookCover, so a book keeps its colour
// between the mini cover on the shelf card and the big cover in the grid.
const coverTones = ['emerald', 'ochre', 'night', 'rose', 'sand', 'blue', 'forest', 'clay', 'moss', 'ink', 'wine', 'sage'];
const toneFor = (text = '') => coverTones[[...text].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % coverTones.length];

const MiniCover = ({ book, style }) => {
  const isbn = book?.isbn || book?.ISBN;
  const sources = [getImageUrl(book?.coverImageUrl || null), openLibraryCover(isbn ? String(isbn) : null)].filter(Boolean);
  const [failed, setFailed] = useState([]);
  const src = sources.find((url) => !failed.includes(url));
  return (
    <i className={`cover-${toneFor(book?.title || '')}`} style={style}>
      {src && <img alt="" loading="lazy" onError={() => setFailed((urls) => [...urls, src])} src={src} />}
    </i>
  );
};

const tilt = (index, total) => ({ transform: `rotate(${(index - (total - 1) / 2) * 5}deg)` });

// The first three books of a shelf as small covers; an empty shelf shows three empty slots.
export const MiniCovers = ({ books = [] }) => {
  const shown = books.slice(0, 3);
  if (!shown.length) {
    return (
      <div aria-hidden="true" className="mini-covers mini-covers-empty">
        {[0, 1, 2].map((index) => (
          <i key={index} style={tilt(index, 3)} />
        ))}
      </div>
    );
  }
  return (
    <div aria-hidden="true" className="mini-covers">
      {shown.map((book, index) => (
        <MiniCover book={book} key={book.id} style={tilt(index, shown.length)} />
      ))}
    </div>
  );
};

// A book in a shelf grid, with the "Rəfdən çıxar" action when the viewer may remove it.
export const ShelfBook = ({ book, onRemove, removing = false }) => (
  <div className="shelf-book">
    <BookCard book={book} />
    {onRemove && (
      <button
        aria-label={`“${book.title}” kitabını rəfdən çıxar`}
        disabled={removing}
        onClick={() => onRemove(book)}
        type="button"
      >
        {removing ? 'Çıxarılır…' : 'Rəfdən çıxar'}
      </button>
    )}
  </div>
);

// Create ("Yeni rəf yarat") and rename ("Adını dəyiş") dialog. Validation mirrors the backend rules;
// `error` is the message of a failed request, shown under the field.
export const ShelfNameDialog = ({ mode = 'create', initialName = '', busy = false, error = '', onSubmit, onClose }) => {
  const [name, setName] = useState(initialName);
  const [localError, setLocalError] = useState('');
  const inputRef = useRef(null);
  const isCreate = mode === 'create';

  // Runs after the Dialog has focused its first button: a form dialog starts in its field.
  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const submit = (event) => {
    event.preventDefault();
    if (busy) return;
    const value = name.trim();
    if (!value) {
      setLocalError('Rəfin adını yaz.');
      return;
    }
    if (value.length > SHELF_NAME_MAX) {
      setLocalError(`Rəfin adı ${SHELF_NAME_MAX} simvoldan uzun ola bilməz.`);
      return;
    }
    setLocalError('');
    onSubmit(value);
  };

  const message = localError || error;

  return (
    <Dialog labelledBy="shelf-dialog-title" onClose={() => !busy && onClose()}>
      <form noValidate onSubmit={submit}>
        <Eyebrow>{isCreate ? 'YENİ RƏF' : 'RƏFİ REDAKTƏ ET'}</Eyebrow>
        <h2 id="shelf-dialog-title">{isCreate ? 'Yeni rəfinə ad ver' : 'Rəfin adını dəyiş'}</h2>
        <label className="text-field">
          <span>Rəfin adı</span>
          <input
            aria-describedby={message ? 'shelf-name-error' : undefined}
            aria-invalid={message ? true : undefined}
            disabled={busy}
            maxLength={SHELF_NAME_MAX}
            onChange={(event) => {
              setName(event.target.value);
              if (localError) setLocalError('');
            }}
            placeholder="Məsələn, Payız axşamları"
            ref={inputRef}
            value={name}
          />
        </label>
        {message && (
          <p className="form-error" id="shelf-name-error" role="alert">
            {message}
          </p>
        )}
        <div className="modal-actions">
          <Button disabled={busy} onClick={onClose} variant="secondary">
            Ləğv et
          </Button>
          <Button aria-busy={busy || undefined} disabled={busy || !name.trim()} type="submit">
            {busy ? 'Saxlanılır…' : isCreate ? 'Rəf yarat' : 'Yadda saxla'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export const DeleteShelfDialog = ({ name, busy = false, error = '', onConfirm, onClose }) => (
  <Dialog labelledBy="shelf-delete-title" onClose={() => !busy && onClose()}>
    <Eyebrow>RƏFİ SİL</Eyebrow>
    <h2 id="shelf-delete-title">“{name}” rəfi silinsin?</h2>
    <p>Kitablar kitabxananda qalacaq, yalnız bu xüsusi rəf silinəcək. Bu addımı geri qaytarmaq olmur.</p>
    {error && (
      <p className="form-error" role="alert">
        {error}
      </p>
    )}
    <div className="modal-actions">
      <Button disabled={busy} onClick={onClose} variant="secondary">
        Ləğv et
      </Button>
      <Button aria-busy={busy || undefined} disabled={busy} onClick={onConfirm} variant="danger">
        {busy ? 'Silinir…' : 'Rəfi sil'}
      </Button>
    </div>
  </Dialog>
);
