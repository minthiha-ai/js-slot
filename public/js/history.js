// Fetch and display game history for the logged-in user
const loadGameHistory = () => {
    // Check if a user is logged in before fetching the game history
    if (!currentUser || !currentUser.username) {
        const historyElement = document.getElementById('game-history');
        historyElement.innerHTML = "Please log in to view your game history.";
        return;
    }

    // Make a POST request to fetch the game history for the logged-in user
    fetch('http://localhost:3000/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser.username })  // Send the username in the request body
    })
        .then(response => {
            if (!response.ok) {
                console.log(response);
                throw new Error('Error fetching game history.');
            }
            return response.json();
        })
        .then(history => {
            const historyElement = document.getElementById('game-history');
            historyElement.innerHTML = '';  // Clear previous content

            // Check if history is an array and has entries
            if (!Array.isArray(history) || history.length === 0) {
                historyElement.innerHTML = "No game history available.";
                return;
            }

            history.forEach((entry, index) => {
                const gameEntry = `
Game #${index + 1}
--------------------
Top Row:    ${entry.topRow.join(' | ')}
Middle Row: ${entry.middleRow.join(' | ')}
Bottom Row: ${entry.bottomRow.join(' | ')}
Paylines:   ${entry.paylines}
Payout:     ${entry.payout}
Timestamp:  ${entry.timestamp}
--------------------
`;
                const div = document.createElement('div');
                div.textContent = gameEntry;  // Add game entry text
                div.classList.add('game-entry');  // Add a class for easier targeting later
                historyElement.appendChild(div);  // Append each entry as a div
            });

            // Auto-scroll to the bottom for the latest entry
            historyElement.scrollTop = historyElement.scrollHeight;

            // Highlight the last entry
            highlightLastEntry();
        })
        .catch(error => {
            console.error('Error fetching history:', error);
            const historyElement = document.getElementById('game-history');
            historyElement.innerHTML = "Failed to load game history.";
        });
};

// Highlight the last entry in the game history for better visibility
const highlightLastEntry = () => {
    const historyElement = document.getElementById('game-history');
    const entries = historyElement.querySelectorAll('.game-entry');  // Targeting divs with 'game-entry' class

    // Remove previous highlight class if any
    entries.forEach(entry => entry.classList.remove('mark-highlight'));

    if (entries.length > 0) {
        const lastEntry = entries[entries.length - 1];
        lastEntry.classList.add('mark-highlight');

        // Remove the highlight after 2 seconds
        setTimeout(() => {
            lastEntry.classList.remove('mark-highlight');
        }, 2000);
    }
};

// Load game history after login or page load
const loadHistoryAfterLogin = () => {
    // Call this function after successful login to trigger game history loading
    if (currentUser && currentUser.username) {
        loadGameHistory();
    }
};

// Call this when the window loads or after login
window.onload = () => {
    if (currentUser && currentUser.username) {
        loadGameHistory();
    }
};
