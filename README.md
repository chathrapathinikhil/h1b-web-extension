# Web Extension Project

## Overview

This project is a Chrome extension that provides H1B sponsorship information and job recommendations. It consists of a backend built with Express and Node.js, and a frontend Chrome extension with .edu email authentication.

## Project Structure

```
web-extension-project
├── backend
│   ├── app.js
│   ├── routes
│   │   └── index.js
│   ├── controllers
│   │   └── index.js
│   ├── app.js
│   ├── .env
│   ├── db.js
│   ├── package-lock.json
│   └── package.json
├── frontend
│   ├── public
│   │   ├── manifest.json
│   │   ├── background.js
│   │   ├── verify.html
│   │   ├── verify.js
│   │   ├── report.html
│   │   ├── report.js
│   │   ├── popup.html
│   │   ├── popup.js
│   │   ├── extension.js
│   │   ├── firebase-auth-compat.js
│   │   ├── index.html
│   │   ├── firebase-app-compat.js
│   │   ├── firebase-config.js
│   │   └── style.css
│   └── package.json
├── README.md
└── .gitignore
```

## Backend Setup

1. Navigate to the `backend` directory:
   ```
   cd backend
   ```
2. Install dependencies:
   ```
   npm install express
   ```
3. Start the server:
   ```
   node app.js
   ```

## Frontend Setup

1. Navigate to the `frontend` directory:
   ```
   cd frontend
   ```
2. Install dependencies:
   ```
   npm install firebase @firebase/auth
   ```
3. Configure Firebase:

   - Add your Firebase configuration to `public/firebase-config.js`

4. Load in Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `frontend/public` directory

## Usage

- Sign in with .edu email when prompted
- Browse job listings on LinkedIn, Indeed, or Glassdoor
- Click "H1B Info" button to view sponsorship information
- View company's H1B filing history and analysis

## Contributing

Feel free to submit issues or pull requests for improvements or bug fixes.

## License

This project is licensed under the MIT License.
