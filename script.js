// --- The Full Music Library ---
const library = [
    { title: "7 Years", artist: "Lukas Graham", src: "7Years.mp3" },
    { title: "Baby", artist: "Justin Bieber ft. Ludacris", src: "Baby.mp3" },
    { title: "Back To Black", artist: "Amy Winehouse", src: "Back To Black.mp3" },
    { title: "CO2", artist: "Prateek Kuhad", src: "Co2.mp3" },
    { title: "I Wanna Be Yours", artist: "Arctic Monkeys", src: "I wanna be yours.mp3" },
    { title: "On My Way", artist: "Alan Walker, Sabrina Carpenter & Farruko", src: "On My Way.mp3" },
    { title: "On The Floor", artist: "Jennifer Lopez ft. Pitbull", src: "On The Floor.mp3" },
    { title: "Ordinary", artist: "Alex Warren", src: "Ordinary.mp3" },
    { title: "Reflections", artist: "The Neighbourhood", src: "Reflections.mp3" },
    { title: "Softcore", artist: "The Neighbourhood", src: "Softcore.mp3" }
];

// --- Player State and Elements ---
let playlists = [{ name: "Playlist", songs: [] }];
let activePlaylistIndex = 0;
let currentPlaybackList = library;
let currentSongIndex = 0;
let songIndexToAdd = null;
let isShuffling = false;
let repeatMode = 'all';

// DOM Elements
const player = document.querySelector('.player');
const audio = document.getElementById('audio');
const title = document.getElementById('song-title');
const artist = document.getElementById('song-artist');
const vinylImage = document.getElementById('vinyl-image');
const progress = document.getElementById('progress');
const currentTimeEl = document.getElementById('current-time');
const totalDurationEl = document.getElementById('total-duration');
const playBtn = document.getElementById('play');
const playBtnIcon = playBtn.querySelector('i');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const shuffleBtn = document.getElementById('shuffle-btn');
const repeatBtn = document.getElementById('repeat-btn');
const volumeSlider = document.getElementById('volume');
const libraryListEl = document.getElementById('library-list');
const myPlaylistEl = document.getElementById('my-playlist');
const playlistSelector = document.getElementById('playlist-selector');
const newPlaylistBtn = document.getElementById('new-playlist-btn');
const renamePlaylistBtn = document.getElementById('rename-playlist-btn');
const goToPlaylistBtn = document.getElementById('go-to-playlist-btn');
const backToMainBtn = document.getElementById('back-to-main-btn');
const addToPlaylistModal = document.getElementById('add-to-playlist-modal');
const contextPlaylistList = document.getElementById('context-playlist-list');
const contextNewPlaylistBtn = document.getElementById('context-new-playlist-btn');

audio.muted = false;
audio.volume = 1;

// --- Screen Navigation ---
goToPlaylistBtn.addEventListener('click', () => player.classList.add('view-playlist'));
backToMainBtn.addEventListener('click', () => player.classList.remove('view-playlist'));

// --- Context Menu (Add to Playlist) Logic ---
function openAddToPlaylistMenu(index) {
    songIndexToAdd = index;
    contextPlaylistList.innerHTML = "";
    playlists.forEach((playlist, playlistIndex) => {
        const li = document.createElement('li');
        li.textContent = playlist.name;
        li.addEventListener('click', () => addSongToSpecificPlaylist(playlistIndex));
        contextPlaylistList.appendChild(li);
    });
    addToPlaylistModal.classList.add('show-modal');
}

function closeAddToPlaylistMenu() {
    addToPlaylistModal.classList.remove('show-modal');
    songIndexToAdd = null;
}

function addSongToSpecificPlaylist(playlistIndex) {
    if (songIndexToAdd === null) return;
    const song = library[songIndexToAdd];
    if (!playlists[playlistIndex].songs.some(s => s.src === song.src)) {
        playlists[playlistIndex].songs.push(song);
    }
    closeAddToPlaylistMenu();
    renderActiveUserPlaylist();
}

contextNewPlaylistBtn.addEventListener('click', () => {
    const name = prompt("Enter a name for your new playlist:", `Playlist ${playlists.length}`);
    if (name) {
        playlists.push({ name, songs: [] });
        addSongToSpecificPlaylist(playlists.length - 1);
        renderAll();
    }
});

addToPlaylistModal.addEventListener('click', (e) => {
    if (e.target === addToPlaylistModal) {
        closeAddToPlaylistMenu();
    }
});

// --- List Rendering ---
function renderLibrary() {
    libraryListEl.innerHTML = "";
    library.forEach((song, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="song-item-info">${song.title}</span><button class="add-btn list-btn" data-index="${index}"><i class="fas fa-plus"></i></button>`;
        li.querySelector('.song-item-info').addEventListener('click', () => playFromList(library, index));
        li.querySelector('.add-btn').addEventListener('click', () => openAddToPlaylistMenu(index));
        libraryListEl.appendChild(li);
    });
}

function renderActiveUserPlaylist() {
    myPlaylistEl.innerHTML = "";
    const activePlaylist = playlists[activePlaylistIndex];
    if (activePlaylist) {
        activePlaylist.songs.forEach((song, index) => {
            const li = document.createElement('li');
            li.innerHTML = `<span class="song-item-info">${song.title}</span><button class="remove-btn list-btn" data-index="${index}"><i class="fas fa-minus"></i></button>`;
            li.querySelector('.song-item-info').addEventListener('click', () => playFromList(activePlaylist.songs, index));
            li.querySelector('.remove-btn').addEventListener('click', () => {
                activePlaylist.songs.splice(index, 1);
                renderActiveUserPlaylist();
            });
            myPlaylistEl.appendChild(li);
        });
    }
    updateActiveSongHighlight();
}

function renderPlaylistSelector() { playlistSelector.innerHTML = ""; playlists.forEach((p, i) => playlistSelector.add(new Option(p.name, i))); playlistSelector.value = activePlaylistIndex; }
function createNewPlaylist() { const name = prompt("Enter name:", `Playlist ${playlists.length}`); if (name) { playlists.push({ name, songs: [] }); activePlaylistIndex = playlists.length - 1; renderAll(); } }
function renamePlaylist() { const newName = prompt("Enter new name:", playlists[activePlaylistIndex].name); if (newName) { playlists[activePlaylistIndex].name = newName; renderAll(); } }
function renderAll() { renderPlaylistSelector(); renderActiveUserPlaylist(); }
function playFromList(list, index) { if (list.length === 0) return; currentPlaybackList = list; currentSongIndex = index; loadSong(list[index]); playSong(); }
function loadSong(song) { if (!song) return; title.textContent = song.title; artist.textContent = song.artist; audio.src = song.src; updateActiveSongHighlight(); }
function playSong() { audio.play().catch(e => console.error(e)); playBtnIcon.className = 'fas fa-pause'; vinylImage.classList.add('playing'); }
function pauseSong() { audio.pause(); playBtnIcon.className = 'fas fa-play'; vinylImage.classList.remove('playing'); }
function playNextSong() { if (currentPlaybackList.length === 0) return; let newIndex; if (isShuffling) { do { newIndex = Math.floor(Math.random() * currentPlaybackList.length); } while (newIndex === currentSongIndex && currentPlaybackList.length > 1); } else { newIndex = (currentSongIndex + 1) % currentPlaybackList.length; } playFromList(currentPlaybackList, newIndex); }
function playPrevSong() { if (currentPlaybackList.length === 0) return; let newIndex = (currentSongIndex - 1 + currentPlaybackList.length) % currentPlaybackList.length; playFromList(currentPlaybackList, newIndex); }
function formatTime(seconds) { const m = Math.floor(seconds / 60); const s = Math.floor(seconds % 60); return isNaN(m) || isNaN(s) ? "0:00" : `${m}:${s.toString().padStart(2, '0')}`; }
function updateRepeatButton() { repeatBtn.innerHTML = '<i class="fas fa-repeat"></i>'; repeatBtn.classList.toggle('active', repeatMode !== 'none'); if (repeatMode === 'one') repeatBtn.innerHTML += '<sup style="font-size: 0.6em; margin-left: 3px;">1</sup>'; }
function updateActiveSongHighlight() { document.querySelectorAll('#library-list li, #my-playlist li').forEach(item => item.classList.remove('active')); const listEl = (currentPlaybackList === library) ? libraryListEl : myPlaylistEl; if (listEl && listEl.children[currentSongIndex]) { listEl.children[currentSongIndex].classList.add('active'); } }

// --- Event Listeners ---
playBtn.addEventListener('click', () => (audio.paused ? playSong() : pauseSong()));
prevBtn.addEventListener('click', playPrevSong);
nextBtn.addEventListener('click', playNextSong);
shuffleBtn.addEventListener('click', () => { isShuffling = !isShuffling; shuffleBtn.classList.toggle('active', isShuffling); });
repeatBtn.addEventListener('click', () => { repeatMode = repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none'; updateRepeatButton(); });
audio.addEventListener('ended', () => { if (repeatMode === 'one') { audio.currentTime = 0; playSong(); } else { playNextSong(); } });

// --- THIS IS THE UPDATED PART ---
audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
        progress.value = audio.currentTime;
        currentTimeEl.textContent = formatTime(audio.currentTime);
        
        // This new line updates the visual fill of the progress bar
        const progressPercent = (audio.currentTime / audio.duration) * 100;
        progress.style.background = `linear-gradient(to right, #1DB954 ${progressPercent}%, #404040 ${progressPercent}%)`;
    } else {
        // Resets the bar when no song is loaded
        progress.style.background = '#404040';
    }
});

audio.addEventListener('loadedmetadata', () => { progress.max = audio.duration; totalDurationEl.textContent = formatTime(audio.duration); });
progress.addEventListener('input', () => { audio.currentTime = progress.value; });
volumeSlider.addEventListener('input', e => { audio.volume = e.target.value; });
playlistSelector.addEventListener('change', e => { activePlaylistIndex = parseInt(e.target.value); renderActiveUserPlaylist(); });
newPlaylistBtn.addEventListener('click', createNewPlaylist);
renamePlaylistBtn.addEventListener('click', renamePlaylist);

// --- Initial Load ---
renderLibrary();
renderAll();
if (library.length > 0) loadSong(library[0]);
updateRepeatButton();
