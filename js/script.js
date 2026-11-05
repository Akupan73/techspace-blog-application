/* =================================
   TECHSPACE BLOG APPLICATION
   Vanilla JavaScript
================================= */


/* =================================
   LOCAL STORAGE HELPERS
================================= */

function getUsers() {
    return JSON.parse(localStorage.getItem("techspaceUsers")) || [];
}

function getArticles() {
    return JSON.parse(localStorage.getItem("techspaceArticles")) || [];
}

function saveUsers(users) {
    localStorage.setItem("techspaceUsers", JSON.stringify(users));
}

function saveArticles(articles) {
    localStorage.setItem("techspaceArticles", JSON.stringify(articles));
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem("techspaceCurrentUser"));
}


/* =================================
   GENERAL PAGE FUNCTIONS
================================= */

document.addEventListener("DOMContentLoaded", function () {

    // Automatically display the current year.
    document.querySelectorAll(".current-year").forEach(function (element) {
        element.textContent = new Date().getFullYear();
    });

    // Mobile navigation menu.
    const menuToggle = document.getElementById("menuToggle");
    const navLinks = document.getElementById("navLinks");

    if (menuToggle && navLinks) {
        menuToggle.addEventListener("click", function () {
            navLinks.classList.toggle("open");
        });
    }

    // Update navigation depending on login status.
    updateNavigation();

    // Run page-specific functions.
    handleRegistration();
    handleLogin();
    handleLogout();
    handleDashboard();
    handleBlogForm();
    displayHomeArticles();

});


/* =================================
   NAVIGATION
================================= */

function updateNavigation() {

    const user = getCurrentUser();

    const loginNav = document.getElementById("loginNav");
    const registerNav = document.getElementById("registerNav");
    const dashboardNav = document.getElementById("dashboardNav");
    const logoutNav = document.getElementById("logoutNav");

    if (user) {
        if (loginNav) loginNav.hidden = true;
        if (registerNav) registerNav.hidden = true;
        if (dashboardNav) dashboardNav.hidden = false;
        if (logoutNav) logoutNav.hidden = false;
    } else {
        if (loginNav) loginNav.hidden = false;
        if (registerNav) registerNav.hidden = false;
        if (dashboardNav) dashboardNav.hidden = true;
        if (logoutNav) logoutNav.hidden = true;
    }
}


/* =================================
   USER REGISTRATION
================================= */

function handleRegistration() {

    const form = document.getElementById("registerForm");

    if (!form) return;

    form.addEventListener("submit", function (event) {

        event.preventDefault();

        const name = document.getElementById("registerName").value.trim();
        const email = document.getElementById("registerEmail").value.trim().toLowerCase();
        const password = document.getElementById("registerPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        const message = document.getElementById("registerMessage");

        if (password !== confirmPassword) {
            showMessage(message, "Passwords do not match.", "error");
            return;
        }

        if (password.length < 6) {
            showMessage(message, "Password must contain at least 6 characters.", "error");
            return;
        }

        const users = getUsers();

        const existingUser = users.find(function (user) {
            return user.email === email;
        });

        if (existingUser) {
            showMessage(message, "An account with this email already exists.", "error");
            return;
        }

        const newUser = {
            id: Date.now().toString(),
            name: name,
            email: email,
            password: password
        };

        users.push(newUser);
        saveUsers(users);

        showMessage(message, "Account created successfully! Redirecting to login...", "success");

        form.reset();

        setTimeout(function () {
            window.location.href = "login.html";
        }, 1500);

    });

}


/* =================================
   USER LOGIN
================================= */

function handleLogin() {

    const form = document.getElementById("loginForm");

    if (!form) return;

    form.addEventListener("submit", function (event) {

        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim().toLowerCase();
        const password = document.getElementById("loginPassword").value;

        const message = document.getElementById("loginMessage");

        const users = getUsers();

        const user = users.find(function (item) {
            return item.email === email && item.password === password;
        });

        if (!user) {
            showMessage(message, "Invalid email address or password.", "error");
            return;
        }

        const loggedInUser = {
            id: user.id,
            name: user.name,
            email: user.email
        };

        localStorage.setItem("techspaceCurrentUser", JSON.stringify(loggedInUser));

        showMessage(message, "Login successful! Redirecting to dashboard...", "success");

        setTimeout(function () {
            window.location.href = "dashboard.html";
        }, 1000);

    });

}


/* =================================
   LOGOUT
================================= */

function handleLogout() {

    const logoutButtons = document.querySelectorAll(
        "#logoutButton, #logoutNav"
    );

    logoutButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            localStorage.removeItem("techspaceCurrentUser");

            window.location.href = "index.html";

        });

    });

}


/* =================================
   PROTECT PRIVATE PAGES
================================= */

function requireLogin() {

    const user = getCurrentUser();

    if (!user) {
        window.location.href = "login.html";
        return null;
    }

    return user;
}


/* =================================
   DASHBOARD
================================= */

function handleDashboard() {

    const dashboardContainer = document.getElementById("dashboardArticles");

    if (!dashboardContainer) return;

    const user = requireLogin();

    if (!user) return;

    const dashboardUser = document.getElementById("dashboardUser");

    if (dashboardUser) {
        dashboardUser.textContent = user.name;
    }

    displayDashboardArticles(user);

}


function displayDashboardArticles(user) {

    const container = document.getElementById("dashboardArticles");

    if (!container) return;

    const articles = getArticles();

    const userArticles = articles.filter(function (article) {
        return article.authorId === user.id;
    });

    const published = userArticles.filter(function (article) {
        return article.status === "published";
    });

    const drafts = userArticles.filter(function (article) {
        return article.status === "draft";
    });

    document.getElementById("totalArticles").textContent = userArticles.length;
    document.getElementById("publishedArticles").textContent = published.length;
    document.getElementById("draftArticles").textContent = drafts.length;

    if (userArticles.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                <h3>No articles yet</h3>
                <p>You have not created any articles. Start sharing your ideas today.</p>
                <br>
                <a href="create-blog.html" class="btn btn-primary">
                    Create Your First Article
                </a>
            </div>
        `;

        return;
    }

    container.innerHTML = userArticles.map(function (article) {

        const statusClass = article.status === "draft" ? "draft" : "";

        return `
            <div class="dashboard-article">

                <div>
                    <h3>${escapeHTML(article.title)}</h3>

                    <p>
                        ${escapeHTML(article.category)}
                        • ${formatDate(article.date)}
                    </p>

                    <span class="article-status ${statusClass}">
                        ${article.status === "published" ? "Published" : "Draft"}
                    </span>
                </div>

                <div class="article-actions">

                    <button
                        class="small-button edit-button"
                        onclick="editArticle('${article.id}')">
                        Edit
                    </button>

                    <button
                        class="small-button delete-button"
                        onclick="deleteArticle('${article.id}')">
                        Delete
                    </button>

                </div>

            </div>
        `;

    }).join("");

}


/* =================================
   CREATE AND EDIT ARTICLES
================================= */

function handleBlogForm() {

    const form = document.getElementById("blogForm");

    if (!form) return;

    const user = requireLogin();

    if (!user) return;

    const params = new URLSearchParams(window.location.search);
    const editId = params.get("edit");

    let existingArticle = null;

    if (editId) {

        const articles = getArticles();

        existingArticle = articles.find(function (article) {
            return article.id === editId && article.authorId === user.id;
        });

        if (!existingArticle) {
            alert("Article not found.");
            window.location.href = "dashboard.html";
            return;
        }

        document.getElementById("editorTitle").textContent = "Edit Article";

        document.getElementById("blogTitle").value = existingArticle.title;
        document.getElementById("blogCategory").value = existingArticle.category;
        document.getElementById("blogImage").value = existingArticle.image || "";
        document.getElementById("blogExcerpt").value = existingArticle.excerpt;
        document.getElementById("blogContent").value = existingArticle.content;

    }

    form.addEventListener("submit", function (event) {

        event.preventDefault();

        const title = document.getElementById("blogTitle").value.trim();
        const category = document.getElementById("blogCategory").value;
        const image = document.getElementById("blogImage").value.trim();
        const excerpt = document.getElementById("blogExcerpt").value.trim();
        const content = document.getElementById("blogContent").value.trim();

        const message = document.getElementById("blogMessage");

        const submitter = event.submitter;
        const action = submitter ? submitter.value : "publish";

        if (!title || !category || !excerpt || !content) {
            showMessage(message, "Please complete all required fields.", "error");
            return;
        }

        const articles = getArticles();

        const status = action === "draft" ? "draft" : "published";

        if (existingArticle) {

            const articleIndex = articles.findIndex(function (article) {
                return article.id === existingArticle.id &&
                       article.authorId === user.id;
            });

            if (articleIndex === -1) {
                showMessage(message, "Article could not be found.", "error");
                return;
            }

            articles[articleIndex] = {
                ...articles[articleIndex],
                title: title,
                category: category,
                image: image,
                excerpt: excerpt,
                content: content,
                status: status,
                updatedAt: new Date().toISOString()
            };

        } else {

            const newArticle = {
                id: Date.now().toString(),
                authorId: user.id,
                author: user.name,
                title: title,
                category: category,
                image: image,
                excerpt: excerpt,
                content: content,
                status: status,
                date: new Date().toISOString()
            };

            articles.unshift(newArticle);

        }

        saveArticles(articles);

        showMessage(
            message,
            status === "published" ? "Article published successfully!" : "Draft saved successfully!",
            "success"
        );

        setTimeout(function () {
            window.location.href = "dashboard.html";
        }, 1000);

    });

}


/* =================================
   EDIT ARTICLE
================================= */

function editArticle(id) {

    window.location.href = "create-blog.html?edit=" + encodeURIComponent(id);

}


/* =================================
   DELETE ARTICLE
================================= */

function deleteArticle(id) {

    const user = getCurrentUser();

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const confirmDelete = confirm("Are you sure you want to delete this article?");

    if (!confirmDelete) return;

    const articles = getArticles();

    const updatedArticles = articles.filter(function (article) {

        return !(article.id === id && article.authorId === user.id);

    });

    saveArticles(updatedArticles);

    displayDashboardArticles(user);

}


/* =================================
   DISPLAY ARTICLES ON HOMEPAGE
================================= */

function displayHomeArticles() {

    const container = document.getElementById("homeArticles");

    if (!container) return;

    const articles = getArticles();

    const publishedArticles = articles.filter(function (article) {
        return article.status === "published";
    });

    if (publishedArticles.length === 0) return;

    const userArticleHTML = publishedArticles.map(function (article) {

        const image = article.image ||
            "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=85";

        return `
            <article class="article-card">

                <img
                    src="${escapeHTML(image)}"
                    alt="${escapeHTML(article.title)}"
                    onerror="this.src='https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=85'"
                >

                <div class="article-content">

                    <span class="category-tag">
                        ${escapeHTML(article.category)}
                    </span>

                    <h3>${escapeHTML(article.title)}</h3>

                    <p>${escapeHTML(article.excerpt)}</p>

                    <span class="article-meta">
                        By ${escapeHTML(article.author)} • ${formatDate(article.date)}
                    </span>

                </div>

            </article>
        `;

    }).join("");

    container.insertAdjacentHTML("afterbegin", userArticleHTML);

}


/* =================================
   MESSAGE DISPLAY
================================= */

function showMessage(element, message, type) {

    if (!element) return;

    element.textContent = message;
    element.className = "form-message " + type;

}


/* =================================
   DATE FORMATTING
================================= */

function formatDate(date) {

    return new Date(date).toLocaleDateString("en", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });

}


/* =================================
   BASIC HTML ESCAPING
================================= */

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, function (character) {

        const characters = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return characters[character];

    });

}