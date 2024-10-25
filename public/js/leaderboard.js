const loadLeaderboard = () => {
    fetch('http://localhost:3000/leaderboard')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error fetching leaderboard.');
            }
            return response.json();
        })
        .then(leaderboard => {
            console.log('Leaderboard data:', leaderboard);  // Add this line to log the data fetched
            const leaderboardElement = document.getElementById('leaderboard');
            leaderboardElement.innerHTML = '';  // Clear previous content

            if (!Array.isArray(leaderboard) || leaderboard.length === 0) {
                leaderboardElement.innerHTML = "No leaderboard data available.";
                return;
            }

            leaderboard.forEach((user, index) => {
                const leaderboardEntry = `
Rank #${index + 1}
--------------------
Username:    ${user.username}
Total Points: ${user.totalPoints}
--------------------
`;
                const div = document.createElement('div');
                div.textContent = leaderboardEntry;  // Add leaderboard entry text
                div.classList.add('leaderboard-entry');
                leaderboardElement.appendChild(div);
            });
        })
        .catch(error => {
            console.error('Error fetching leaderboard:', error);
            const leaderboardElement = document.getElementById('leaderboard');
            leaderboardElement.innerHTML = "Failed to load leaderboard.";
        });
};

loadLeaderboard();
