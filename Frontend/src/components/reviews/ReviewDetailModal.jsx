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
      <div className="bg-gray-900 text-white w-full max-w-2xl rounded-xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Review detalları</p>
            <h2 className="text-2xl font-semibold text-white">{review.book?.title}</h2>
            <p className="text-gray-400">{review.book?.author}</p>
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

        <p className="text-gray-200 whitespace-pre-line">{review.text}</p>

        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>
            Paylaşıldı:{" "}
            {review.createdAt
              ? new Date(review.createdAt).toLocaleString()
              : "—"}
          </span>
          <span>
            Yeniləndi:{" "}
            {review.updatedAt
              ? new Date(review.updatedAt).toLocaleString()
              : "—"}
          </span>
        </div>

        {errorMessage && (
          <div className="text-sm text-red-300 bg-red-900/30 p-3 rounded">
            {errorMessage}
          </div>
        )}

        <div className="flex justify-end gap-3">
          {onDelete && (
            <button
              onClick={() => onDelete(review)}
              className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-500"
            >
              Sil
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(review)}
              className="px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-500"
            >
              Redaktə
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-gray-700 hover:bg-gray-600"
          >
            Bağla
          </button>
        </div>
      </div>
    </div>
  );
}


