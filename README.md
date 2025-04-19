# 🧠 Ultimate H1B Sponsorship Checker Chrome Extension

A powerful, intelligent Chrome Extension that helps international job seekers instantly understand a company's H1B sponsorship eligibility — directly within job boards like LinkedIn.

## 🚀 Overview
This extension enhances job listings by adding a dynamic **"H1B Info"** button next to job postings. When clicked, it fetches and displays:

- ✅ Historical **H1B approval/denial data** from the past 5 years
- 🔍 Real-time analysis of **job descriptions** for sponsorship red flags
- 📰 **Latest news** about the company
- 📊 Graph-based H1B trends
- 📣 "Report Issue" feature to improve data accuracy
- 🔐 **.edu restricted authentication** using Firebase

## ✨ Features

- 🧪 **AI-powered eligibility checker**: Flags if a job is likely not eligible for sponsorship using keyword-based confidence scoring
- 🔐 **Authentication flow**: Only allows users with verified `.edu` email addresses
- 💾 **Secure local storage**: Keeps login state in Chrome’s storage
- 📥 **Report issue form**: Let users submit data inaccuracies directly to the developer’s inbox
- 🧠 **Company Insights**: Industry news pulled from news APIs
- ⚙️ **Extension auto-reactivity**: Listens for job changes and re-injects button accordingly

## 🧰 Tech Stack

- **Frontend**: Vanilla JS, HTML, CSS
- **Backend**: Node.js + Express
- **Database**: SQL Server (H1B dataset)
- **Auth**: Firebase Auth (with email verification)
- **APIs Used**:
  - News API (or TheNewsAPI)
  - Internal SQL endpoints for H1B trends

## 🔒 Authentication Rules

Only `.edu` users are allowed to:
- Access the tool
- Submit feedback
- View company insights

Users must verify their email before usage is unlocked.

## 🧪 Example Use Case

1. User visits a job post on LinkedIn
2. Extension injects an "H1B Info" button next to the job title
3. Clicking the button opens a detailed popup with:
   - Sponsorship eligibility result
   - H1B graph data
   - Company tech stack/news
4. User can click "Report Issue" to flag false negatives/positives

## 📸 Screenshots
(You can add actual screenshots or demo GIFs here.)

## 🛠️ Setup Instructions

```bash
# Clone this repo
$ git clone https://github.com/your-username/h1b-web-extension.git

# Install backend dependencies
$ cd backend
$ npm install
$ node index.js

# Load frontend manually in Chrome
1. Visit chrome://extensions
2. Enable Developer Mode
3. Click "Load Unpacked"
4. Select the `frontend` folder
```

## 🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you’d like to change.

## 📧 Feedback / Contact
Feel free to open issues, or use the **Report Issue** button inside the extension to contact the maintainer.

---
Built with ❤️ by [Chathrapathi Nikhil Kandagatla](https://github.com/your-username)
