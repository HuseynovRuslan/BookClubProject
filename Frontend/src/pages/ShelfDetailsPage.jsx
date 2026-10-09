import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getShelfById, getUserShelves, updateShelf, deleteShelf, removeBookFromShelf } from '../api/shelves';
import { Button, ButtonLink, EmptyState, Eyebrow, Icon, LoadingState } from '../components/app/ui';
import { shelfName } from '../components/app/format';
import { DeleteShelfDialog, ShelfBook, ShelfNameDialog } from '../components/app/shelves/ShelfParts';
import { bookWord } from '../components/app/shelves/shelfUtils';
import '../styles/app/shelves.css';

// One shelf with all its books (/shelves/:id), in the visual language of the Make "Shelves" screen.
// Rename, delete and "Rəfdən çıxar" are offered only on the signed-in user's own shelves.

const ShelfDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shelf, setShelf] = useState(null);
  const [loading, setLoading] = useState(true);
  // null | 'not-found' | 'error'
  const [loadError, setLoadError] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  // 'rename' | 'delete' | null
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');
  const [removingId, setRemovingId] = useState(null);
  const requestRef = useRef(0);

  const fetchShelfDetails = useCallback(async () => {
    const request = ++requestRef.current;
    setLoading(true);
    setLoadError(null);
    // The shelf DTO has no owner, so ownership is "this shelf is one of my shelves".
    const [shelfResult, mineResult] = await Promise.allSettled([getShelfById(id), getUserShelves()]);
    if (request !== requestRef.current) return;

    if (shelfResult.status === 'rejected' || !shelfResult.value) {
      if (shelfResult.status === 'rejected') console.error('Error fetching shelf details:', shelfResult.reason);
      const status = shelfResult.reason?.response?.status;
      setShelf(null);
      setLoadError(shelfResult.status === 'fulfilled' || status === 404 || status === 400 ? 'not-found' : 'error');
      setLoading(false);
      return;
    }

    const shelfData = shelfResult.value;
    setShelf(shelfData);
    if (mineResult.status === 'fulfilled') {
      const response = mineResult.value;
      const mine = Array.isArray(response) ? response : response?.items || [];
      const listIsComplete = Array.isArray(response) || !response?.hasNextPage;
      // When the list could not tell (more pages), keep the previous behaviour: the API checks ownership.
      setIsOwner(mine.some((item) => item.id === shelfData.id) || !listIsComplete);
    } else {
      console.error('Error checking shelf owner:', mineResult.reason);
      setIsOwner(true);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchShelfDetails();
  }, [fetchShelfDetails]);

  const openModal = (type) => {
    setModalError('');
    setModal(type);
  };

  const closeModal = () => {
    if (saving) return;
    setModal(null);
    setModalError('');
  };

  const handleRenameShelf = async (name) => {
    try {
      setSaving(true);
      setModalError('');
      await updateShelf({ id: shelf.id, name });
      toast.success('Rəfin adı dəyişdirildi');
      setShelf((current) => ({ ...current, name }));
      setModal(null);
    } catch (error) {
      console.error('Error renaming shelf:', error);
      setModalError('Rəfin adı dəyişdirilmədi. Bir az sonra yenidən cəhd et.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteShelf = async () => {
    try {
      setSaving(true);
      setModalError('');
      await deleteShelf(shelf.id);
      toast.success('Rəf silindi');
      navigate('/my-shelves');
    } catch (error) {
      console.error('Error deleting shelf:', error);
      setModalError('Rəf silinmədi. Bir az sonra yenidən cəhd et.');
      setSaving(false);
    }
  };

  const handleRemoveBook = async (book) => {
    if (removingId) return;
    try {
      setRemovingId(book.id);
      await removeBookFromShelf(shelf.id, book.id);
      toast.success(`“${book.title}” rəfdən çıxarıldı`);

      setShelf((current) => ({
        ...current,
        books: (current.books || []).filter((item) => item.id !== book.id),
        bookCount: Math.max(0, (current.bookCount || current.books?.length || 0) - 1),
      }));
    } catch (error) {
      console.error('Error removing book:', error);
      toast.error('Kitab rəfdən çıxarılmadı. Yenidən cəhd et.');
    } finally {
      setRemovingId(null);
    }
  };

  const backLink = (
    <Link className="back-link" to="/my-shelves">
      ← Rəflərimə qayıt
    </Link>
  );

  if (loading) {
    return (
      <div className="page shelf-detail-page">
        {backLink}
        <div aria-label="Rəf yüklənir" aria-live="polite" role="status">
          <div aria-hidden="true" className="shelf-heading-skeleton">
            <i />
            <i />
            <i />
          </div>
          <div className="shelf-loading-books">
            <LoadingState count={4} />
          </div>
        </div>
      </div>
    );
  }

  if (loadError || !shelf) {
    return (
      <div className="page shelf-detail-page">
        {backLink}
        {loadError === 'error' ? (
          <EmptyState
            action={<Button onClick={fetchShelfDetails}>Yenidən cəhd et</Button>}
            text="Bağlantını yoxlayıb yenidən cəhd et."
            title="Rəf yüklənmədi"
          />
        ) : (
          <EmptyState
            action={<ButtonLink to="/my-shelves">Rəflərimə qayıt</ButtonLink>}
            text="Bu rəf silinib və ya keçid yanlışdır."
            title="Rəf tapılmadı"
          />
        )}
      </div>
    );
  }

  const books = shelf.books || [];
  const bookCount = shelf.books?.length || shelf.bookCount || 0;
  const displayName = shelfName(shelf.name);
  const canManage = isOwner && !shelf.isDefault;

  return (
    <div className="page shelf-detail-page">
      {backLink}
      <header className="page-heading-row">
        <div>
          <Eyebrow>{isOwner ? 'ŞƏXSİ KİTABXANAM' : 'KİTAB RƏFİ'}</Eyebrow>
          <h1>{displayName}</h1>
          <p>
            {bookWord(bookCount)}
            {shelf.isDefault ? ' · standart rəf' : ''}
          </p>
        </div>
        {canManage && (
          <div className="shelf-actions">
            <Button onClick={() => openModal('rename')} variant="quiet">
              <Icon name="edit" /> Adını dəyiş
            </Button>
            <Button onClick={() => openModal('delete')} variant="quiet">
              Rəfi sil
            </Button>
          </div>
        )}
      </header>

      <section aria-labelledby="shelf-books-heading">
        <h2 className="sr-only" id="shelf-books-heading">
          Rəfdəki kitablar
        </h2>
        {books.length ? (
          <div className="book-grid shelf-books">
            {books.map((book) => (
              <ShelfBook
                book={book}
                key={book.id}
                onRemove={isOwner ? handleRemoveBook : undefined}
                removing={removingId === book.id}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            action={<ButtonLink to="/books">Kitabları kəşf et</ButtonLink>}
            text={
              isOwner
                ? 'Kəşf etdiyin kitabları bura əlavə et və öz oxu siyahını yarat.'
                : 'Bu rəfə hələ kitab əlavə olunmayıb.'
            }
            title="Bu rəf hələ boşdur"
          />
        )}
      </section>

      {modal === 'rename' && canManage && (
        <ShelfNameDialog
          busy={saving}
          error={modalError}
          initialName={shelf.name}
          mode="rename"
          onClose={closeModal}
          onSubmit={handleRenameShelf}
        />
      )}
      {modal === 'delete' && canManage && (
        <DeleteShelfDialog
          busy={saving}
          error={modalError}
          name={displayName}
          onClose={closeModal}
          onConfirm={handleDeleteShelf}
        />
      )}
    </div>
  );
};

export default ShelfDetailsPage;
