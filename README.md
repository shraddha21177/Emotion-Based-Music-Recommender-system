# Emotion Music App

## Overview
The **Emotion Music App** is a full-stack web application designed to recommend songs based on a user's selected emotion, track their mood history, and provide a comprehensive interface to manage the song catalog. The application is built using a Python Flask backend, a MySQL database, and a dynamic frontend powered by HTML, CSS, and JavaScript.

## Features Implemented From Scratch

### 1. Initial Setup & Backend Configuration
- **Flask Application (`app.py`)**: Designed the core web server, enabling Cross-Origin Resource Sharing (CORS) and configuring robust API endpoints.
- **Database Integration**: Connected the app to a MySQL database (`music_system`) to persistently store users, mood history, and song metadata.
- **Page Routing**: Implemented clean URL routes serving individual HTML pages (`/`, `/register-page`, `/emotion-page`, `/history-page`, `/songs-page`).

### 2. User Authentication
- **Registration (`/register`)**: API endpoint allowing new users to sign up by securely saving their name, email, and password.
- **Login (`/login`)**: API endpoint authenticating users against database records and granting them access to the platform.

### 3. Emotion Selection & Tracking
- **Emotion Hub**: Developed a visually engaging page where users can select their current mood (e.g., Happy, Sad, Angry).
- **History Tracking (`/save_history`, `/get_history`)**: Whenever an emotion is selected, the app saves it with a timestamp. The History page fetches this data chronologically to show a user's mood progression over time.

### 4. Dynamic Song Management (CRUD Operations)
- **Fetching Songs (`/get_songs`)**: Dynamically queries the database to present songs that match the user's specific emotion.
- **Adding Songs (`/add_song`)**: A user-friendly modal form allowing administrators/users to expand the database with new songs (Title, Artist, Emotion, File URL).
- **Updating/Editing Songs (`/update_song`)**: Replaced basic interactions with an advanced "Edit" modal. This allows modifying all attributes of a song seamlessly without reloading the page.
- **Deleting Songs (`/delete_song`)**: Feature to remove outdated or incorrect songs from the database with immediate UI updates.

### 5. UI/UX & Visual Aesthetics
- **Modern Design**: Implemented a responsive, music-themed interface using external CSS (glassmorphism, vibrant gradients, and dynamic backgrounds).
- **Bug Fixes & Scroll Management**: Addressed list overflow bugs by ensuring the song catalog is nicely scrollable, while the overall layout remains locked to the viewport.

---

## File Structure & Explanations

### Backend
- **`app.py`**: The heart of the application. It acts as the bridge between the frontend and the MySQL database. It handles page rendering requests and manages data logic for users, history, and songs.

### Templates (HTML)
- **`login.html` & `register.html`**: Entry points for user authentication.
- **`emotion.html`**: The main interface where users declare their mood.
- **`history.html`**: Displays the user's tracked emotion logs.
- **`songs.html`**: The core player and management view. Contains lists of recommended songs and the embedded modals for adding/editing songs.

### Static Assets (CSS & JS)
- **Stylesheets (`static/*.css`)**: Dedicated CSS files (`login.css`, `songs.css`, etc.) for each page ensuring modular design, clean aesthetics, and visual consistency.
- **Scripts (`static/*.js`)**: Client-side logic for each page. They handle button clicks, form submissions, DOM updates (like populating tables/lists), and asynchronous `fetch` requests to the Flask APIs without refreshing the browser.

### Database Schema (MySQL Context)
- **`users` Table**: Stores user credentials.
- **`history` Table**: Stores tracked emotions and their respective timestamps.
- **`songs` Table**: Stores the song catalog including `title`, `artist`, `emotion` category, and `file_path` (link).
