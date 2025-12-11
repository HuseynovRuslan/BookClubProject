export default function ReviewList({
  reviews = [],
  loading = false,
  error = null,
  onSelect,
  onEdit,
  onDelete,
}) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-white p-6 rounded-xl border-2 border-gray-200 dark:border-gray-200 text-gray-700 dark:text-gray-700 text-center shadow-md">
        Reviews yüklənir...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-200 p-4 rounded">
        {error}
      </div>
    );
  }

  if (!reviews.length) {
    return (
      <div className="bg-white dark:bg-white p-6 rounded-xl border-2 border-gray-200 dark:border-gray-200 text-center text-gray-600 dark:text-gray-600 shadow-md">
        Hələ review paylaşmamısan.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="bg-white dark:bg-white rounded-lg p-4 flex flex-col gap-3 border-2 border-gray-200 dark:border-gray-200 shadow-md hover:shadow-lg transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase text-gray-600 dark:text-gray-400">Kitab</p>
              <h3 className="text-lg text-gray-900 dark:text-gray-900">{review.book?.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-600">{review.book?.author}</p>
            </div>
            <div className="text-yellow-500 dark:text-yellow-400 text-lg font-semibold">
              {review.rating} ⭐
            </div>
          </div>

          <p className="text-gray-700 dark:text-gray-700 line-clamp-3">{review.text}</p>

          <div className="flex items-center gap-2 justify-end text-sm">
            <button
              onClick={() => onSelect?.(review)}
              className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-100 hover:bg-gray-200 dark:hover:bg-gray-200 text-gray-900 dark:text-gray-900 font-semibold transition-all"
            >
              Detallar
            </button>
            <button
              onClick={() => onEdit?.(review)}
              className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold transition-all shadow-md hover:shadow-lg"
            >
              Redaktə
            </button>
            <button
              onClick={() => onDelete?.(review)}
              className="px-3 py-1 rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold transition-all shadow-md hover:shadow-lg"
            >
              Sil
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}


