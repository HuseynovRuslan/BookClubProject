import { useState } from "react";
import { useTranslation } from "../hooks/useTranslation";

export default function CreateBookModal({ onClose, onCreate }) {
  const t = useTranslation();
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !genre.trim() || !description.trim()) {
      setError(t("book.fillRequired"));
      return;
    }

    const coverImage =
      imageFile ? URL.createObjectURL(imageFile) : "/default-book-cover.png";

    const newBook = {
      id: Date.now().toString(),
      title: title.trim(),
      genre: genre.trim(),
      description: description.trim(),
      coverImage,
      author: "Unknown",
    };

    onCreate(newBook);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white rounded-xl p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-semibold mb-4">{t("book.addNew")}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cover Image */}
          <div>
            <label className="block text-sm mb-1">{t("book.coverImage")}</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full bg-gray-800 p-2 rounded text-white"
            />
            {!imageFile && (
              <p className="text-xs text-gray-400 mt-1">
                {t("book.noImageSelected")}
              </p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm mb-1">{t("book.title")}</label>
            <input
              type="text"
              value={title}
              placeholder={t("book.title")}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-800 p-2 rounded text-white"
            />
          </div>

          {/* Genre */}
          <div>
            <label className="block text-sm mb-1">{t("book.genre")}</label>
            <input
              type="text"
              value={genre}
              placeholder={t("book.genre")}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full bg-gray-800 p-2 rounded text-white"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm mb-1">{t("book.description")}</label>
            <textarea
              value={description}
              rows={3}
              placeholder={t("book.description")}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-800 p-2 rounded text-white"
            />
          </div>

          {/* Error */}
          {error && <p className="text-red-400 text-sm">{error}</p>}

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full bg-gray-700 hover:bg-gray-600"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-full bg-gray-900 dark:bg-purple-600 hover:bg-gray-800 dark:hover:bg-purple-700 text-white"
            >
              {t("common.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
