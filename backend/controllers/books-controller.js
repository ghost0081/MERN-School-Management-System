const Book = require('../models/bookSchema.js');
const ImportLog = require('../models/importLogSchema.js');
const XLSX = require('xlsx');
const multer = require('multer');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'application/vnd.ms-excel', // .xls
            'text/csv', // .csv
        ];
        if (allowedTypes.includes(file.mimetype) || 
            file.originalname.endsWith('.xlsx') || 
            file.originalname.endsWith('.xls') || 
            file.originalname.endsWith('.csv')) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only .xlsx, .xls, and .csv files are allowed.'));
        }
    },
});

// Helper function to normalize header names
const normalizeHeader = (header) => {
    if (!header) return null;
    const normalized = header.toLowerCase().trim().replace(/[\s_]/g, '');
    // Map synonyms
    const synonyms = {
        'bookcode': 'code',
        'code': 'code',
        'bookname': 'name',
        'name': 'name',
        'title': 'name',
        'rate': 'rate',
        'price': 'rate',
    };
    return synonyms[normalized] || normalized;
};

// Helper function to parse Excel/CSV file
const parseFile = (buffer, filename) => {
    let workbook;
    if (filename.endsWith('.csv')) {
        workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
    } else {
        workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
    }
    
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { 
        defval: null, 
        raw: false, 
        blankrows: false 
    });
    
    return rows;
};

// Helper function to validate and normalize rows
const validateAndNormalizeRows = (rows) => {
    if (!rows || rows.length === 0) {
        throw new Error('File is empty or has no data rows');
    }

    // Detect headers from first row
    const firstRow = rows[0];
    const headers = Object.keys(firstRow);
    
    // Map headers
    const headerMap = {};
    let codeHeader = null;
    let nameHeader = null;
    let rateHeader = null;

    headers.forEach(header => {
        const normalized = normalizeHeader(header);
        if (normalized === 'code') {
            codeHeader = header;
            headerMap[header] = 'code';
        } else if (normalized === 'name') {
            nameHeader = header;
            headerMap[header] = 'name';
        } else if (normalized === 'rate') {
            rateHeader = header;
            headerMap[header] = 'rate';
        }
    });

    if (!codeHeader || !nameHeader) {
        throw new Error('Required columns not found. File must contain BookCode (or Code) and BookName (or Name/Title) columns.');
    }

    // Normalize rows
    const normalizedRows = [];
    const seenCodes = new Set();
    const errors = [];

    rows.forEach((row, index) => {
        const rowNum = index + 2; // +2 because index is 0-based and we skip header row
        const code = row[codeHeader] ? String(row[codeHeader]).trim() : null;
        const name = row[nameHeader] ? String(row[nameHeader]).trim() : null;
        let rate = row[rateHeader];

        // Validate required fields
        if (!code || code === '') {
            errors.push({ row: rowNum, code: code || '', error: 'BookCode is required' });
            return;
        }
        if (!name || name === '') {
            errors.push({ row: rowNum, code: code, error: 'BookName is required' });
            return;
        }

        // Check for duplicates within file
        if (seenCodes.has(code)) {
            errors.push({ row: rowNum, code: code, error: 'Duplicate BookCode within file' });
            return;
        }
        seenCodes.add(code);

        // Parse rate
        if (rate !== null && rate !== undefined && rate !== '') {
            const parsedRate = parseFloat(rate);
            rate = isNaN(parsedRate) ? null : parsedRate;
        } else {
            rate = null;
        }

        normalizedRows.push({ code, name, rate, rowNum });
    });

    return { normalizedRows, errors };
};

// Upload middleware
const uploadMiddleware = upload.single('file');

// Import books from Excel/CSV
const importBooks = async (req, res) => {
    try {
        const { dryRun } = req.query;
        const isDryRun = dryRun === 'true';

        if (!req.file) {
            return res.status(400).send({ message: 'No file uploaded' });
        }

        const { buffer, originalname } = req.file;

        // Parse file
        let rows;
        try {
            rows = parseFile(buffer, originalname);
        } catch (error) {
            return res.status(400).send({ message: `Error parsing file: ${error.message}` });
        }

        // Validate and normalize
        let normalizedRows, errors;
        try {
            const result = validateAndNormalizeRows(rows);
            normalizedRows = result.normalizedRows;
            errors = result.errors;
        } catch (error) {
            return res.status(400).send({ message: error.message });
        }

        // If dry run, return preview
        if (isDryRun) {
            const preview = normalizedRows.slice(0, 10);
            return res.send({
                preview,
                totalRows: normalizedRows.length,
                errorsCount: errors.length,
                errors: errors.slice(0, 50), // Limit errors in preview
            });
        }

        // Create import log
        const importLog = new ImportLog({
            filename: originalname,
            status: 'pending',
            errors: errors.slice(0, 1000), // Cap errors at 1000
        });

        // Perform bulk upsert
        const bulkOps = [];
        let inserted = 0;
        let updated = 0;
        // Start with validation errors
        let skipped = errors.length;

        for (const row of normalizedRows) {
            bulkOps.push({
                updateOne: {
                    filter: { code: row.code },
                    update: { $set: { name: row.name, rate: row.rate } },
                    upsert: true,
                },
            });
        }

        if (bulkOps.length > 0) {
            try {
                const result = await Book.bulkWrite(bulkOps, { ordered: false });
                inserted = result.upsertedCount || 0;
                // matchedCount includes both updated and upserted, so subtract upserted to get updated
                updated = Math.max(0, (result.matchedCount || 0) - inserted);
                
                // Handle write errors if any
                if (result.writeErrors && result.writeErrors.length > 0) {
                    result.writeErrors.forEach(err => {
                        const rowIndex = err.index;
                        if (rowIndex >= 0 && rowIndex < normalizedRows.length) {
                            const row = normalizedRows[rowIndex];
                            errors.push({ 
                                row: row.rowNum, 
                                code: row.code, 
                                error: err.errmsg || 'Database error' 
                            });
                            skipped++;
                        }
                    });
                }
            } catch (bulkError) {
                // Handle bulk write errors
                if (bulkError.writeErrors) {
                    bulkError.writeErrors.forEach(err => {
                        const rowIndex = err.index;
                        if (rowIndex >= 0 && rowIndex < normalizedRows.length) {
                            const row = normalizedRows[rowIndex];
                            errors.push({ 
                                row: row.rowNum, 
                                code: row.code, 
                                error: err.errmsg || 'Database error' 
                            });
                            skipped++;
                        }
                    });
                }
                // If critical error (not just write errors), fail the import
                if (bulkError.code && bulkError.code !== 11000) {
                    throw bulkError;
                }
                // For duplicate key errors, we've already handled them in writeErrors
            }
        }

        // Update import log
        importLog.inserted = inserted;
        importLog.updated = updated;
        importLog.skipped = skipped;
        importLog.status = errors.length > normalizedRows.length ? 'failed' : 'completed';
        await importLog.save();

        res.send({
            importId: importLog._id,
            filename: originalname,
            inserted,
            updated,
            skipped,
            errorsCount: errors.length,
            errors: errors.slice(0, 100), // Return first 100 errors
        });
    } catch (error) {
        res.status(500).json({ message: error.message, error });
    }
};

// Search books with pagination
const searchBooks = async (req, res) => {
    try {
        const { q = '', page = 1, limit = 20 } = req.query;
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        let query = {};
        if (q && q.trim()) {
            // Case-insensitive search on code or name
            const searchRegex = new RegExp(q.trim(), 'i');
            query = {
                $or: [
                    { code: searchRegex },
                    { name: searchRegex },
                ],
            };
        }

        const [data, total] = await Promise.all([
            Book.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .select('_id code name rate createdAt'),
            Book.countDocuments(query),
        ]);

        res.send({
            data,
            page: pageNum,
            limit: limitNum,
            total,
        });
    } catch (error) {
        res.status(500).json(error);
    }
};

module.exports = {
    importBooks,
    searchBooks,
    uploadMiddleware,
};

