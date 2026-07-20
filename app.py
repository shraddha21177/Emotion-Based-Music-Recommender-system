from flask import Flask, request, jsonify, render_template
import mysql.connector
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)

# ---------------- DATABASE ----------------
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "Shaa@20",
    "database": "music_system",
    "autocommit": False,
    "connection_timeout": 30
}

def get_db():
    """
    Returns a live MySQL connection.
    Uses ping(reconnect=True) to transparently restore a dropped/timed-out
    connection — this is the root cause of intermittent login failures.
    """
    global _db
    try:
        _db.ping(reconnect=True, attempts=3, delay=1)
    except Exception:
        # Connection object was lost entirely — create a fresh one
        _db = mysql.connector.connect(**DB_CONFIG)
    return _db

# Initialise the global connection once at startup
_db = mysql.connector.connect(**DB_CONFIG)

# ---------------- ROUTES ----------------

@app.route('/')
def home():
    return render_template("login.html")

@app.route('/register-page')
def register_page():
    return render_template("register.html")

@app.route('/emotion-page')
def emotion_page():
    return render_template("emotion.html")

@app.route('/history-page')
def history_page():
    return render_template("history.html")

@app.route('/songs-page')
def songs_page():
    return render_template("songs.html")

@app.route('/report-page')
def report_page():
    return render_template("report.html")


# ---------------- GET USER INFO ----------------
@app.route('/get_user')
def get_user():
    try:
        user_id = request.args.get('user_id', None)
        if not user_id:
            return jsonify({"status": "fail", "message": "Missing user_id"})

        db = get_db()
        cursor = db.cursor(dictionary=True)
        try:
            cursor.execute("SELECT id, name, email FROM users WHERE id = %s", (user_id,))
            user = cursor.fetchone()
        finally:
            cursor.close()

        if user:
            return jsonify({"status": "success", "user_id": user["id"],
                            "user_name": user["name"], "user_email": user["email"]})
        return jsonify({"status": "fail", "message": "User not found"})

    except Exception as e:
        print("GET_USER ERROR:", e)
        return jsonify({"status": "fail", "message": str(e)})


# ---------------- REGISTER API ----------------
@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()

        name     = data.get("name")
        email    = data.get("email")
        password = data.get("password")

        db = get_db()
        cursor = db.cursor()
        try:
            query = "INSERT INTO users (name, email, password) VALUES (%s, %s, %s)"
            cursor.execute(query, (name, email, password))
            db.commit()
        finally:
            cursor.close()

        return jsonify({"status": "success"})

    except Exception as e:
        print("ERROR:", e)
        return jsonify({"status": "fail", "message": str(e)})


# ---------------- LOGIN API ----------------
@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()

        email    = data.get("email", "").strip()
        password = data.get("password", "").strip()

        db = get_db()
        cursor = db.cursor(dictionary=True)
        try:
            query = "SELECT * FROM users WHERE email=%s AND password=%s"
            cursor.execute(query, (email, password))
            user = cursor.fetchone()
        finally:
            cursor.close()

        if user:
            return jsonify({
                "status": "success",
                "user_id": user["id"],
                "user_name": user["name"],
                "user_email": user["email"]
            })
        else:
            return jsonify({"status": "fail", "message": "Invalid email or password"})

    except Exception as e:
        print("LOGIN ERROR:", e)
        return jsonify({"status": "fail", "message": "Database error, please try again"})


# ---------------- SAVE TO HISTORY ----------------
@app.route('/save_history', methods=['POST'])
def save_history():
    try:
        data = request.get_json()
        emotion   = data.get("emotion")
        user_id   = data.get("user_id", 0)
        user_name = data.get("user_name", "Guest")
        song_title = data.get("song_title", "")
        played_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        db = get_db()
        cursor = db.cursor()
        try:
            query = """
                INSERT INTO history (emotion, time, user_id, user_name, song_title)
                VALUES (%s, %s, %s, %s, %s)
            """
            cursor.execute(query, (emotion, played_at, user_id, user_name, song_title))
            db.commit()
        finally:
            cursor.close()

        return jsonify({"message": "Saved successfully!"})

    except Exception as e:
        print("ERROR:", e)
        return jsonify({"message": "Error saving history"})


# ---------------- GET SONGS BY EMOTION ----------------
@app.route('/get_songs')
def get_songs():
    try:
        emotion = request.args.get('emotion', '')
        db = get_db()
        cursor = db.cursor(dictionary=True)
        try:
            cursor.execute(
                "SELECT id, title, artist, emotion, file_path FROM songs WHERE LOWER(emotion) = LOWER(%s)",
                (emotion,)
            )
            songs = cursor.fetchall()
        finally:
            cursor.close()
        return jsonify(songs)
    except Exception as e:
        print("ERROR:", e)
        return jsonify([])


# ---------------- UPDATE SONG ----------------
@app.route('/update_song', methods=['POST'])
def update_song():
    try:
        data = request.get_json()
        song_id  = data.get("id")
        title    = data.get("title", "").strip()
        artist   = data.get("artist", "").strip()
        emotion  = data.get("emotion", "").strip()
        new_link = data.get("file_path", "").strip()

        if not song_id or not title or not artist or not emotion or not new_link:
            return jsonify({"status": "fail", "message": "All fields are required"})

        db = get_db()
        cursor = db.cursor()
        try:
            cursor.execute(
                "UPDATE songs SET title = %s, artist = %s, emotion = %s, file_path = %s WHERE id = %s",
                (title, artist, emotion, new_link, song_id)
            )
            db.commit()
            affected = cursor.rowcount
        finally:
            cursor.close()

        if affected == 0:
            return jsonify({"status": "fail", "message": "Song not found or no changes made"})

        return jsonify({"status": "success", "message": "Song updated successfully!"})

    except Exception as e:
        print("ERROR:", e)
        return jsonify({"status": "fail", "message": str(e)})


# ---------------- ADD NEW SONG ----------------
@app.route('/add_song', methods=['POST'])
def add_song():
    try:
        data = request.get_json()
        title     = data.get("title", "").strip()
        artist    = data.get("artist", "").strip()
        emotion   = data.get("emotion", "").strip()
        file_path = data.get("file_path", "").strip()

        if not title or not artist or not emotion or not file_path:
            return jsonify({"status": "fail", "message": "All fields are required"})

        db = get_db()
        cursor = db.cursor()
        try:
            query = "INSERT INTO songs (title, artist, emotion, file_path) VALUES (%s, %s, %s, %s)"
            cursor.execute(query, (title, artist, emotion, file_path))
            db.commit()
        finally:
            cursor.close()

        return jsonify({"status": "success", "message": "Song added successfully!"})

    except Exception as e:
        print("ERROR:", e)
        return jsonify({"status": "fail", "message": str(e)})


# ---------------- DELETE SONG ----------------
@app.route('/delete_song', methods=['POST'])
def delete_song():
    try:
        data = request.get_json()
        song_id = data.get("id")

        if not song_id:
            return jsonify({"status": "fail", "message": "Missing song id"})

        db = get_db()
        cursor = db.cursor()
        try:
            cursor.execute("DELETE FROM songs WHERE id = %s", (song_id,))
            db.commit()
            affected = cursor.rowcount
        finally:
            cursor.close()

        if affected == 0:
            return jsonify({"status": "fail", "message": "Song not found"})

        return jsonify({"status": "success", "message": "Song deleted successfully!"})

    except Exception as e:
        print("ERROR:", e)
        return jsonify({"status": "fail", "message": str(e)})


# ---------------- GET HISTORY ----------------
@app.route('/get_history')
def get_history():
    try:
        user_id = request.args.get('user_id', None)
        db = get_db()
        cursor = db.cursor(dictionary=True)
        try:
            if user_id:
                cursor.execute(
                    "SELECT emotion, time, song_title FROM history WHERE user_id=%s ORDER BY id DESC",
                    (user_id,)
                )
            else:
                cursor.execute("SELECT emotion, time, song_title FROM history ORDER BY id DESC")
            data = cursor.fetchall()
        finally:
            cursor.close()
        return jsonify(data)

    except Exception as e:
        print("ERROR:", e)
        return jsonify([])


# ---------------- GET REPORT (USER-WISE) ----------------
@app.route('/get_report')
def get_report():
    try:
        user_id = request.args.get('user_id', None)
        month   = request.args.get('month', None)   # format: YYYY-MM  (optional)

        db = get_db()
        cursor = db.cursor(dictionary=True)

        base_filter = "WHERE user_id = %s" if user_id else "WHERE 1=1"
        params      = [user_id] if user_id else []

        if month:
            base_filter += " AND DATE_FORMAT(time, '%Y-%m') = %s"
            params.append(month)

        try:
            # All detail rows
            cursor.execute(
                f"SELECT emotion, song_title, time FROM history {base_filter} ORDER BY time DESC",
                params
            )
            rows = cursor.fetchall()

            # Emotion summary
            cursor.execute(
                f"SELECT emotion, COUNT(*) AS count FROM history {base_filter} GROUP BY emotion ORDER BY count DESC",
                params
            )
            emotion_summary = cursor.fetchall()

            # Daily summary
            cursor.execute(
                f"SELECT DATE(time) AS date, COUNT(*) AS count FROM history {base_filter} GROUP BY DATE(time) ORDER BY date DESC",
                params
            )
            daily_summary = cursor.fetchall()

            # Monthly summary
            cursor.execute(
                f"SELECT DATE_FORMAT(time, '%Y-%m') AS month, COUNT(*) AS count FROM history {base_filter} GROUP BY month ORDER BY month DESC",
                params
            )
            monthly_summary = cursor.fetchall()

        finally:
            cursor.close()

        # Convert date objects to strings for JSON
        for r in rows:
            if r.get('time') and not isinstance(r['time'], str):
                r['time'] = str(r['time'])
        for d in daily_summary:
            if d.get('date') and not isinstance(d['date'], str):
                d['date'] = str(d['date'])

        return jsonify({
            "rows": rows,
            "emotion_summary": emotion_summary,
            "daily_summary": daily_summary,
            "monthly_summary": monthly_summary
        })

    except Exception as e:
        print("REPORT ERROR:", e)
        return jsonify({"rows": [], "emotion_summary": [], "daily_summary": [], "monthly_summary": []})


# ---------------- RUN ----------------
if __name__ == "__main__":
    print("SERVER STARTED")
    app.run(debug=True)