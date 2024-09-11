document.getElementById('login-view').classList.remove('hidden');
document.getElementById('register-view').classList.add('hidden');
document.getElementById('edit-view').classList.add('hidden');

// Switch to Register form
document.getElementById('show-register').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('login-view').classList.add('hidden');
    document.getElementById('register-view').classList.remove('hidden');
});

// Switch back to Login form
document.getElementById('show-login').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('register-view').classList.add('hidden');
    document.getElementById('login-view').classList.remove('hidden');
});

// Utility function to validate password
function validatePassword(password) {
    const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
    return regex.test(password);
}

// Simulate API call to validate city
async function validateCity(city) {
    // Replace with actual API call to validate city
    const validCities = ['London', 'New York', 'Paris']; // Example valid cities
    return validCities.includes(city);
}

// Register form submission
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    const city = document.getElementById('register-city').value;
    const subscribe = document.getElementById('register-subscribe').checked;

    if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
    }

    if (!validatePassword(password)) {
        alert('Password must be at least 8 characters long, contain at least 1 number, 1 special character, 1 uppercase letter, and 1 lowercase letter.');
        return;
    }

    if (!(await validateCity(city))) {
        alert('Invalid city. Please enter a valid city.');
        return;
    }

    // Proceed with registration
    const response = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, city, subscribe })
    });

    const data = await response.json();
    console.log('Register:', data);

    // After successful registration, switch to the login form
    document.getElementById('register-view').classList.add('hidden');
    document.getElementById('login-view').classList.remove('hidden');
});

// Login form submission
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    console.log('Login:', data);

    // After successful login, switch to the edit profile form
    document.getElementById('login-view').classList.add('hidden');
    document.getElementById('edit-view').classList.remove('hidden');
});

// Edit profile form submission
document.getElementById('edit-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const city = document.getElementById('edit-city').value;
    const subscribe = document.getElementById('edit-subscribe').checked;

    if (!(await validateCity(city))) {
        alert('Invalid city. Please enter a valid city.');
        return;
    }

    // Proceed with profile update
    const response = await fetch('/edit-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city, subscribe })
    });

    const data = await response.json();
    console.log('Edit Profile:', data);
});