const usernameInput = document.getElementById('usernameInput');
const searchBtn = document.getElementById('searchBtn');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const loading = document.getElementById('skeletonLoader'); 
const errorBox = document.getElementById('errorBox');
const resultBox = document.getElementById('resultBox');
const historyBox = document.getElementById('searchHistoryBox');
const historyChips = document.getElementById('historyChips');
const scrollTopBtn = document.getElementById('scrollTopBtn');
const copyUsernameBtn = document.getElementById('copyUsernameBtn');

const langColors = {
    "JavaScript": "#f1e05a", "TypeScript": "#3178c6", "HTML": "#e34c26", 
    "CSS": "#563d7c", "Python": "#3572A5", "PHP": "#4F5D95", 
    "Java": "#b07219", "C++": "#f34b7d", "C#": "#178600", 
    "Ruby": "#701516", "Go": "#00ADD8", "Rust": "#dea584", 
    "Swift": "#F05138", "Kotlin": "#A97BFF", "Dart": "#00B4AB"
};

// Set Dynamic Year in Footer
document.getElementById('currentYear').textContent = new Date().getFullYear();

// =========================================
// Search Input Logic (Clear Button)
// =========================================
usernameInput.addEventListener('input', () => {
    if (usernameInput.value.length > 0) {
        clearSearchBtn.classList.remove('hidden');
    } else {
        clearSearchBtn.classList.add('hidden');
    }
});

clearSearchBtn.addEventListener('click', () => {
    usernameInput.value = '';
    clearSearchBtn.classList.add('hidden');
    usernameInput.focus();
});

// =========================================
// Search History Logic (LocalStorage)
// =========================================
function getHistory() {
    return JSON.parse(localStorage.getItem('gitfinder_history')) || [];
}

function addToHistory(username) {
    let history = getHistory();
    history = history.filter(u => u !== username);
    history.unshift(username);
    history = history.slice(0, 5);
    localStorage.setItem('gitfinder_history', JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    const history = getHistory();
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    
    if (history.length === 0) {
        historyBox.classList.add('hidden');
        return;
    }
    
    historyBox.classList.remove('hidden');
    historyChips.innerHTML = '';
    history.forEach(username => {
        const btn = document.createElement('button');
        btn.textContent = username;
        btn.onclick = () => quickSearch(username);
        historyChips.appendChild(btn);
    });

    clearHistoryBtn.onclick = () => {
        localStorage.removeItem('gitfinder_history');
        renderHistory();
    };
}

function quickSearch(username) {
    usernameInput.value = username;
    clearSearchBtn.classList.remove('hidden');
    handleSearch();
}

// =========================================
// Copy Username Logic
// =========================================
copyUsernameBtn.addEventListener('click', () => {
    const username = document.getElementById('username').textContent;
    navigator.clipboard.writeText(username).then(() => {
        // Show success state
        copyUsernameBtn.classList.add('copied');
        const originalSvg = copyUsernameBtn.innerHTML;
        copyUsernameBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>`;
        
        setTimeout(() => {
            copyUsernameBtn.classList.remove('copied');
            copyUsernameBtn.innerHTML = originalSvg;
        }, 2000);
    });
});

// =========================================
// Main Search Logic
// =========================================
searchBtn.addEventListener('click', handleSearch);
usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});

document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== usernameInput) {
        e.preventDefault();
        usernameInput.focus();
    }
});

async function handleSearch() {
    const username = usernameInput.value.trim();
    if (!username) return;

    loading.classList.remove('hidden');
    errorBox.classList.add('hidden');
    resultBox.classList.add('hidden');

    try {
        const userRes = await fetch(`https://api.github.com/users/${username}`);
        
        if (userRes.status === 403) {
            document.getElementById('errorTitle').textContent = "Rate Limit Exceeded";
            document.getElementById('errorDesc').textContent = "GitHub API limit reached (60 requests/hour). Please try again later.";
            throw new Error('Rate Limit');
        }
        if (!userRes.ok) {
            document.getElementById('errorTitle').textContent = "User Not Found";
            document.getElementById('errorDesc').textContent = "Please check the spelling or try another username.";
            throw new Error('Not Found');
        }

        const userData = await userRes.json();
        const repoRes = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`);
        const repoData = await repoRes.json();

        await new Promise(resolve => setTimeout(resolve, 600));

        populateProfile(userData);
        populateRepos(repoData, username);
        addToHistory(username);

        loading.classList.add('hidden');
        resultBox.classList.remove('hidden');

    } catch (error) {
        loading.classList.add('hidden');
        errorBox.classList.remove('hidden');
        
        if (error.message === 'Failed to fetch') {
            document.getElementById('errorTitle').textContent = "Network Error";
            document.getElementById('errorDesc').textContent = "Please check your internet connection and try again.";
        }
    }
}

function populateProfile(user) {
    document.getElementById('avatar').src = user.avatar_url;
    document.getElementById('name').textContent = user.name || user.login;
    
    const usernameEl = document.getElementById('username');
    usernameEl.textContent = `@${user.login}`;
    usernameEl.href = user.html_url;

    const bioEl = document.getElementById('bio');
    bioEl.textContent = user.bio || "This user prefers to keep an air of mystery about them.";
    bioEl.style.color = user.bio ? "var(--text-secondary)" : "var(--text-muted)";
    bioEl.style.fontStyle = user.bio ? "normal" : "italic";

    document.getElementById('repos').textContent = user.public_repos;
    document.getElementById('followers').textContent = user.followers;
    document.getElementById('following').textContent = user.following;
    document.getElementById('location').textContent = user.location || "Not available";
    
    const date = new Date(user.created_at);
    const options = { month: 'short', year: 'numeric' };
    document.getElementById('joined').textContent = `Joined ${date.toLocaleDateString('en-US', options)}`;
    document.getElementById('profileLink').href = user.html_url;
}

function populateRepos(repos, username) {
    const reposGrid = document.getElementById('reposGrid');
    reposGrid.innerHTML = '';

    document.getElementById('viewAllReposBtn').href = `https://github.com/${username}?tab=repositories`;

    if (repos.length === 0) {
        reposGrid.innerHTML = '<p style="color:var(--text-muted);">No public repositories found.</p>';
        document.getElementById('viewAllReposBtn').style.display = 'none';
        return;
    } else {
        document.getElementById('viewAllReposBtn').style.display = 'inline-block';
    }

    const starIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;

    repos.forEach(repo => {
        const repoCard = document.createElement('a');
        repoCard.href = repo.html_url;
        repoCard.target = '_blank';
        repoCard.classList.add('repo-card');

        const lang = repo.language || 'Code';
        const langColor = langColors[lang] || "var(--accent)"; 

        repoCard.innerHTML = `
            <div class="repo-title">
                ${repo.name}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            </div>
            <p class="repo-desc">${repo.description || "No description provided."}</p>
            <div class="repo-meta">
                <div class="repo-lang">
                    <span class="lang-dot" style="background-color: ${langColor}"></span>
                    ${lang}
                </div>
                <div class="repo-stats">
                    ${starIcon} ${repo.stargazers_count}
                </div>
            </div>
        `;
        reposGrid.appendChild(repoCard);
    });
}

// =========================================
// Scroll to Top Logic
// =========================================
window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
        scrollTopBtn.classList.remove('hidden');
    } else {
        scrollTopBtn.classList.add('hidden');
    }
});

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// =========================================
// Init
// =========================================
renderHistory();
usernameInput.focus();

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(err => console.log('SW Failed:', err));
    });
}