# GitFinder — Developer Analytics PWA 🔍

GitFinder is a premium, browser-native web application built with **Vanilla JavaScript, HTML, and CSS**. It allows you to instantly search any GitHub username to view their analytics, profile statistics, and latest repositories in a sleek, high-end dark interface.

🔗 **Live Demo:** [https://shahzaib-io-dev.github.io/git-finder/](https://shahzaib-io-dev.github.io/git-finder/)

---

## ✨ Key Features

- **PWA (Progressive Web App):** Fully installable on Desktop and Mobile. Works as a standalone native-like app.
- **Live GitHub API Integration:** Fetches real-time user data and repositories directly from the GitHub REST API.
- **Premium Dark UI:** Features glassmorphism, neon cyan accents, and smooth micro-animations.
- **Skeleton Loading:** Uses shimmer skeleton screens for a seamless and fast-loading user experience.
- **Search History:** Saves your recent searches locally (using `localStorage`) for quick access.
- **Dynamic Language Colors:** Repository tags auto-update their colors based on the programming language (e.g., JavaScript is Yellow, CSS is Purple).
- **Smart Error Handling:** Gracefully handles 404s (User not found), Rate Limits, and Network connection errors.
- **Keyboard Shortcuts:** Press `/` to instantly focus on the search bar.
- **Fully Responsive:** Adapts perfectly to mobile, tablet, and desktop screens.

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **API:** GitHub REST API
- **Storage:** Browser LocalStorage (for search history)
- **PWA:** Service Workers & Web App Manifest

---

## 🚀 How to Run Locally

Since GitFinder is built with pure vanilla web technologies, running it is incredibly simple:

1. Clone the repository:
   ```bash
   git clone https://github.com/shahzaib-io-dev/git-finder.git
