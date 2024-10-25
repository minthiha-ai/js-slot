let currentUser = null;  // To store the logged-in user's data

// Event listener for login
document.getElementById('login-btn').addEventListener('click', function () {
    handleUserAuthentication('login');
});

// Event listener for register
document.getElementById('register-btn').addEventListener('click', function () {
    handleUserAuthentication('register');
});

// Event listener for logout
document.getElementById('logout-btn').addEventListener('click', function () {
    currentUser = null;  // Clear the current user
    document.getElementById('login-btn').style.display = 'block';
    document.getElementById('logout-btn').style.display = 'none';
    alert('Logged out successfully.');
    document.getElementById('name-input').value = '';
    document.getElementById('password-input').value = '';
    document.getElementById('money-input').value = 0;
    document.getElementById('points-display').value = 0;
    document.getElementById('points-display').textContent = 0;
    document.getElementById('game-history').innerHTML = 'Please log in to view your game history.';
});

// Handle login and register functionality
const handleUserAuthentication = (action) => {
    const username = document.getElementById('name-input').value;
    const password = document.getElementById('password-input').value;

    // Check if both username and password are provided
    if (!username || !password) {
        alert("Please enter both username and password.");
        return;
    }

    const endpoint = action === 'login' ? '/get-user' : '/register-user';

    // Send username and password to the server for either login or registration
    fetch(`http://localhost:3000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
                window.location.reload();
            } else {
                currentUser = data;  // Store the user data
                document.getElementById('money-input').value = currentUser.totalMoney;
                document.getElementById('points-display').textContent = currentUser.totalPoints;

                // Ensure elements exist before modifying them
                const loginSection = document.getElementById('login-btn');
                const logoutBtn = document.getElementById('logout-btn');

                if (loginSection && logoutBtn) {
                    // Hide login section and show logout button
                    loginSection.style.display = 'none';
                    logoutBtn.style.display = 'block';
                }

                // Load game history after successful login
                loadHistoryAfterLogin();
            }
        })
        .catch(error => {
            console.error('Error:', error);  // Log error for debugging
            alert('Failed to retrieve or register user. Please try again.');
        });
};

// After each game, update user data on the server
const updateUser = (totalMoney, totalPoints) => {
    // Ensure that the user is logged in before trying to update
    if (!currentUser || !currentUser.username) {
        alert('No user is currently logged in. Please log in first.');
        return;
    }

    fetch('http://localhost:3000/update-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: currentUser.username,
            totalMoney,
            totalPoints
        })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update user data');
            }
            return response.json();
        })
        .then(data => {
            console.log('User data updated:', data);
        })
        .catch(error => {
            console.error('Error updating user:', error);
            alert('Failed to update user data. Please try again later.');
        });
};
