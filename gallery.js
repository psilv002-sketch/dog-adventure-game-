// Gallery JavaScript - Load and display dog adventures

document.addEventListener('DOMContentLoaded', () => {
    loadAdventures();
    setupModal();
});

// Load adventures from Airtable
async function loadAdventures() {
    const loading = document.getElementById('loading');
    const errorMessage = document.getElementById('error-message');
    const adventuresGrid = document.getElementById('adventures-grid');
    const noAdventures = document.getElementById('no-adventures');

    try {
        // Determine API endpoint
        const apiEndpoint = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:8888/.netlify/functions/get-adventures'
            : '/.netlify/functions/get-adventures';

        const response = await fetch(apiEndpoint);

        if (!response.ok) {
            throw new Error('Failed to load adventures');
        }

        const data = await response.json();
        const adventures = data.adventures;

        // Hide loading
        loading.style.display = 'none';

        if (adventures.length === 0) {
            noAdventures.style.display = 'block';
            return;
        }

        // Display adventures
        displayAdventures(adventures);

    } catch (error) {
        console.error('Error loading adventures:', error);
        loading.style.display = 'none';
        errorMessage.style.display = 'block';
    }
}

// Display adventures in grid
function displayAdventures(adventures) {
    const grid = document.getElementById('adventures-grid');
    grid.innerHTML = '';

    adventures.forEach(adventure => {
        const card = createAdventureCard(adventure);
        grid.appendChild(card);
    });
}

// Create adventure card
function createAdventureCard(adventure) {
    const card = document.createElement('div');
    card.className = 'adventure-card';

    const date = new Date(adventure.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    // Get first chapter preview
    const firstChapter = adventure.chapters[0];
    const preview = firstChapter ? firstChapter.story.substring(0, 150) + '...' : 'No preview available';

    // Check if photo is available and valid
    const hasValidPhoto = adventure.photoUrl && 
                          adventure.photoUrl.startsWith('data:image') && 
                          adventure.photoUrl.length > 100;
    
    const photoHTML = hasValidPhoto 
        ? `<img src="${adventure.photoUrl}" alt="${adventure.dogName}" class="dog-photo-card">`
        : `<div class="dog-photo-placeholder">🐕</div>`;
    
    card.innerHTML = `
        <div class="card-photo">
            ${photoHTML}
        </div>
        <div class="card-content">
            <h3 class="dog-name">${adventure.dogName}</h3>
            <p class="dog-breed">${adventure.breed} • ${adventure.gender}</p>
            <p class="adventure-preview">${preview}</p>
            <div class="card-footer">
                <span class="chapter-badge">${adventure.chapterCount} Chapters</span>
                <span class="date">${date}</span>
            </div>
            <button class="btn-read" data-adventure-id="${adventure.id}">Read Full Adventure</button>
        </div>
    `;

    // Add click event to read button
    card.querySelector('.btn-read').addEventListener('click', () => {
        showFullAdventure(adventure);
    });

    return card;
}

// Show full adventure in modal
function showFullAdventure(adventure) {
    const modal = document.getElementById('adventure-modal');
    const modalBody = document.getElementById('modal-body');

    const date = new Date(adventure.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    let chaptersHTML = '';
    adventure.chapters.forEach((chapter, index) => {
        chaptersHTML += `
            <div class="modal-chapter">
                <h3>Chapter ${chapter.number}</h3>
                <p class="modal-chapter-story">${chapter.story}</p>
                ${chapter.choice ? `<p class="modal-chapter-choice">✨ <strong>Choice made:</strong> ${chapter.choice}</p>` : ''}
            </div>
        `;
    });

    // Check if photo is available and valid
    const hasValidPhoto = adventure.photoUrl && 
                          adventure.photoUrl.startsWith('data:image') && 
                          adventure.photoUrl.length > 100;
    
    const modalPhotoHTML = hasValidPhoto 
        ? `<img src="${adventure.photoUrl}" alt="${adventure.dogName}" class="dog-photo-modal">`
        : `<div class="dog-photo-placeholder modal">🐕</div>`;
    
    modalBody.innerHTML = `
        <div class="modal-header">
            <div class="modal-dog-photo">
                ${modalPhotoHTML}
            </div>
            <div class="modal-dog-info">
                <h2>${adventure.dogName}'s Adventure</h2>
                <p class="modal-breed">${adventure.breed} • ${adventure.gender}</p>
                <p class="modal-date">Shared on ${date}</p>
            </div>
        </div>
        <div class="modal-chapters">
            ${chaptersHTML}
        </div>
    `;

    modal.style.display = 'flex';
}

// Setup modal close functionality
function setupModal() {
    const modal = document.getElementById('adventure-modal');
    const closeBtn = document.querySelector('.close-modal');

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Close when clicking outside modal
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Close with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            modal.style.display = 'none';
        }
    });
}

