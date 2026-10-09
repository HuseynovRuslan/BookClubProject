import { useState, useEffect } from 'react';
import { getUserYearChallenge, upsertUserYearChallenge } from '../api/readingChallenge';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { BookCover, Button, Dialog, Eyebrow, Icon } from './app/ui';

const SUGGESTED_TARGETS = [12, 24, 52];
const MAX_COVERS = 5;

// The yearly reading challenge as the Make "challenge" panel (forest card with the progress ring).
// Loads its own challenge, creates/updates the target through the upsert endpoint and asks the parent
// to refresh (onUpdate). onViewBooks opens the parent's list of books read.
const ReadingChallengeCard = ({ year = new Date().getFullYear(), onUpdate, onViewBooks }) => {
  const { user } = useAuth();
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [targetInput, setTargetInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newTarget, setNewTarget] = useState(12); // Default goal suggestion

  useEffect(() => {
    if (user?.id) {
      fetchChallenge();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, year]);

  const fetchChallenge = async () => {
    try {
      setLoading(true);
      setLoadError(false);
      const data = await getUserYearChallenge(year, user?.id);
      // data will be null if no challenge exists (404) - this is expected
      setChallenge(data);
      if (data) {
        setTargetInput(data.targetBooksCount?.toString() || '');
      }
    } catch (error) {
      // Only log unexpected errors (not 404s, which are handled in the API)
      if (error.response?.status !== 404) {
        console.error('Error fetching challenge:', error);
        setLoadError(true);
      }
      setChallenge(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChallenge = async () => {
    if (!newTarget || newTarget < 1) {
      toast.error('Düzgün hədəf daxil et (ən azı 1 kitab).');
      return;
    }

    try {
      setSaving(true);
      await upsertUserYearChallenge(parseInt(newTarget));
      toast.success(`${year} oxu hədəfin qoyuldu!`);
      setIsCreating(false);
      await fetchChallenge();
      onUpdate?.();
    } catch {
      toast.error('Hədəfi yaratmaq alınmadı.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateTarget = async () => {
    const target = parseInt(targetInput);
    if (!target || target < 1) {
      toast.error('Düzgün hədəf daxil et.');
      return;
    }

    try {
      setSaving(true);
      await upsertUserYearChallenge(target);
      toast.success('Hədəf yeniləndi!');
      setIsEditing(false);
      await fetchChallenge();
      onUpdate?.();
    } catch {
      toast.error('Hədəfi yeniləmək alınmadı.');
    } finally {
      setSaving(false);
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setTargetInput(challenge?.targetBooksCount?.toString() || '');
  };

  const closeDialog = () => {
    if (saving) return;
    if (isCreating) setIsCreating(false);
    else cancelEditing();
  };

  const handleDialogSubmit = (event) => {
    event.preventDefault();
    if (isCreating) handleCreateChallenge();
    else handleUpdateTarget();
  };

  // Calculate progress
  const booksRead = challenge?.completedBooksCount || 0;
  const target = challenge?.targetBooksCount || 1;
  const progress = Math.min((booksRead / target) * 100, 100);
  const isCompleted = booksRead >= target;
  const remaining = Math.max(target - booksRead, 0);
  const readBooks = challenge?.books || [];

  const status = isCompleted
    ? { title: 'Hədəfə çatdın!', text: `Bu il ${target} kitablıq hədəfini tamamladın. Təbriklər!` }
    : booksRead === 0
      ? { title: 'Səyahət indi başlayır', text: '“Oxudum” rəfinə bu il əlavə etdiyin kitablar burada avtomatik sayılır.' }
      : remaining === 1
        ? { title: 'Hədəfə 1 kitab qalıb', text: 'Son kitab — bacaracaqsan!' }
        : { title: `Hədəfə ${remaining} kitab qalıb`, text: 'Oxumağa davam et — hər bitən kitab irəliləyişi yeniləyir.' };

  const dialogOpen = isCreating || isEditing;
  const dialogValue = isCreating ? newTarget : targetInput;
  const setDialogValue = isCreating ? setNewTarget : setTargetInput;

  return (
    <>
      <aside aria-busy={loading} aria-labelledby="challenge-title" className="challenge">
        <Eyebrow>{year} oxu hədəfi</Eyebrow>

        {loading ? (
          <>
            <div aria-label="Hədəf yüklənir" className="challenge-ring is-loading" role="status" />
            <h3 id="challenge-title">Hədəf yüklənir…</h3>
          </>
        ) : loadError ? (
          <>
            <div className="challenge-ring is-empty" aria-hidden="true">
              <strong>!</strong>
            </div>
            <h3 id="challenge-title">Hədəfi yükləmək alınmadı</h3>
            <p className="challenge-error">Bağlantını yoxla və yenidən cəhd et.</p>
            <div className="challenge-actions">
              <Button onClick={fetchChallenge} variant="secondary">
                Yenidən cəhd et
              </Button>
            </div>
          </>
        ) : !challenge ? (
          <>
            <div className="challenge-ring is-empty" aria-hidden="true">
              <strong>?</strong>
              <span>kitab</span>
            </div>
            <h3 id="challenge-title">Bu il neçə kitab oxuyacaqsan?</h3>
            <p>Özünə illik hədəf qoy — “Oxudum” rəfinə əlavə etdiyin kitablar avtomatik sayılacaq.</p>
            <div className="challenge-actions">
              <Button onClick={() => setIsCreating(true)} variant="terracotta">
                <Icon name="plus" /> Hədəf qoy
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="challenge-ring is-live" style={{ '--progress': `${progress}%` }}>
              <strong>{booksRead}</strong>
              <span>/ {target} kitab</span>
            </div>
            <h3 id="challenge-title">{status.title}</h3>
            <p>{status.text}</p>
            <div
              aria-label={`${year} oxu hədəfi`}
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={Math.round(progress)}
              className="progress"
              role="progressbar"
            >
              <i style={{ width: `${progress}%` }} />
            </div>
            <span>{Math.round(progress)}% tamamlanıb</span>

            {readBooks.length > 0 && (
              <ul aria-label="Bu il oxuduğun kitablar" className="challenge-books">
                {readBooks.slice(0, MAX_COVERS).map((book) => (
                  <li key={book.bookId} title={book.title}>
                    <BookCover book={{ ...book, id: book.bookId }} className="cover-thumb" />
                  </li>
                ))}
                {readBooks.length > MAX_COVERS && (
                  <li aria-label={`daha ${readBooks.length - MAX_COVERS} kitab`} className="challenge-more">
                    +{readBooks.length - MAX_COVERS}
                  </li>
                )}
              </ul>
            )}

            <div className="challenge-actions">
              {onViewBooks && (
                <Button onClick={onViewBooks} variant="secondary">
                  Oxuduqlarım
                </Button>
              )}
              <Button onClick={() => setIsEditing(true)} variant="quiet">
                <Icon name="edit" /> Hədəfi dəyiş
              </Button>
            </div>
          </>
        )}
      </aside>

      {dialogOpen && (
        <Dialog className="challenge-dialog" labelledBy="challenge-dialog-title" onClose={closeDialog}>
          <Eyebrow>{year} oxu hədəfi</Eyebrow>
          <h2 id="challenge-dialog-title">{isCreating ? 'Bu il üçün hədəf qoy' : 'Hədəfi dəyiş'}</h2>
          <p>Bu il neçə kitab oxumaq istəyirsən?</p>
          <form onSubmit={handleDialogSubmit}>
            <label className="text-field">
              Kitab sayı
              <input
                inputMode="numeric"
                max="365"
                min="1"
                onChange={(e) => setDialogValue(e.target.value)}
                placeholder="12"
                type="number"
                value={dialogValue}
              />
            </label>
            <div aria-label="Tez seçim" className="chips" role="group">
              {SUGGESTED_TARGETS.map((num) => (
                <button
                  aria-pressed={parseInt(dialogValue) === num}
                  className={parseInt(dialogValue) === num ? 'active' : ''}
                  key={num}
                  onClick={() => setDialogValue(num)}
                  type="button"
                >
                  {num} kitab
                </button>
              ))}
            </div>
            <div className="modal-actions">
              <Button disabled={saving} onClick={closeDialog} variant="secondary">
                Ləğv et
              </Button>
              <Button disabled={saving} type="submit">
                {saving ? 'Saxlanılır…' : isCreating ? 'Hədəfi başlat' : 'Yadda saxla'}
              </Button>
            </div>
          </form>
        </Dialog>
      )}
    </>
  );
};

export default ReadingChallengeCard;
