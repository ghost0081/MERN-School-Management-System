# Library Management System

## Overview
The Library Management System allows admins to import books from Excel/CSV files and librarians to search books and register physical copies.

## Backend API Endpoints

### Books

#### Import Books
- **POST** `/Books/Import?dryRun=true|false`
  - Upload Excel (.xlsx, .xls) or CSV file with columns: BookCode (or Code), BookName (or Name/Title), Rate (or Price, optional)
  - Query parameter `dryRun=true` returns preview without saving
  - Query parameter `dryRun=false` performs actual import
  - Returns: `{ importId, filename, inserted, updated, skipped, errorsCount, errors }`

#### Search Books
- **GET** `/Books?q=&page=&limit=`
  - Search by book code or name (case-insensitive)
  - Pagination: `page` (default: 1), `limit` (default: 20, max: 100)
  - Returns: `{ data: [{_id, code, name, rate}], page, limit, total }`

### Library Copies

#### Create Copy
- **POST** `/Copies`
  - Body: `{ bookId?, bookCode?, copyCode?, shelf?, status? }`
  - Either `bookId` or `bookCode` is required
  - `copyCode` is auto-generated if not provided
  - Returns: `{ id, copyCode, book, shelf, status }`

#### List Copies
- **GET** `/Copies?bookId=`
  - Optional `bookId` filter
  - Returns: Array of copy objects with book details

## Frontend Pages

### Admin Upload Books
- **Route**: `/Admin/library/upload`
- **Features**:
  - File upload (.xlsx, .xls, .csv)
  - Preview first 10 rows before import
  - View import summary (inserted/updated/skipped)
  - Error display

### Library Books Search
- **Route**: `/Admin/library/books`
- **Features**:
  - Search books by code or name
  - Paginated results
  - Register new copy for a book
  - View all copies for a book

## Data Models

### Book
- `code` (String, unique, required) - Book code
- `name` (String, required) - Book name
- `rate` (Number, optional) - Price/rate

### ImportLog
- `filename` (String) - Imported file name
- `status` (Enum: pending, completed, failed)
- `inserted` (Number) - Count of inserted books
- `updated` (Number) - Count of updated books
- `skipped` (Number) - Count of skipped rows
- `errors` (Array) - Error details

### LibraryCopy
- `book` (ObjectId, ref: Book) - Reference to book
- `copyCode` (String, unique) - Unique copy identifier
- `shelf` (String, optional) - Shelf location
- `status` (Enum: available, issued, lost, damaged)
- `acquiredOn` (Date) - Acquisition date

## Usage Notes

1. **File Format**: Excel/CSV files must have headers. Accepts flexible column names:
   - BookCode/Code for book code
   - BookName/Name/Title for book name
   - Rate/Price for price (optional)

2. **Import Process**:
   - Always preview first (`dryRun=true`)
   - Review errors and preview data
   - Import when ready (`dryRun=false`)

3. **Copy Registration**:
   - Can register copy by book ID or book code
   - Copy code auto-generated if not provided
   - Format: `C{bookId}-{timestamp}`

4. **Error Handling**:
   - Duplicate BookCodes within file are skipped
   - Missing required fields are logged as errors
   - Database unique constraint violations return 409

## Security Notes

- Currently no authentication middleware (TODO: Add admin/librarian role checks)
- File size limit: 10MB
- Supported file types: .xlsx, .xls, .csv

