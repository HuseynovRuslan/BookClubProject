// Helpers shared by the shelf screens.

export const SHELF_NAME_MAX = 100; // Backend validators: name required, at most 100 characters.

// Default shelves first, in the order the Make screen shows them, then the user's own shelves.
const defaultOrder = ['Currently Reading', 'Want to Read', 'Read'];
const orderOf = (shelf) => {
  if (!shelf.isDefault) return defaultOrder.length + 1;
  const index = defaultOrder.indexOf(shelf.name);
  return index === -1 ? defaultOrder.length : index;
};
export const sortShelves = (list) =>
  list
    .map((shelf, index) => ({ shelf, index }))
    .sort((a, b) => orderOf(a.shelf) - orderOf(b.shelf) || a.index - b.index)
    .map(({ shelf }) => shelf);

export const shelfCount = (shelf) => shelf?.bookCount || shelf?.books?.length || 0;
export const bookWord = (count) => `${count} kitab`;
