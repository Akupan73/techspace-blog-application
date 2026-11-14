TechSpace – Full-Stack Technology Blog Application

TechSpace is a responsive full-stack technology blog application developed to allow users to create, publish, edit and manage technology-related articles.

The application combines a modern frontend with a Node.js and Express.js backend, SQLite database and JWT-based authentication.

Features

- User registration and secure login
- Password hashing using bcryptjs
- JWT-based authentication
- Personal user dashboard
- Create and publish blog articles
- Save articles as drafts
- Edit and delete personal articles
- Display published articles on the homepage
- Separate published and draft articles
- RESTful API integration
- Persistent data storage using SQLite
- Responsive user interface

Technologies Used

Frontend

- HTML5
- CSS3
- Vanilla JavaScript
- Fetch API

Backend

- Node.js
- Express.js
- REST APIs
- JSON Web Tokens (JWT)
- bcryptjs

Database

- SQLite
- better-sqlite3

Development Tools

- Kali Linux
- Git
- GitHub
- npm

Project Structure

blog-application/
│
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── blogRoutes.js
│   ├── index.js
│   ├── package.json
│   └── package-lock.json
│
├── css/
│   └── style.css
│
├── js/
│   └── script.js
│
├── images/
│
├── index.html
├── login.html
├── register.html
├── dashboard.html
├── create-blog.html
└── README.md

Installation and Setup

1. Clone the Repository

git clone git@github.com:Akupan73/techspace-blog-application.git

2. Enter the Project Directory

cd techspace-blog-application

3. Install Backend Dependencies

cd backend
npm install

4. Configure Environment Variables

Create a ".env" file inside the backend directory.

Add:

PORT=5000
JWT_SECRET=replace_with_a_strong_random_secret
JWT_EXPIRES_IN=1d

Use a strong, private JWT secret. Never upload your actual ".env" file to GitHub.

5. Start the Backend Server

From the backend directory, run:

npm run dev

The backend API will run at:

http://localhost:5000

6. Start the Frontend

Open another terminal, navigate to the main project directory and run:

python3 -m http.server 5501

Open the application in your browser:

http://localhost:5501

Keep both servers running while using the application.

API Endpoints

Authentication

Method| Endpoint| Description
POST| "/api/auth/register"| Register a new user
POST| "/api/auth/login"| Authenticate a user
GET| "/api/auth/me"| Retrieve authenticated user profile

Blog Management

Method| Endpoint| Description
GET| "/api/blogs"| Retrieve published articles
GET| "/api/blogs/my-blogs"| Retrieve personal articles
GET| "/api/blogs/:id"| Retrieve a published article
POST| "/api/blogs"| Create a new article
PUT| "/api/blogs/:id"| Update an article
DELETE| "/api/blogs/:id"| Delete an article

Protected endpoints require a valid JWT Bearer token.

Database

TechSpace uses SQLite for persistent data storage.

The database contains two main tables:

- Users: Stores user account information.
- Blogs: Stores article details, author information, publication status and timestamps.

The database tables are automatically initialized when the backend starts.

Security Features

- Password hashing with bcryptjs.
- JWT-based authentication.
- Protected API routes.
- User ownership verification for article updates and deletion.
- Environment variables for sensitive configuration.
- Git ignore rules for private files and database files.

Developer

Akupan Desmond Ekwen

GitHub: Akupan73

Internship

Developed as part of the Codomax Digital Solutions Internship Program – Module 02: Backend Development.

Project Purpose

The purpose of TechSpace is to demonstrate practical full-stack web development skills, including frontend development, backend programming, REST API creation, database integration and user authentication.
