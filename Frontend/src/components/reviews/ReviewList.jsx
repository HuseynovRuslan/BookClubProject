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
      <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded text-gray-700 dark:text-gray-300 text-center">
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
      <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded text-center text-gray-600 dark:text-gray-400">
        Hələ review paylaşmamısan.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 flex flex-col gap-3 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase text-gray-600 dark:text-gray-400">Kitab</p>
              <h3 className="text-lg text-gray-900 dark:text-white">{review.book?.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{review.book?.author}</p>
            </div>
            <div className="text-yellow-500 dark:text-yellow-400 text-lg font-semibold">
              {review.rating} ⭐
            </div>
          </div>

          <p className="text-gray-700 dark:text-gray-300 line-clamp-3">{review.text}</p>

          <div className="flex items-center gap-2 justify-end text-sm">
            <button
              onClick={() => onSelect?.(review)}
              className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
            >
              Detallar
            </button>
            <button
              onClick={() => onEdit?.(review)}
              className="px-3 py-1 rounded bg-gray-900 dark:bg-purple-600 hover:bg-gray-800 dark:hover:bg-purple-500 text-white"
            >
              Redaktə
            </button>
            <button
              onClick={() => onDelete?.(review)}
              className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white"
            >
              Sil
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}


