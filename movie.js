const apiKey = 'cd9aa67753933af024f72409f0676f8a';
const baseUrl = 'https://api.themoviedb.org/3';
const imgBaseUrl = 'https://image.tmdb.org/t/p/w500';
const placeholderImg = 'https://via.placeholder.com/150x225?text=No+Image'; // Placeholder image URL

const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get('id');

// Fetch movie details
fetch(`${baseUrl}/movie/${movieId}?api_key=${apiKey}`)
    .then(response => response.json())
    .then(movie => {
        document.getElementById('movie-title').innerText = movie.title;
        document.getElementById('movie-release-date').innerText = `Release Date: ${movie.release_date}`;
        document.getElementById('movie-rating').innerText = `Rating: ${movie.vote_average}`;
        document.getElementById('movie-overview').innerText = movie.overview;
        document.getElementById('movie-poster').src = movie.poster_path ? (imgBaseUrl + movie.poster_path) : placeholderImg;
        document.getElementById('movie-poster').alt = movie.title;

        fetchCast(movieId);
        fetchTrailer(movieId);
    })
    .catch(error => {
        console.error('Error fetching movie details:', error);
        document.getElementById('movie-details').innerHTML = '<p>Error loading movie details. Please try again later.</p>';
    });

// Fetch movie cast
function fetchCast(movieId) {
    fetch(`${baseUrl}/movie/${movieId}/credits?api_key=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            const castContainer = document.getElementById('movie-cast');
            data.cast.slice(0, 10).forEach(actor => { // Limit to first 10 actors
                const actorDiv = document.createElement('div');
                const imgSrc = actor.profile_path ? (imgBaseUrl + actor.profile_path) : placeholderImg;
                actorDiv.innerHTML = `
                    <img src="${imgSrc}" alt="${actor.name}" onerror="this.src='${placeholderImg}'">
                    <p>${actor.name}</p>
                `;
                castContainer.appendChild(actorDiv);
            });
        })
        .catch(error => {
            console.error('Error fetching cast:', error);
            document.getElementById('movie-cast').innerHTML = '<p>Error loading cast information.</p>';
        });
}

// Fetch movie trailer
function fetchTrailer(movieId) {
    fetch(`${baseUrl}/movie/${movieId}/videos?api_key=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            const trailer = data.results.find(video => video.type === 'Trailer');
            const trailerContainer = document.getElementById('movie-trailer');
            if (trailer) {
                trailerContainer.innerHTML = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${trailer.key}" frameborder="0" allowfullscreen></iframe>`;
            } else {
                trailerContainer.innerHTML = '<p>No trailer available</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching trailer:', error);
            document.getElementById('movie-trailer').innerHTML = '<p>Error loading trailer.</p>';
        });
}