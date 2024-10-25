const icon_width = 79,
    icon_height = 79,
    num_icons = 9,
    time_per_icon = 100,
    iconMap = ['banana', 'seven', 'cherry', 'plam', 'orange', 'bell', 'bar', 'lemon', 'melon'],
    paylines = [
        [5, 6, 7, 8, 9],   // Middle row
        [0, 1, 2, 3, 4],   // Top row
        [10, 11, 12, 13, 14],   // Bottom row
        [0, 6, 12, 8, 4],   // First diagonal
        [10, 6, 2, 8, 14],   // Second diagonal
        [0, 1, 7, 13, 14],   // First zigzag
        [10, 11, 7, 3, 4],   // Second zigzag
        [5, 1, 7, 13, 9],   // Random pattern 1
        [5, 11, 7, 3, 9],   // Random pattern 2
        [0, 6, 7, 8, 14],   // Edge-to-edge 1
        [10, 6, 7, 8, 4]    // Edge-to-edge 2
    ],
    pointsTable = {
        'seven': [0, 10, 50, 100, 500],
        'bar': [0, 5, 20, 50, 200],
        'bell': [0, 4, 15, 30, 100],
        'melon': [0, 3, 10, 20, 50],
        'orange': [0, 3, 8, 15, 40],
        'banana': [0, 2, 7, 12, 30],
        'plam': [0, 2, 5, 10, 25],
        'lemon': [0, 1, 4, 8, 20],
        'cherry': [0, 1, 3, 5, 15]
    };

let winStatus = false,
    selectedPaylines = 1,
    totalPoints = 0,
    betPoints = 1,
    grandTotalPoints = 0,
    indexes = [0, 0, 0, 0, 0];

document.getElementById('change-btn').addEventListener('click', function () {
    const moneyInput = document.getElementById('money-input');
    const money = parseFloat(moneyInput.value);
    if (money > 0) {
        totalPoints += money;
        document.getElementById('points-display').value = totalPoints;
        moneyInput.value = 0;
        console.log(`Total Points Updated: ${totalPoints}`);
    } else {
        alert("Enter a valid amount");
    }

});

document.getElementById('bet-input').addEventListener('input', function () {
    betPoints = Math.max(parseInt(this.value) || 1, 1); // Ensure bet points stay positive
    console.log(`Bet Points Updated: ${betPoints}`);
});

const roll = async (reel, offset = 0) => {
    const delta = (offset + 2) * num_icons + Math.floor(Math.random() * num_icons),
        backgroundPositionY = parseFloat(getComputedStyle(reel)["backgroundPositionY"]),
        targetBackgroundPositionY = backgroundPositionY + delta * icon_height;

    const normalTargetBackgroundPositionY = targetBackgroundPositionY % (num_icons * icon_height);

    reel.style.transition = `background-position-y ${8 + delta * time_per_icon}ms cubic-bezier(.41,-0.01,.63,1.09)`;
    reel.style.backgroundPositionY = `${targetBackgroundPositionY}px`;

    return new Promise(resolve => {
        setTimeout(() => {
            reel.style.transition = 'none';
            reel.style.backgroundPositionY = `${normalTargetBackgroundPositionY}px`;
            resolve(delta % num_icons);
        }, 8 + delta * time_per_icon);
    });
};

const checkWin = (top, mid, bott) => {
    const activePaylines = paylines.slice(0, selectedPaylines);
    let pointsEarned = 0;
    winStatus = false;

    activePaylines.forEach((line, index) => {
        let symbols = [];

        switch (index) {
            case 0: symbols = mid; break;
            case 1: symbols = top; break;
            case 2: symbols = bott; break;
            case 3: symbols = [top[0], mid[1], bott[2], mid[3], top[4]]; break;
            case 4: symbols = [bott[0], mid[1], top[2], mid[3], bott[4]]; break;
            case 5: symbols = [top[0], top[1], mid[2], bott[3], bott[4]]; break;
            case 6: symbols = [bott[0], bott[1], mid[2], top[3], top[4]]; break;
            case 7: symbols = [mid[0], top[1], mid[2], bott[3], mid[4]]; break;
            case 8: symbols = [mid[0], bott[1], mid[2], top[3], mid[4]]; break;
            case 9: symbols = [top[0], mid[1], mid[2], mid[3], bott[4]]; break;
            case 10: symbols = [bott[0], mid[1], mid[2], mid[3], top[4]]; break;
            default: symbols = [];
        }

        let matchCount = 1;
        const firstSymbol = symbols[0];
        for (let i = 1; i < symbols.length; i++) {
            if (symbols[i] === symbols[i - 1]) matchCount++;
            else break;
        }

        if (pointsTable[firstSymbol] && matchCount >= 2) {
            pointsEarned += pointsTable[firstSymbol][matchCount - 1] * betPoints;
            winStatus = true;
        }
    });
    return pointsEarned;
};

const saveHistoryToServer = async (topRowIcons, middleRowIcons, bottomRowIcons, paylines, pointsEarned) => {
    const historyEntry = {
        username: currentUser.username,  // Store the username
        betPoints: betPoints,            // Store the bet for this game
        winningPoints: pointsEarned,     // Points won in this game
        topRow: topRowIcons,
        middleRow: middleRowIcons,
        bottomRow: bottomRowIcons,
        paylines: paylines,
        payout: pointsEarned,
        timestamp: new Date().toLocaleString(),  // Add timestamp
    };

    try {
        const response = await fetch('http://localhost:3000/save-history', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: currentUser.username, gameHistory: historyEntry }),  // Include username and history
        });

        if (response.ok) {
            console.log('History saved successfully');
            loadGameHistory();  // Refresh history after saving
        } else {
            console.error('Error saving history:', await response.json());
        }
    } catch (error) {
        console.error('Error saving history:', error);
    }
};

const rollAll = async () => {
    const playButton = document.getElementById('play-btn');
    playButton.disabled = true;

    // Get username and password inputs
    const username = document.getElementById('name-input').value;
    const password = document.getElementById('password-input').value;

    // Validate that both username and password are provided
    if (!username || !password) {
        alert("Please enter both username and password before playing.");
        playButton.disabled = false;  // Re-enable the play button
        return;
    }

    // Check if the player has enough points to bet
    if (betPoints > totalPoints) {
        alert("You don't have enough points to bet.");
        playButton.disabled = false;
        return;
    }

    totalPoints -= betPoints;
    document.getElementById('points-display').value = totalPoints;

    // Spin all reels and get their outcomes
    const reelsList = document.querySelectorAll('.slots > .reel');
    const deltas = await Promise.all([...reelsList].map((reel, i) => roll(reel, i)));

    deltas.forEach((delta, i) => indexes[i] = (indexes[i] + delta) % num_icons);

    const topRowIcons = indexes.map(i => iconMap[(i + 1) % num_icons]);
    const middleRowIcons = indexes.map(i => iconMap[i]);
    const bottomRowIcons = indexes.map(i => iconMap[(i - 1 + num_icons) % num_icons]);

    const pointsEarned = checkWin(topRowIcons, middleRowIcons, bottomRowIcons);
    totalPoints += pointsEarned;
    grandTotalPoints += pointsEarned;
    document.getElementById('points-display').value = totalPoints;

    // Check if the player won, and show animation if true
    if (winStatus) {
        document.querySelector('.slots').classList.add('win2');
        setTimeout(() => document.querySelector('.slots').classList.remove('win2'), 2000);
    }

    // Update the user data on the server
    updateUser(totalPoints, grandTotalPoints);
    loadLeaderboard();

    // Save game history and update the UI
    await saveHistoryToServer(topRowIcons, middleRowIcons, bottomRowIcons, selectedPaylines, pointsEarned);

    // Re-enable play button after the roll is finished
    playButton.disabled = false;
};

window.onload = loadGameHistory;
document.getElementById('play-btn').addEventListener('click', rollAll);
document.querySelectorAll('.payline-btn').forEach(button => {
    button.addEventListener('click', event => {
        selectedPaylines = parseInt(event.target.getAttribute('data-lines'));
        document.querySelectorAll('.payline-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
    });
});
