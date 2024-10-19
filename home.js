const apiKey = 'cd9aa67753933af024f72409f0676f8a';
const baseUrl = 'https://api.themoviedb.org/3';
const imgBaseUrl = 'https://image.tmdb.org/t/p/w500';

// Helper function to check if the movie is new (e.g., released in the past year)
function isNewMovie(releaseDate) {
    const releaseYear = new Date(releaseDate).getFullYear();
    const currentYear = new Date().getFullYear();
    return currentYear - releaseYear <= 1; // Movies released in the last 1 year
}

// Fetch all movie categories concurrently
Promise.all([
        fetch(`${baseUrl}/movie/now_playing?api_key=${apiKey}`),
        fetch(`${baseUrl}/movie/upcoming?api_key=${apiKey}`),
        fetch(`${baseUrl}/movie/top_rated?api_key=${apiKey}`),
        fetch(`${baseUrl}/discover/movie?api_key=${apiKey}&with_genres=35`), // Comedy
        fetch(`${baseUrl}/discover/movie?api_key=${apiKey}&with_genres=27`), // Horror
        fetch(`${baseUrl}/discover/movie?api_key=${apiKey}&with_genres=16`), // Anime
        fetch(`${baseUrl}/movie/popular?api_key=${apiKey}`) // Popular movies for 'new-movies'
    ])
    .then(async responses => {
        const moviesData = await Promise.all(responses.map(response => response.json()));

        // Filter for new movies only
        displayMovies(moviesData[0].results.filter(movie => isNewMovie(movie.release_date)), 'now-playing-movies');
        displayMovies(moviesData[1].results.filter(movie => isNewMovie(movie.release_date)), 'upcoming-movies');
        displayMovies(moviesData[2].results.filter(movie => isNewMovie(movie.release_date)), 'top-rated-movies');
        displayMovies(moviesData[3].results.filter(movie => isNewMovie(movie.release_date)), 'comedy-movies');
        displayMovies(moviesData[4].results.filter(movie => isNewMovie(movie.release_date)), 'horror-movies');
        displayMovies(moviesData[5].results.filter(movie => isNewMovie(movie.release_date)), 'anime-movies');
        displayMovies(moviesData[6].results.filter(movie => isNewMovie(movie.release_date)), 'new-movies'); // Popular new movies
    })
    .catch(error => console.error('Error fetching movie categories:', error));















// Search functionality
document.getElementById('search').addEventListener('input', function(e) {
    const query = e.target.value.trim(); // Trim spaces to avoid empty string search

    if (query) {
        // Show a loading indicator or message while fetching results
        const searchContainer = document.getElementById('new-movies'); // Use 'new-movies' container for search results
        searchContainer.innerHTML = '<p>Searching...</p>'; // Display searching message

        // Perform the search request
        fetch(`${baseUrl}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(data => {
                if (data.results && data.results.length > 0) {
                    // No additional filtering here to make sure all movies with the query in their title are shown
                    displayMovies(data.results, 'searched_movies'); // Display the full search results in 'new-movies'
                } else {
                    searchContainer.innerHTML = '<p>No movies found matching your search.</p>'; // Show if no results found
                }
            })
            .catch(error => {
                console.error('Error searching for movies:', error);
                searchContainer.innerHTML = '<p>Error fetching search results. Please try again later.</p>'; // Show error message
            });
    } else {
        // If the search is cleared, you can reload the default categories or clear the container
        document.getElementById('new-movies').innerHTML = ''; // Clear search results when query is empty
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

// Trailer Browser Module
const TrailerBrowser = (() => {
    let trailers = [];
    let currentIndex = 0;
    let intervalId;

    const fetchTrailers = async() => {
        try {
            const response = await fetch(`${baseUrl}/movie/now_playing?api_key=${apiKey}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            return data.results.filter(movie => isNewMovie(movie.release_date)); // Only new movies
        } catch (error) {
            console.error('Error fetching trailers:', error);
            return [];
        }
    };

    const createTrailerElement = (movie) => {
        const backdropUrl = movie.backdrop_path ? `${imgBaseUrl}${movie.backdrop_path}` : '/api/placeholder/1280/720';
        const posterUrl = movie.poster_path ? `${imgBaseUrl}${movie.poster_path}` : '/api/placeholder/300/450';

        return `
            <div class="trailer-item" style="background-image: url('${backdropUrl}');">
                <div class="trailer-overlay"></div>
                <div class="trailer-content">
                    <img src="${posterUrl}" alt="${movie.title}" class="trailer-poster" data-movie-id="${movie.id}">
                    <h2 class="trailer-title">${movie.title}</h2>
                    <p class="trailer-description">${movie.overview ? movie.overview.slice(0, 100) + '...' : 'No description available.'}</p>
                    <button class="trailer-play-button">Play Trailer</button>
                </div>
            </div>
        `;
    };

    const showTrailer = async(index) => {
        const movie = trailers[index];
        const container = document.querySelector('.browser_trailer');
        container.innerHTML = createTrailerElement(movie);
        const playButton = container.querySelector('.trailer-play-button');

        playButton.addEventListener('click', () => fetchAndPlayTrailer(movie.id));
    };

    const fetchAndPlayTrailer = async(movieId) => {
        try {
            const response = await fetch(`${baseUrl}/movie/${movieId}/videos?api_key=${apiKey}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            const trailer = data.results.find(video => video.type === 'Trailer');
            if (trailer) {
                showVideoModal(trailer.key); // Play within the modal
            } else {
                alert('No trailer available for this movie.');
            }
        } catch (error) {
            console.error('Error fetching trailer:', error);
            alert('Failed to fetch trailer. Please try again later.');
        }
    };

    const startSlideshow = () => {
        if (intervalId) clearInterval(intervalId); // Clear existing intervals
        intervalId = setInterval(() => {
            currentIndex = (currentIndex + 1) % trailers.length;
            showTrailer(currentIndex);
        }, 5000); // Change trailer every 5 seconds
    };

    const init = async() => {
        trailers = await fetchTrailers();
        if (trailers.length === 0) return;
        showTrailer(currentIndex);
        startSlideshow(); // Start the slideshow

        // Add navigation buttons
        const container = document.querySelector('.browser_trailer');
        const prevButton = document.createElement('button');
        prevButton.classList.add('nav-button', 'prev-button');
        prevButton.innerHTML = '❮';
        prevButton.addEventListener('click', () => {
            clearInterval(intervalId); // Stop the slideshow when navigating manually
            currentIndex = (currentIndex - 1 + trailers.length) % trailers.length;
            showTrailer(currentIndex);
            startSlideshow(); // Restart slideshow
        });
        container.appendChild(prevButton);

        const nextButton = document.createElement('button');
        nextButton.classList.add('nav-button', 'next-button');
        nextButton.innerHTML = '❯';
        nextButton.addEventListener('click', () => {
            clearInterval(intervalId); // Stop the slideshow when navigating manually
            currentIndex = (currentIndex + 1) % trailers.length;
            showTrailer(currentIndex);
            startSlideshow(); // Restart slideshow
        });
        container.appendChild(nextButton);
    };

    return { init };
})();

document.addEventListener('DOMContentLoaded', () => {
    TrailerBrowser.init();
});

function toggleMenu() {
    const menu = document.getElementById('nav-menu');
    const menuToggle = document.querySelector('.menu-toggle');
    menu.classList.toggle('show');
    menuToggle.classList.toggle('open');
}

function showVideoModal(videoKey) {
    const modal = document.createElement('div');
    modal.classList.add('video-modal');
    modal.innerHTML = `
        <div class="video-modal-content">
            <iframe src="https://www.youtube.com/embed/${videoKey}" frameborder="0" allowfullscreen></iframe>
            <button class="close-modal">×</button>
        </div>
    `;
    document.body.appendChild(modal);
    const closeModalButton = modal.querySelector('.close-modal');
    closeModalButton.addEventListener('click', () => {
        modal.remove();
    });
}
