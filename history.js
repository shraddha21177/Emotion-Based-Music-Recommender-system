// Fetch real history from DB for the current user
const currentUserId = localStorage.getItem("user_id") || "";

fetch("/get_history?user_id=" + currentUserId)
    .then(res => res.json())
    .then(data => {
        let output = "";

        if (data.length === 0) {
            output = `<p class="empty-msg">No mood history yet. Go pick a mood!</p>`;
        } else {
            data.forEach(item => {
                const songLabel = item.song_title ? `<span class="song-title">🎵 ${item.song_title}</span>` : "";
                output += `
                    <div class="history-item">
                        <span class="emotion">🎭 ${item.emotion}</span>
                        ${songLabel}
                        <span class="time">${item.time}</span>
                    </div>
                `;
            });
        }

        document.getElementById("historyList").innerHTML = output;
    })
    .catch(err => {
        console.error(err);
        document.getElementById("historyList").innerHTML = `<p class="empty-msg">Error loading history.</p>`;
    });


// When user clicks "Go to Songs":
// Redirect to songs page (history will be saved when user plays a song)
function goToSongs() {
    let emotion   = localStorage.getItem("emotion");

    if (!emotion) {
        alert("No mood selected. Please go back and select a mood.");
        return;
    }

    window.location.href = "/songs-page";
}