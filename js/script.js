/* =========================================
   TECHSPACE BLOG APPLICATION
   Full-Stack Frontend JavaScript
   Backend: Node.js + Express + SQLite
========================================= */


/* =========================================
   API CONFIGURATION
========================================= */

const API_URL = "http://localhost:5000/api";


/* =========================================
   AUTHENTICATION HELPERS
========================================= */

// Get the saved authentication token.
function getToken() {
    return localStorage.getItem("techspaceToken");
}


// Save authentication token.
function saveToken(token) {
    localStorage.setItem("techspaceToken", token);
}


// Remove authentication token and user information.
function clearAuthentication() {
    localStorage.removeItem("techspaceToken");
    localStorage.removeItem("techspaceCurrentUser");
}


// Get the currently logged-in user.
function getCurrentUser() {
    return JSON.parse(localStorage.getItem("techspaceCurrentUser"));
}


// Save the current user's public information.
function saveCurrentUser(user) {
    localStorage.setItem("techspaceCurrentUser", JSON.stringify(user));
}


/* =========================================
   API REQUEST HELPER
========================================= */

async function apiRequest(endpoint, options = {}) {

    const headers = {
        "Content-Type": "application/json",
        ...options.headers
    };

    const token = getToken();

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    try {

        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers
        });

        const data = await response.json();

        if (!response.ok) {

            if (response.status === 401 || response.status === 403) {
                clearAuthentication();
            }

            throw new Error(data.message || "Something went wrong.");

        }

        return data;

    } catch (error) {

        if (error instanceof TypeError) {
            throw new Error(
                "Unable to connect to the server. Please check your internet connection or backend server."
            );
        }

        throw error;

    }

}


/* =========================================
   GENERAL PAGE FUNCTIONS
========================================= */

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

    // Run page-specific functions.
    updateNavigation();
    handleRegistration();
    handleLogin();
    handleLogout();
    handleDashboard();
    handleBlogForm();
    displayHomeArticles();

});


/* =========================================
   NAVIGATION
========================================= */

function updateNavigation() {

    const token = getToken();

    const loginNav = document.getElementById("loginNav");
    const registerNav = document.getElementById("registerNav");
    const dashboardNav = document.getElementById("dashboardNav");
    const logoutNav = document.getElementById("logoutNav");

    if (token) {

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


/* =========================================
   MESSAGE DISPLAY
========================================= */

function showMessage(element, message, type) {

    if (!element) return;

    element.textContent = message;
    element.className = "form-message " + type;

}


/* =========================================
   DATE FORMATTING
========================================= */

function formatDate(date) {

    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });

}


/* =========================================
   BASIC HTML ESCAPING
========================================= */

function escapeHTML(value) {

    return String(value ?? "").replace(/[&<>"']/g, function (character) {

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


/* =========================================
   USER REGISTRATION
========================================= */

function handleRegistration() {

    const form = document.getElementById("registerForm");

    if (!form) return;

    form.addEventListener("submit", async function (event) {

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

        if (password.length < 8) {
            showMessage(message, "Password must contain at least 8 characters.", "error");
            return;
        }

        try {

            showMessage(message, "Creating your account...", "success");

            const data = await apiRequest("/auth/register", {
                method: "POST",
                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password
                })
            });

            showMessage(
                message,
                data.message + " Redirecting to login...",
                "success"
            );

            form.reset();

            setTimeout(function () {
                window.location.href = "login.html";
            }, 1500);

        } catch (error) {

            showMessage(message, error.message, "error");

        }

    });

}


/* =========================================
   USER LOGIN
========================================= */

function handleLogin() {

    const form = document.getElementById("loginForm");

    if (!form) return;

    form.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim().toLowerCase();
        const password = document.getElementById("loginPassword").value;

        const message = document.getElementById("loginMessage");

        try {

            showMessage(message, "Logging in...", "success");

            const data = await apiRequest("/auth/login", {
                method: "POST",
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            // Save authentication token.
            saveToken(data.token);

            // Save public user information.
            saveCurrentUser(data.user);

            showMessage(
                message,
                "Login successful! Redirecting to dashboard...",
                "success"
            );

            setTimeout(function () {
                window.location.href = "dashboard.html";
            }, 1000);

        } catch (error) {

            showMessage(message, error.message, "error");

        }

    });

}


/* =========================================
   LOGOUT
========================================= */

function handleLogout() {

    const logoutButtons = document.querySelectorAll(
        "#logoutButton, #logoutNav"
    );

    logoutButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            clearAuthentication();

            window.location.href = "index.html";

        });

    });

}


/* =========================================
   PROTECT PRIVATE PAGES
========================================= */

async function requireLogin() {

    const token = getToken();

    if (!token) {
        window.location.href = "login.html";
        return null;
    }

    try {

        const data = await apiRequest("/auth/me");

        saveCurrentUser(data.user);

        return data.user;

    } catch (error) {

        clearAuthentication();

        window.location.href = "login.html";

        return null;

    }

}


/* =========================================
   DASHBOARD
========================================= */

async function handleDashboard() {

    const dashboardContainer = document.getElementById("dashboardArticles");

    if (!dashboardContainer) return;

    const user = await requireLogin();

    if (!user) return;

    const dashboardUser = document.getElementById("dashboardUser");

    if (dashboardUser) {
        dashboardUser.textContent = user.name;
    }

    await displayDashboardArticles();

}


/* =========================================
   DISPLAY DASHBOARD ARTICLES
========================================= */

async function displayDashboardArticles() {

    const container = document.getElementById("dashboardArticles");

    if (!container) return;

    try {

        container.innerHTML = "<p>Loading your articles...</p>";

        const data = await apiRequest("/blogs/my-blogs");

        const articles = data.blogs || [];

        const published = articles.filter(function (article) {
            return article.status === "published";
        });

        const drafts = articles.filter(function (article) {
            return article.status === "draft";
        });

        document.getElementById("totalArticles").textContent = articles.length;

        document.getElementById("publishedArticles").textContent = published.length;

        document.getElementById("draftArticles").textContent = drafts.length;


        if (articles.length === 0) {

            container.innerHTML = `
                <div class="empty-state">
                    <h3>No articles yet</h3>

                    <p>
                        You have not created any articles.
                        Start sharing your ideas today.
                    </p>

                    <br>

                    <a href="create-blog.html" class="btn btn-primary">
                        Create Your First Article
                    </a>
                </div>
            `;

            return;

        }


        container.innerHTML = articles.map(function (article) {

            const statusClass = article.status === "draft" ? "draft" : "";

            return `
                <div class="dashboard-article">

                    <div>

                        <h3>${escapeHTML(article.title)}</h3>

                        <p>
                            ${escapeHTML(article.category)}
                            • ${formatDate(article.created_at)}
                        </p>

                        <span class="article-status ${statusClass}">
                            ${article.status === "published" ? "Published" : "Draft"}
                        </span>

                    </div>

                    <div class="article-actions">

                        <button
                            class="small-button edit-button"
                            onclick="editArticle(${Number(article.id)})">
                            Edit
                        </button>

                        <button
                            class="small-button delete-button"
                            onclick="deleteArticle(${Number(article.id)})">
                            Delete
                        </button>

                    </div>

                </div>
            `;

        }).join("");

    } catch (error) {

        container.innerHTML = `
            <div class="empty-state">
                <p>${escapeHTML(error.message)}</p>
                <button class="btn btn-primary" onclick="displayDashboardArticles()">
                    Try Again
                </button>
            </div>
        `;

    }

}


/* =========================================
   CREATE AND EDIT ARTICLES
========================================= */

async function handleBlogForm() {

    const form = document.getElementById("blogForm");

    if (!form) return;

    const user = await requireLogin();

    if (!user) return;

    const params = new URLSearchParams(window.location.search);
    const editId = params.get("edit");

    let existingArticle = null;

    const message = document.getElementById("blogMessage");


    // Load existing article when editing.
    if (editId) {

        try {

            const data = await apiRequest("/blogs/my-blogs");

            const articles = data.blogs || [];

            existingArticle = articles.find(function (article) {
                return String(article.id) === String(editId);
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

            document.getElementById("blogExcerpt").value = existingArticle.excerpt || "";

            document.getElementById("blogContent").value = existingArticle.content;

        } catch (error) {

            showMessage(message, error.message, "error");

            return;

        }

    }


    // Submit article form.
    form.addEventListener("submit", async function (event) {

        event.preventDefault();

        const title = document.getElementById("blogTitle").value.trim();

        const category = document.getElementById("blogCategory").value;

        const image = document.getElementById("blogImage").value.trim();

        const excerpt = document.getElementById("blogExcerpt").value.trim();

        const content = document.getElementById("blogContent").value.trim();

        const submitter = event.submitter;

        const action = submitter ? submitter.value : "publish";

        const status = action === "draft" ? "draft" : "published";


        if (!title || !category || !excerpt || !content) {

            showMessage(message, "Please complete all required fields.", "error");

            return;

        }


        const articleData = {
            title: title,
            category: category,
            image: image,
            excerpt: excerpt,
            content: content,
            status: status
        };


        try {

            showMessage(message, "Saving your article...", "success");

            if (existingArticle) {

                // Update existing article.
                await apiRequest(`/blogs/${existingArticle.id}`, {
                    method: "PUT",
                    body: JSON.stringify(articleData)
                });

            } else {

                // Create new article.
                await apiRequest("/blogs", {
                    method: "POST",
                    body: JSON.stringify(articleData)
                });

            }


            showMessage(
                message,
                status === "published"
                    ? "Article published successfully!"
                    : "Draft saved successfully!",
                "success"
            );

            form.reset();

            setTimeout(function () {
                window.location.href = "dashboard.html";
            }, 1000);

        } catch (error) {

            showMessage(message, error.message, "error");

        }

    });

}


/* =========================================
   EDIT ARTICLE
========================================= */

function editArticle(id) {

    window.location.href = "create-blog.html?edit=" + encodeURIComponent(id);

}


/* =========================================
   DELETE ARTICLE
========================================= */

async function deleteArticle(id) {

    if (!getToken()) {

        window.location.href = "login.html";

        return;

    }


    const confirmDelete = confirm(
        "Are you sure you want to delete this article?"
    );

    if (!confirmDelete) return;


    try {

        await apiRequest(`/blogs/${id}`, {
            method: "DELETE"
        });

        await displayDashboardArticles();

    } catch (error) {

        alert(error.message);

    }

}


/* =========================================
   DISPLAY ARTICLES ON HOMEPAGE
========================================= */

async function displayHomeArticles() {

    const container = document.getElementById("homeArticles");

    if (!container) return;

    try {

        const data = await apiRequest("/blogs");

        const articles = data.blogs || [];

        if (articles.length === 0) return;


        const userArticleHTML = articles.map(function (article) {

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

                        <p>${escapeHTML(article.excerpt || "")}</p>

                        <span class="article-meta">
                            By ${escapeHTML(article.author_name || "TechSpace Author")}
                            • ${formatDate(article.created_at)}
                        </span>

                    </div>

                </article>
            `;

        }).join("");


        // Display database articles before existing sample articles.
        container.insertAdjacentHTML("afterbegin", userArticleHTML);

    } catch (error) {

        console.error("Unable to load articles:", error.message);

    }

}
