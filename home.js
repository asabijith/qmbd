const apiKey = 'cd9aa67753933af024f72409f0676f8a';
const baseUrl = 'https://api.themoviedb.org/3';
const imgBaseUrl = 'https://image.tmdb.org/t/p/w500';

// Fetch new movies (using now_playing for demonstration)
fetch(`${baseUrl}/movie/now_playing?api_key=${apiKey}`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => displayMovies(data.results, 'new-movies'))
    .catch(error => console.error('Error fetching new movies:', error));

// Fetch upcoming movies
fetch(`${baseUrl}/movie/upcoming?api_key=${apiKey}`)
    .then(response => response.json())
    .then(data => displayMovies(data.results, 'upcoming-movies'))
    .catch(error => console.error('Error fetching upcoming movies:', error));

// Fetch now playing movies
fetch(`${baseUrl}/movie/now_playing?api_key=${apiKey}`)
    .then(response => response.json())
    .then(data => displayMovies(data.results, 'now-playing-movies'))
    .catch(error => console.error('Error fetching now playing movies:', error));

// Fetch top-rated movies
fetch(`${baseUrl}/movie/top_rated?api_key=${apiKey}`)
    .then(response => response.json())
    .then(data => displayMovies(data.results, 'top-rated-movies'))
    .catch(error => console.error('Error fetching top rated movies:', error));

// Fetch comedy movies
fetch(`${baseUrl}/discover/movie?api_key=${apiKey}&with_genres=35`)
    .then(response => response.json())
    .then(data => displayMovies(data.results, 'comedy-movies'))
    .catch(error => console.error('Error fetching comedy movies:', error));

// Fetch horror movies
fetch(`${baseUrl}/discover/movie?api_key=${apiKey}&with_genres=27`)
    .then(response => response.json())
    .then(data => displayMovies(data.results, 'horror-movies'))
    .catch(error => console.error('Error fetching horror movies:', error));

// Fetch anime movies
fetch(`${baseUrl}/discover/movie?api_key=${apiKey}&with_genres=16`)
    .then(response => response.json())
    .then(data => displayMovies(data.results, 'anime-movies'))
    .catch(error => console.error('Error fetching anime movies:', error));

// Search functionality
document.getElementById('search').addEventListener('input', function(e) {
    const query = e.target.value;
    if (query) {
        fetch(`${baseUrl}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(data => displayMovies(data.results, 'new-movies')) // Display search results in the 'new-movies' section
            .catch(error => console.error('Error searching for movies:', error));
    } else {
        // Optionally, you could repopulate the sections when the search box is empty
    }
});

function displayMovies(movies, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = ''; // Clear previous content
    if (movies.length === 0) {
        container.innerHTML = '<p>No movies found.</p>'; // Show a message if no movies are found
    }
    movies.forEach(movie => {
        const movieDiv = document.createElement('div');
        movieDiv.classList.add('movie-item'); // Add a class for styling
        movieDiv.innerHTML = `
            <img src="${imgBaseUrl + movie.poster_path}" alt="${movie.title}">
            <p>${movie.title}</p>
            <p>Rating: ${movie.vote_average}</p>
        `;
        movieDiv.addEventListener('click', () => {
            window.location.href = `movie.html?id=${movie.id}`;
        });
        container.appendChild(movieDiv);
    });
}

function toggleMenu() {
    const menu = document.getElementById('nav-menu');
    menu.classList.toggle('show');
}
// Array of movies (for simulation purposes)
const movies = [
    'Inception',
    'Interstellar',
    'The Dark Knight',
    'Avengers: Endgame',
    'Spider-Man: No Way Home',
    'Joker',
    'Frozen 2',
    'Parasite',
    '1917',
    'The Irishman'
];

// Function to search movies and update the heading
function searchMovies() {
    const query = document.getElementById('search').value.toLowerCase();
    const resultsSection = document.getElementById('search-results');
    const searchHeading = document.getElementById('search-heading');

    // Clear previous results
    resultsSection.innerHTML = '';

    // Set heading text if query is not empty, otherwise clear the heading
    if (query) {
        searchHeading.textContent = `Search Results for "${query}"`;
    } else {
        searchHeading.textContent = '';
        return; // Exit if search query is empty
    }

    // Filter the movies based on the search query
    const filteredMovies = movies.filter(movie => movie.toLowerCase().includes(query));

    // If no matches found
    if (filteredMovies.length === 0) {
        resultsSection.innerHTML = `<p>No results found for "${query}"</p>`;
        return;
    }

    // Display matching movies
    filteredMovies.forEach(movie => {
        const movieDiv = document.createElement('div');
        movieDiv.classList.add('movie-item');
        movieDiv.innerHTML = `
            <img src="https://via.placeholder.com/150" alt="${movie}">
            <p>${movie}</p>
        `;
        resultsSection.appendChild(movieDiv);
    });
}