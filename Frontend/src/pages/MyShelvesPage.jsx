import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getUserShelves, createShelf, updateShelf, deleteShelf, removeBookFromShelf } from '../api/shelves';
import { Button, ButtonLink, EmptyState, Eyebrow, Icon, LoadingState, SectionTitle } from '../components/app/ui';
import { shelfName } from '../components/app/format';
import { DeleteShelfDialog, MiniCovers, ShelfBook, ShelfNameDialog } from '../components/app/shelves/ShelfParts';
import { bookWord, shelfCount, sortShelves } from '../components/app/shelves/shelfUtils';
import '../styles/app/shelves.css';

// "Kitab rəflərim" — the signed-in user's shelves (Make "Shelves" screen) on the real shelves API.

const MyShelvesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [shelves, setShelves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  // 'create' | 'rename' | 'delete' | null
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');
  const [removingId, setRemovingId] = useState(null);

  // `quiet` refreshes the list after a change without replacing the page with the loading state.
  const fetchShelves = useCallback(async ({ quiet = false } = {}) => {
    try {
      if (!quiet) {
        setLoading(true);
        setLoadError(false);
      }
      const response = await getUserShelves();

      if (Array.isArray(response)) {
        setShelves(response);
      } else if (response?.items) {
        setShelves(response.items);
      } else {
        setShelves([]);
      }
      return true;
    } catch (error) {
      console.error('Error fetching shelves:', error);
      if (!quiet) setLoadError(true);
      return false;
    } finally {
      if (!quiet) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShelves();
  }, [fetchShelves]);

  const ordered = sortShelves(shelves);
  // The selected shelf lives in the URL (?shelf=<id>) so it survives a visit to a book and back.
  const selected = ordered.find((shelf) => shelf.id === searchParams.get('shelf')) || ordered[0] || null;
  const selectedBooks = selected?.books || [];

  const selectShelf = (id) => {
    setSearchParams(
      (params) => {
        const next = new URLSearchParams(params);
        next.set('shelf', id);
        return next;
      },
      { replace: true }
    );
  };

  const openModal = (type) => {
    setModalError('');
    setModal(type);
  };

  const closeModal = () => {
    if (saving) return;
    setModal(null);
    setModalError('');
  };

  const handleCreateShelf = async (name) => {
    try {
      setSaving(true);
      setModalError('');
      const created = await createShelf({ name });
      toast.success('Rəf yaradıldı');
      setModal(null);
      if (created?.id) {
        // Show and select the new shelf at once, then sync the list with the server.
        setShelves((list) => [...list, { ...created, books: created.books || [], bookCount: created.bookCount || 0 }]);
        selectShelf(created.id);
      }
      await fetchShelves({ quiet: true });
    } catch (error) {
      console.error('Error creating shelf:', error);
      setModalError('Rəf yaradılmadı. Bir az sonra yenidən cəhd et.');
    } finally {
      setSaving(false);
    }
  };

  const handleRenameShelf = async (name) => {
    if (!selected) return;
    try {
      setSaving(true);
      setModalError('');
      await updateShelf({ id: selected.id, name });
      setShelves((list) => list.map((shelf) => (shelf.id === selected.id ? { ...shelf, name } : shelf)));
      toast.success('Rəfin adı dəyişdirildi');
      setModal(null);
    } catch (error) {
      console.error('Error renaming shelf:', error);
      setModalError('Rəfin adı dəyişdirilmədi. Bir az sonra yenidən cəhd et.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteShelf = async () => {
    if (!selected) return;
    try {
      setSaving(true);
      setModalError('');
      await deleteShelf(selected.id);
      setShelves((list) => list.filter((shelf) => shelf.id !== selected.id));
      setSearchParams(
        (params) => {
          const next = new URLSearchParams(params);
          next.delete('shelf');
          return next;
        },
        { replace: true }
      );
      toast.success('Rəf silindi');
      setModal(null);
    } catch (error) {
      console.error('Error deleting shelf:', error);
      setModalError('Rəf silinmədi. Bir az sonra yenidən cəhd et.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveBook = async (book) => {
    if (!selected || removingId) return;
    const shelfId = selected.id;
    try {
      setRemovingId(book.id);
      await removeBookFromShelf(shelfId, book.id);
      setShelves((list) =>
        list.map((shelf) =>
          shelf.id === shelfId
            ? {
                ...shelf,
                books: (shelf.books || []).filter((item) => item.id !== book.id),
                bookCount: Math.max(0, shelfCount(shelf) - 1),
              }
            : shelf
        )
      );
      toast.success(`“${book.title}” rəfdən çıxarıldı`);
    } catch (error) {
      console.error('Error removing book:', error);
      toast.error('Kitab rəfdən çıxarılmadı. Yenidən cəhd et.');
    } finally {
      setRemovingId(null);
    }
  };

  let content;
  if (loading) {
    content = (
      <div aria-label="Rəflər yüklənir" aria-live="polite" role="status">
        <div aria-hidden="true" className="shelf-overview">
          {[0, 1, 2, 3, 4].map((index) => (
            <div className="shelf-card shelf-card-skeleton" key={index}>
              <div className="mini-covers">
                <i />
                <i />
                <i />
              </div>
              <span />
              <span />
            </div>
          ))}
        </div>
        <div className="shelf-loading-books">
          <LoadingState count={4} />
        </div>
      </div>
    );
  } else if (loadError) {
    content = (
      <EmptyState
        action={<Button onClick={() => fetchShelves()}>Yenidən cəhd et</Button>}
        text="Bağlantını yoxlayıb yenidən cəhd et."
        title="Rəflər yüklənmədi"
      />
    );
  } else if (!ordered.length) {
    content = (
      <EmptyState
        action={
          <Button onClick={() => openModal('create')}>
            <Icon name="plus" /> İlk rəfini yarat
          </Button>
        }
        text="İlk rəfini yarat və kitablarını öz zövqünə görə sırala."
        title="Hələ rəfin yoxdur"
      />
    );
  } else {
    content = (
      <>
        <section aria-label="Rəflərim" className="shelf-overview">
          {ordered.map((shelf) => {
            const count = shelfCount(shelf);
            const active = selected?.id === shelf.id;
            return (
              <button
                aria-pressed={active}
                className={`shelf-card ${active ? 'active' : ''}`}
                key={shelf.id}
                onClick={() => selectShelf(shelf.id)}
                type="button"
              >
                <MiniCovers books={shelf.books} />
                <strong>{shelfName(shelf.name)}</strong>
                <span>{bookWord(count)}</span>
              </button>
            );
          })}
        </section>

        {selected && (
          <section aria-labelledby="selected-shelf-title" className="selected-shelf">
            <SectionTitle
              action={
                <div className="shelf-actions">
                  {!selected.isDefault && (
                    <>
                      <Button onClick={() => openModal('rename')} variant="quiet">
                        <Icon name="edit" /> Adını dəyiş
                      </Button>
                      <Button onClick={() => openModal('delete')} variant="quiet">
                        Rəfi sil
                      </Button>
                    </>
                  )}
                  <ButtonLink to={`/shelves/${selected.id}`} variant="quiet">
                    Rəfi aç <Icon name="arrow" />
                  </ButtonLink>
                </div>
              }
              eyebrow={`${selected.isDefault ? 'Standart rəf' : 'Öz rəfim'} · ${bookWord(shelfCount(selected))}`}
              id="selected-shelf-title"
              title={shelfName(selected.name)}
            />
            {selectedBooks.length ? (
              <div className="book-grid shelf-books">
                {selectedBooks.map((book) => (
                  <ShelfBook book={book} key={book.id} onRemove={handleRemoveBook} removing={removingId === book.id} />
                ))}
              </div>
            ) : (
              <EmptyState
                action={<ButtonLink to="/books">Kitabları kəşf et</ButtonLink>}
                text="Kəşf etdiyin kitabları bura əlavə et və öz oxu siyahını yarat."
                title="Bu rəf hələ boşdur"
              />
            )}
          </section>
        )}
      </>
    );
  }

  return (
    <div className="page shelves-page">
      <header className="page-heading-row">
        <div>
          <Eyebrow>ŞƏXSİ KİTABXANAM</Eyebrow>
          <h1>Kitab rəflərim</h1>
          <p>Oxuduğun, oxumaq istədiyin və dönə-dönə qayıtdığın kitablar.</p>
        </div>
        <Button onClick={() => openModal('create')}>
          <Icon name="plus" /> Yeni rəf yarat
        </Button>
      </header>

      {content}

      {(modal === 'create' || (modal === 'rename' && selected)) && (
        <ShelfNameDialog
          busy={saving}
          error={modalError}
          initialName={modal === 'rename' ? selected.name : ''}
          key={modal}
          mode={modal}
          onClose={closeModal}
          onSubmit={modal === 'create' ? handleCreateShelf : handleRenameShelf}
        />
      )}
      {modal === 'delete' && selected && (
        <DeleteShelfDialog
          busy={saving}
          error={modalError}
          name={shelfName(selected.name)}
          onClose={closeModal}
          onConfirm={handleDeleteShelf}
        />
      )}
    </div>
  );
};

export default MyShelvesPage;
