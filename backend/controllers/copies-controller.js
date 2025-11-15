const LibraryCopy = require('../models/libraryCopySchema.js');
const Book = require('../models/bookSchema.js');

// Create a new library copy
const createCopy = async (req, res) => {
    try {
        const { bookId, bookCode, copyCode, shelf, status } = req.body;

        // Resolve bookId from bookCode if needed
        let resolvedBookId = bookId;
        if (!resolvedBookId && bookCode) {
            const book = await Book.findOne({ code: bookCode });
            if (!book) {
                return res.status(404).send({ message: 'Book not found with the provided code' });
            }
            resolvedBookId = book._id;
        }

        if (!resolvedBookId) {
            return res.status(400).send({ message: 'Either bookId or bookCode is required' });
        }

        // Verify book exists
        const book = await Book.findById(resolvedBookId);
        if (!book) {
            return res.status(404).send({ message: 'Book not found' });
        }

        // Generate copyCode if not provided
        let finalCopyCode = copyCode;
        if (!finalCopyCode || finalCopyCode.trim() === '') {
            // Generate unique code: C{bookId}-{timestamp}
            const timestamp = Date.now().toString(36).toUpperCase();
            finalCopyCode = `C${resolvedBookId.toString().slice(-6)}-${timestamp}`;
        } else {
            finalCopyCode = finalCopyCode.trim();
        }

        // Create copy
        const copy = new LibraryCopy({
            book: resolvedBookId,
            copyCode: finalCopyCode,
            shelf: shelf || null,
            status: status || 'available',
        });

        try {
            const savedCopy = await copy.save();
            // Populate book details
            await savedCopy.populate('book', 'code name rate');
            res.send({
                id: savedCopy._id,
                copyCode: savedCopy.copyCode,
                book: savedCopy.book,
                shelf: savedCopy.shelf,
                status: savedCopy.status,
            });
        } catch (saveError) {
            if (saveError.code === 11000) {
                return res.status(409).send({ message: 'Copy code already exists. Please use a different code.' });
            }
            throw saveError;
        }
    } catch (error) {
        res.status(500).json({ message: error.message, error });
    }
};

// List copies (optionally filtered by bookId)
const listCopies = async (req, res) => {
    try {
        const { bookId } = req.query;
        const query = {};
        
        if (bookId) {
            query.book = bookId;
        }

        const copies = await LibraryCopy.find(query)
            .populate('book', 'code name rate')
            .sort({ createdAt: -1 });

        res.send(copies);
    } catch (error) {
        res.status(500).json(error);
    }
};

module.exports = {
    createCopy,
    listCopies,
};

