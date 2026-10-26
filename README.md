# Students Registration & Admission Portal

## Project Description

This Students Registration and Admission Portal is a responsive front-end project for a Nigerian university. Applicants enter their name, matriculation number, email, phone number, age, department and password. JavaScript validates each field, shows inline errors, blocks duplicate matriculation numbers and emails, and stores records as an array of objects in localStorage. A live table and counter display registered students, while fictional demonstration data can be loaded or cleared safely. Built with plain HTML, CSS and JavaScript, it runs directly on GitHub Pages without servers, frameworks, build tools or paid services.

## Features

- Seven-field registration form with inline error messages and valid/invalid styling
- Duplicate protection for matriculation numbers and emails (case-insensitive)
- Student table, total-count card, empty state and success message
- Form clears after a successful registration; multiple registrations supported
- Persistence with `localStorage`; passwords are stored only as salted SHA-256 hashes
- "Load demo records" and "Clear demo records" buttons (clearing removes only demo entries)
- Responsive layout: the table becomes stacked cards on phones

## File Structure

```
index.html   page structure
style.css    navy and green design, responsive rules
script.js    validation, student array, storage, rendering
README.md    this file
```

## Validation Rules

| Field | Rule |
|---|---|
| Full name | At least 2 characters |
| Matric number | 5–25 letters, digits, `/` or `-`; must be unique |
| Email | Standard `name@domain.tld` format; must be unique |
| Phone | Nigerian (`08012345678`, `+2348012345678`, `2348012345678`) or international (`+` then 8–15 digits) |
| Age | Whole number from 16 to 100 |
| Department | Must be selected |
| Password | At least 8 characters |

## How the Student Array Works

`script.js` keeps all records in one array, `students`. Each record is an object:

```js
{ id, fullName, matric, email, phone, age, department, passwordHash, isDemo }
```

Registering pushes a new object onto the array, saves the array to `localStorage` as JSON, then redraws the table with a loop. Demo records carry `isDemo: true`, so clearing them is a simple `filter`.

## How Duplicates Are Checked

`isDuplicate()` loops through `students`. Matric numbers are compared after removing spaces and uppercasing; emails are compared after trimming and lowercasing. Demo and real records share the same array, so both are checked.

## How to Run

1. Put the four files in the same folder (or repository root).
2. Open `index.html` in any modern browser, or enable GitHub Pages for the repository.

No installation, build step, backend or API key is needed.

## Limitations

- **Client-side validation is not production-grade admission security.** Anyone can bypass it using browser developer tools.
- Data lives only in this browser's `localStorage`; it is not shared, backed up or private.
- A fast salted SHA-256 hash is used for demonstration. Real systems must hash passwords on a server with bcrypt, scrypt or Argon2.
- There is no login, email verification, or admin access control.
- All sample data is fictional.
