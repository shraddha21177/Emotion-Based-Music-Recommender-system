// Get the selected emotion from localStorage
let emotion = localStorage.getItem("emotion") || "";

// Show current mood as subtitle
document.getElementById("moodLabel").innerText = "Mood: " + emotion;

// Fetch songs from Flask API based on emotion
fetch("/get_songs?emotion=" + encodeURIComponent(emotion))
    .then(res => res.json())
    .then(songs => {

        let output = "";

        if (songs.length === 0) {
            output = `<p class="empty-msg">No songs found for "<strong>${emotion}</strong>".<br>Please add songs to the database.</p>`;
        } else {
            songs.forEach(song => {
                output += `
                    <div class="song-card">
                        <div class="song-info">
                            <div class="title">🎵 ${song.title}</div>
                            <div class="artist">🎤 ${song.artist}</div>
                        </div>
                        <div class="song-actions">
                            <a href="javascript:void(0)" class="play-btn" onclick="playSong('${song.file_path}', '${song.title.replace(/'/g, "\\'")}')">▶ Play</a>
                            <button class="edit-btn" onclick="openEditModal(${song.id}, '${song.title.replace(/'/g, "\\'")}', '${song.artist.replace(/'/g, "\\'")}', '${song.emotion}', '${song.file_path}')">✏ Edit</button>
                            <button class="delete-btn" onclick="deleteSong(${song.id})">🗑 Delete</button>
                        </div>
                    </div>
                `;
            });
        }

        document.getElementById("songsList").innerHTML = output;
    })
    .catch(err => {
        console.error(err);
        document.getElementById("songsList").innerHTML = `<p class="empty-msg">Error loading songs.</p>`;
    });


// ── Play a song & save history with song title ──────────────────────
function playSong(url, songTitle) {
    const emotion  = localStorage.getItem('emotion')  || '';
    const userId   = localStorage.getItem('user_id')  || 0;
    const userName = localStorage.getItem('user_name')|| 'Guest';

    // Save to history with song title (fire-and-forget)
    fetch('/save_history', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            emotion:    emotion,
            user_id:    userId,
            user_name:  userName,
            song_title: songTitle
        })
    }).catch(err => console.warn('History save error:', err));

    // Open the song in a new tab
    window.open(url, '_blank');
}

// ── Edit Modal helpers ──────────────────────────────────────────────
let currentSongId = null;

function openEditModal(songId, title, artist, emotion, filePath) {
    currentSongId = songId;
    document.getElementById("editTitleInput").value = title;
    document.getElementById("editArtistInput").value = artist;
    
    // Set emotion
    let emotionSelect = document.getElementById("editEmotionInput");
    let emotionExists = Array.from(emotionSelect.options).some(opt => opt.value.toLowerCase() === emotion.toLowerCase());
    if (emotionExists) {
        let matchedOption = Array.from(emotionSelect.options).find(opt => opt.value.toLowerCase() === emotion.toLowerCase());
        emotionSelect.value = matchedOption.value;
    } else {
        emotionSelect.value = "Happy";
    }

    document.getElementById("editLinkInput").value = filePath;
    document.getElementById("editModalMessage").innerText = "";
    document.getElementById("editModal").classList.add("show");
}

function closeEditModal() {
    document.getElementById("editModal").classList.remove("show");
    currentSongId = null;
}

// Close modal when clicking the dark backdrop
document.getElementById("editModal").addEventListener("click", function(e) {
    if (e.target === this) closeEditModal();
});

function submitEdit() {
    const title = document.getElementById("editTitleInput").value.trim();
    const artist = document.getElementById("editArtistInput").value.trim();
    const emotion = document.getElementById("editEmotionInput").value.trim();
    const newLink = document.getElementById("editLinkInput").value.trim();
    const msgEl   = document.getElementById("editModalMessage");

    if (!title || !artist || !emotion || !newLink) {
        msgEl.innerText = "⚠ Please fill all fields.";
        msgEl.className = "modal-msg error";
        return;
    }

    const saveBtn = document.getElementById("editSaveBtn");
    saveBtn.disabled = true;
    saveBtn.innerText = "Saving...";

    fetch("/update_song", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            id: currentSongId, 
            title: title,
            artist: artist,
            emotion: emotion,
            file_path: newLink 
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "success") {
            msgEl.innerText = "✅ Song updated successfully!";
            msgEl.className = "modal-msg success";
            setTimeout(() => {
                closeEditModal();
                location.reload();
            }, 1200);
        } else {
            msgEl.innerText = "❌ " + (data.message || "Update failed.");
            msgEl.className = "modal-msg error";
        }
    })
    .catch(err => {
        console.error(err);
        msgEl.innerText = "❌ Network error. Try again.";
        msgEl.className = "modal-msg error";
    })
    .finally(() => {
        saveBtn.disabled = false;
        saveBtn.innerText = "Save Changes";
    });
}

// ── Add Song Modal Helpers ──────────────────────────────────────────────

function openAddModal() {
    // Pre-select the current emotion if any
    let currentEmotion = localStorage.getItem("emotion") || "Happy";
    let emotionSelect = document.getElementById("addEmotionInput");
    
    // Check if the current emotion exists in the options
    let emotionExists = Array.from(emotionSelect.options).some(opt => opt.value.toLowerCase() === currentEmotion.toLowerCase());
    
    if (emotionExists) {
        // Find exact casing
        let matchedOption = Array.from(emotionSelect.options).find(opt => opt.value.toLowerCase() === currentEmotion.toLowerCase());
        emotionSelect.value = matchedOption.value;
    } else {
        emotionSelect.value = "Happy"; // default fallback
    }

    document.getElementById("addTitleInput").value = "";
    document.getElementById("addArtistInput").value = "";
    document.getElementById("addLinkInput").value = "";
    document.getElementById("addModalMessage").innerText = "";
    document.getElementById("addModal").classList.add("show");
}

function closeAddModal() {
    document.getElementById("addModal").classList.remove("show");
}

// Close add modal when clicking the dark backdrop
document.getElementById("addModal").addEventListener("click", function(e) {
    if (e.target === this) closeAddModal();
});

function submitAddSong() {
    const title = document.getElementById("addTitleInput").value.trim();
    const artist = document.getElementById("addArtistInput").value.trim();
    const emotion = document.getElementById("addEmotionInput").value.trim();
    const link = document.getElementById("addLinkInput").value.trim();
    const msgEl = document.getElementById("addModalMessage");

    if (!title || !artist || !emotion || !link) {
        msgEl.innerText = "⚠ Please fill all fields.";
        msgEl.className = "modal-msg error";
        return;
    }

    const saveBtn = document.getElementById("addSaveBtn");
    saveBtn.disabled = true;
    saveBtn.innerText = "Adding...";

    fetch("/add_song", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            title: title, 
            artist: artist, 
            emotion: emotion, 
            file_path: link 
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "success") {
            msgEl.innerText = "✅ Song added successfully!";
            msgEl.className = "modal-msg success";
            setTimeout(() => {
                closeAddModal();
                // We only reload if the added song matches the current view's emotion
                // But generally reloading is good to show it if they added it to the current mood
                location.reload();
            }, 1200);
        } else {
            msgEl.innerText = "❌ " + (data.message || "Failed to add song.");
            msgEl.className = "modal-msg error";
        }
    })
    .catch(err => {
        console.error(err);
        msgEl.innerText = "❌ Network error. Try again.";
        msgEl.className = "modal-msg error";
    })
    .finally(() => {
        saveBtn.disabled = false;
        saveBtn.innerText = "Add Song";
    });
}

// ── Delete Song Helper ──────────────────────────────────────────────
function deleteSong(songId) {
    if (!confirm("Are you sure you want to delete this song?")) {
        return;
    }

    fetch("/delete_song", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: songId })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "success") {
            alert("✅ Song deleted successfully!");
            location.reload();
        } else {
            alert("❌ " + (data.message || "Failed to delete song."));
        }
    })
    .catch(err => {
        console.error(err);
        alert("❌ Network error while deleting song.");
    });
}

