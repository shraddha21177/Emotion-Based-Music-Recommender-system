// Stores the currently selected emotion value
let selectedEmotion = "";

// Called when a card is clicked
function selectEmotion(card, emotion) {
    // Remove 'selected' from all cards first
    document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));

    // Highlight the clicked card
    card.classList.add('selected');

    // Save the emotion value
    selectedEmotion = emotion;
}

// Called when "Find My Music" button is clicked
function saveEmotion() {
    if (selectedEmotion === "") {
        alert("Please select a mood first!");
        return;
    }

    // Save to localStorage so other pages can use it
    localStorage.setItem("emotion", selectedEmotion);

    // Go to history page
    window.location.href = "/history-page";
}