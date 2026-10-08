/* Local storage "database". Same keys as the original project:
   msl_books, msl_users, msl_transactions, msl_current_user */

export const DB_KEYS = {
  books: 'msl_books',
  users: 'msl_users',
  txns: 'msl_transactions',
  session: 'msl_current_user'
};

export function readKey(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.error('Could not read ' + key, e);
    return fallback;
  }
}

export function writeKey(key, value) {
  if (value === null) localStorage.removeItem(key);
  else localStorage.setItem(key, JSON.stringify(value));
}

export function makeId(prefix) {
  return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/* First-run seed data (used as the initial value when storage is empty). */
export function seedUsers() {
  return [{ id: makeId('u'), name: 'Librarian', membershipId: 'ADM-001', role: 'admin' }];
}

export function seedBooks() {
  return [
    { id: makeId('b'), title: 'Things Fall Apart', author: 'Chinua Achebe', genre: 'Fiction', isbn: '9780385474542', quantity: 4 },
    { id: makeId('b'), title: 'Nervous Conditions', author: 'Tsitsi Dangarembga', genre: 'Fiction', isbn: '9780954702335', quantity: 1 },
    { id: makeId('b'), title: 'Sesotho Folktales', author: 'Various', genre: 'Folklore', isbn: '9780620123456', quantity: 0 }
  ];
}

export const isLowStock = (book) => Number(book.quantity) < 2;
export const byTitle = (a, b) => a.title.localeCompare(b.title);
