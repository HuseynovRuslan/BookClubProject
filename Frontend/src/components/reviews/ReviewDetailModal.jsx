import { getImageUrl } from "../../api/config";

export default function ReviewDetailModal({
  review,
  onClose,
  onEdit,
  onDelete,
  errorMessage,
}) {
  if (!review) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-white text-gray-900 dark:text-gray-900 w-full max-w-2xl rounded-xl p-6 space-y-4 shadow-2xl border-2 border-gray-200 dark:border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-600 font-semibold">Review detalları</p>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-900">{review.book?.title}</h2>
            <p className="text-gray-600 dark:text-gray-600">{review.book?.author}</p>
          </div>
          <div className="text-yellow-400 text-2xl font-bold">
            {review.rating} ⭐
          </div>
        </div>

        {review.book?.coverImageUrl && (
          <img
            src={getImageUrl(review.book.coverImageUrl)}
            alt={review.book?.title}
            className="w-full h-64 object-cover rounded-lg"
          />
        )}

        <p className="text-gray-700 dark:text-gray-700 whitespace-pre-line leading-relaxed">{review.text}</p>

        <div className="flex items-center justify-between text-sm text-gray-400">
          <span className="text-gray-600 dark:text-gray-600">
            Paylaşıldı:{" "}
            {review.createdAt
              ? new Date(review.createdAt).toLocaleString()
              : "—"}
          </span>
          <span className="text-gray-600 dark:text-gray-600">
            Yeniləndi:{" "}
            {review.updatedAt
              ? new Date(review.updatedAt).toLocaleString()
              : "—"}
          </span>
        </div>

        {errorMessage && (
          <div className="text-sm text-red-700 dark:text-red-700 bg-red-50 dark:bg-red-50 border-2 border-red-200 dark:border-red-200 p-3 rounded-lg font-semibold">
            {errorMessage}
          </div>
        )}

        <div className="flex justify-end gap-3">
          {onDelete && (
            <button
              onClick={() => onDelete(review)}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold transition-all shadow-md hover:shadow-lg"
            >
              Sil
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(review)}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold transition-all shadow-md hover:shadow-lg"
            >
              Redaktə
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-100 hover:bg-gray-200 dark:hover:bg-gray-200 text-gray-900 dark:text-gray-900 font-semibold transition-all"
          >
            Bağla
          </button>
        </div>
      </div>
    </div>
  );
}


