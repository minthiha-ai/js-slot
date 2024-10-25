const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Paths for users and history JSON files
const usersFilePath = path.join(__dirname, 'users.json');
const gameHistoryFilePath = path.join(__dirname, 'game-history.json');

// Helper function to ensure the file exists and return parsed data
const getFileContent = (filePath) => {
    if (!fs.existsSync(filePath)) {
        return [];
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data || '[]');  // Handle empty files
};

// Helper function to write data back to a file
const saveToFile = (filePath, data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Helper function to get users
const getUsers = () => {
    return getFileContent(usersFilePath);
};

// Helper function to save users
const saveUsers = (users) => {
    saveToFile(usersFilePath, users);
};

// API to handle user registration
app.post('/register-user', (req, res) => {
    const { username, password } = req.body;
    let users = getUsers();

    const existingUser = users.find(u => u.username === username);

    if (existingUser) {
        return res.status(400).json({ error: 'Username already exists.' });
    }

    // Create a new user if the username is not taken
    const newUser = {
        username,
        password,
        totalMoney: 100,  // New user starts with $100
        totalPoints: 0    // New user starts with 0 points
    };

    users.push(newUser);
    saveUsers(users);  // Save to users.json
    return res.json(newUser);
});

// API to create or retrieve user
app.post('/get-user', (req, res) => {
    const { username, password } = req.body;
    let users = getUsers();

    const existingUser = users.find(u => u.username === username);

    if (existingUser) {
        // Check if the password matches
        if (existingUser.password === password) {
            return res.json(existingUser);
        } else {
            return res.status(400).json({ error: 'Invalid password' });
        }
    }

    // Create new user if doesn't exist
    const newUser = {
        username,
        password,
        totalMoney: 100,  // New user starts with $100
        totalPoints: 0    // New user starts with 0 points
    };

    users.push(newUser);
    saveUsers(users);  // Save to users.json
    return res.json(newUser);
});

// API to update user data
app.post('/update-user', (req, res) => {
    const { username, totalMoney, totalPoints } = req.body;
    let users = getUsers();

    // Update user data
    users = users.map(user => {
        if (user.username === username) {
            return { ...user, totalMoney, totalPoints };
        }
        return user;
    });

    // Save the updated users back to the file
    saveUsers(users);

    return res.json({ message: 'User data updated successfully!' });
});

// API endpoint to save game history
app.post('/save-history', (req, res) => {
    const { username, gameHistory } = req.body; // Add username in the request body
    let history = getFileContent(gameHistoryFilePath);
    // Attach the username to the game history entry
    const historyEntry = {
        username: username,
        ...gameHistory,  // Spread the game history object (topRow, middleRow, etc.)
    };

    history.push(historyEntry);  // Add new game history

    // Write updated history back to the file
    saveToFile(gameHistoryFilePath, history);

    res.json({ message: 'Game history saved successfully!' });
});

// API endpoint to retrieve history for a specific user
app.post('/history', (req, res) => {
    const { username } = req.body;
    console.log('Fetching history for user:', username);  // Add this log

    const history = getFileContent(gameHistoryFilePath);
    const userHistory = history.filter(entry => entry.username === username);

    res.json(userHistory.length ? userHistory : []);
});

// API endpoint to retrieve leaderboard
app.get('/leaderboard', (req, res) => {
    let users = getUsers();
    console.log('Leaderboard data:', users);  // Add this log to see what users are being loaded

    // Sort users by totalPoints in descending order
    users.sort((a, b) => b.totalPoints - a.totalPoints);

    // Return the top users, or all users if fewer than 10 exist
    const topUsers = users.slice(0, 10);
    console.log('Top users:', topUsers);  // Log the top users

    res.json(topUsers);  // Send the sorted leaderboard data
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
