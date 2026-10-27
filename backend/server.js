

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./db');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Test the API
app.get('/', (req, res) => {
    res.send('Community Library API is running!');
});

// Test the MySQL connection
app.get('/test-db', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT DATABASE() AS databaseName'
        );

        res.json({
            message: 'MySQL connected successfully!',
            database: rows[0].databaseName
        });
    } catch (error) {
        console.error('Database error:', error.message);
        res.status(500).json({
            error: 'Database connection failed.'
        });
    }
});

// Get all books
app.get('/books', async (req, res) => {
    try {
        const [books] = await pool.query(
            'SELECT * FROM books'
        );

        res.json(books);
    } catch (error) {
        console.error('Get books error:', error.message);
        res.status(500).json({
            error: 'Failed to fetch books.'
        });
    }
});

// Add a new book
app.post('/books', async (req, res) => {
    try {
        const { title, author, genre, isbn, quantity } = req.body;

        if (
            !title || !author ||
            quantity === undefined ||
            !Number.isInteger(Number(quantity)) ||
            Number(quantity) < 0
        ) {
            return res.status(400).json({
                error: 'Enter a title, author and valid quantity.'
            });
        }

        const [result] = await pool.query(
            `INSERT INTO books
            (title, author, genre, isbn, quantity)
            VALUES (?, ?, ?, ?, ?)`,
            [
                title,
                author,
                genre || null,
                isbn || null,
                Number(quantity)
            ]
        );

        res.status(201).json({
            message: 'Book added successfully!',
            id: result.insertId
        });
    } catch (error) {
        console.error('Add book error:', error.message);
        res.status(500).json({
            error: 'Failed to add book. Check whether its ISBN already exists.'
        });
    }
});

// Update a book
app.put('/books/:id', async (req, res) => {
    try {
        const { title, author, genre, isbn, quantity } = req.body;
        const { id } = req.params;

        if (
            !title || !author ||
            quantity === undefined ||
            !Number.isInteger(Number(quantity)) ||
            Number(quantity) < 0
        ) {
            return res.status(400).json({
                error: 'Enter a title, author and valid quantity.'
            });
        }

        const [result] = await pool.query(
            `UPDATE books
             SET title = ?, author = ?, genre = ?, isbn = ?, quantity = ?
             WHERE id = ?`,
            [
                title,
                author,
                genre || null,
                isbn || null,
                Number(quantity),
                id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: 'Book not found.'
            });
        }

        res.json({ message: 'Book updated successfully!' });
    } catch (error) {
        console.error('Update book error:', error.message);
        res.status(500).json({
            error: 'Failed to update book. Check whether the ISBN is already used.'
        });
    }
});

// Delete a book
app.delete('/books/:id', async (req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM books WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: 'Book not found.'
            });
        }

        res.json({ message: 'Book deleted successfully!' });
    } catch (error) {
        console.error('Delete book error:', error.message);
        res.status(500).json({
            error: 'Failed to delete book. It may have existing transactions.'
        });
    }
});

// Record a transaction
app.post('/transactions', async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const { bookId, type, quantity } = req.body;
        const amount = Number(quantity);

        if (
            !bookId ||
            !['add', 'borrow', 'return'].includes(type) ||
            !Number.isInteger(amount) ||
            amount < 1
        ) {
            return res.status(400).json({
                error: 'Enter a valid book, transaction type and quantity.'
            });
        }

        await connection.beginTransaction();

        const [books] = await connection.query(
            'SELECT * FROM books WHERE id = ? FOR UPDATE',
            [bookId]
        );

        if (books.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                error: 'Book not found.'
            });
        }

        const book = books[0];
        const current = Number(book.quantity);

        if (type === 'borrow' && amount > current) {
            await connection.rollback();

            return res.status(400).json({
                error: `Only ${current} copies are available.`
            });
        }

        const newQuantity = type === 'borrow'
            ? current - amount
            : current + amount;

        await connection.query(
            'UPDATE books SET quantity = ? WHERE id = ?',
            [newQuantity, bookId]
        );

        const databaseType = type === 'return' ? 'add' : type;

        await connection.query(
            `INSERT INTO transactions
            (book_id, transaction_type, quantity)
            VALUES (?, ?, ?)`,
            [bookId, databaseType, amount]
        );

        await connection.commit();

        res.status(201).json({
            message: 'Transaction recorded successfully.',
            newQuantity
        });
    } catch (error) {
        await connection.rollback();

        console.error('Transaction error:', error.message);

        res.status(500).json({
            error: 'Failed to record transaction.'
        });
    } finally {
        connection.release();
    }
});

// Get transaction history from MySQL
app.get('/transactions', async (req, res) => {
    try {
        const [transactions] = await pool.query(`
            SELECT
                transactions.id,
                transactions.book_id AS bookId,
                books.title AS bookTitle,
                transactions.transaction_type AS type,
                transactions.quantity AS qty,
                transactions.transaction_date AS date
            FROM transactions
            INNER JOIN books
                ON transactions.book_id = books.id
            ORDER BY transactions.transaction_date DESC
        `);

        res.json(transactions);
    } catch (error) {
        console.error('Error loading transactions:', error.message);
        res.status(500).json({
            error: 'Failed to load transaction history.'
        });
    }
});
 // Login using membership ID and name
app.post('/login', async (req, res) => {
    try {
        const { membershipId, name } = req.body;

        if (!membershipId || !name) {
            return res.status(400).json({
                error: 'Enter your membership ID and name.'
            });
        }

        const [users] = await pool.query(
            `SELECT
                id,
                name,
                membership_id AS membershipId,
                role
             FROM users
             WHERE LOWER(membership_id) = LOWER(?)
             AND LOWER(name) = LOWER(?)
             LIMIT 1`,
            [membershipId.trim(), name.trim()]
        );

        if (users.length === 0) {
            return res.status(401).json({
                error: 'Incorrect membership ID or name.'
            });
        }

        res.json(users[0]);
    } catch (error) {
        console.error('Login error:', error.message);

        res.status(500).json({
            error: 'Login failed. Please try again.'
        });
    }
});
// Get all users from MySQL
app.get('/users', async (req, res) => {
    try {
        const [users] = await pool.query(
            `SELECT
                id,
                name,
                membership_id AS membershipId,
                role
             FROM users`
        );

        res.json(users);
    } catch (error) {
        console.error('Get users error:', error.message);
        res.status(500).json({
            error: 'Failed to load users.'
        });
    }
});

 // Add a member
app.post('/users', async (req, res) => {
    try {
        const { name, membershipId, role } = req.body;

        if (!name || !membershipId || !['admin', 'member'].includes(role)) {
            return res.status(400).json({
                error: 'Enter a name, membership ID and valid role.'
            });
        }

        const [result] = await pool.query(
            `INSERT INTO users (name, membership_id, role)
             VALUES (?, ?, ?)`,
            [name.trim(), membershipId.trim(), role]
        );

        res.status(201).json({
            id: result.insertId,
            name: name.trim(),
            membershipId: membershipId.trim(),
            role
        });
    } catch (error) {
        console.error('Add member error:', error.message);
        res.status(500).json({
            error: 'Failed to add member. Check whether the membership ID already exists.'
        });
    }
});

// Update a member
app.put('/users/:id', async (req, res) => {
    try {
        const { name, membershipId, role } = req.body;

        if (!name || !membershipId || !['admin', 'member'].includes(role)) {
            return res.status(400).json({
                error: 'Enter a name, membership ID and valid role.'
            });
        }

        const [result] = await pool.query(
            `UPDATE users
             SET name = ?, membership_id = ?, role = ?
             WHERE id = ?`,
            [name.trim(), membershipId.trim(), role, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: 'Member not found.'
            });
        }

        res.json({ message: 'Member updated successfully.' });
    } catch (error) {
        console.error('Update member error:', error.message);
        res.status(500).json({
            error: 'Failed to update member.'
        });
    }
});

// Delete a member
app.delete('/users/:id', async (req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM users WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: 'Member not found.'
            });
        }

        res.json({ message: 'Member deleted successfully.' });
    } catch (error) {
        console.error('Delete member error:', error.message);
        res.status(500).json({
            error: 'Failed to delete member.'
        });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log('Server running at http://localhost:' + PORT);
});