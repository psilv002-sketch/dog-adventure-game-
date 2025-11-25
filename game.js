// Game State
let dogData = null;
let dogName = null; // Store dog's name from welcome screen
let dogPhoto = null; // Store uploaded photo
let editedDogPhoto = null; // Store edited/cropped photo
let selectedLocation = null; // Store the selected adventure location
let storyHistory = []; // Store the story progression
let chapterCount = 1;
let decisionCount = 0;
const MAX_CHAPTERS = 2; // Adventure ends after 2 chapters
let preGeneratedLocations = null; // Store pre-generated locations
let locationGenerationPromise = null; // Store the promise for location generation

// Image editing state
let imageEditor = {
    scale: 100,
    minScale: 50, // Will be calculated based on image size
    positionX: 0,
    positionY: 0,
    image: null,
    canvas: null,
    ctx: null,
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    initialPositionX: 0,
    initialPositionY: 0
};

// OpenAI API Integration
async function callOpenAI(messages) {
    try {
        // Determine API endpoint (local dev vs production)
        const apiEndpoint = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:8888/.netlify/functions/generate-story'  // Local Netlify dev server
            : '/.netlify/functions/generate-story';  // Production

        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: messages
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'API request failed');
        }

        const data = await response.json();
        return data.content;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Build system prompt based on dog's characteristics
function buildSystemPrompt() {
    const pronouns = dogData.gender === 'boy' ? { subject: 'he', object: 'him', possessive: 'his' } :
                     dogData.gender === 'girl' ? { subject: 'she', object: 'her', possessive: 'her' } :
                     { subject: 'they', object: 'them', possessive: 'their' };
    
    return `You are a creative storyteller creating an interactive choose-your-own-adventure story for a dog named ${dogData.name}.

Dog's Details:
- Name: ${dogData.name}
- Gender: ${dogData.gender} (use ${pronouns.subject}/${pronouns.object}/${pronouns.possessive} pronouns)
- Personality: ${dogData.personality.join(', ')}
- Favorite Activity: ${dogData.favoriteActivity}

Instructions:
1. Write an engaging, fun story about ${dogData.name}'s adventure
2. Keep the story appropriate for all ages
3. Make ${dogData.name}'s personality and favorite activity influence the story
4. IMPORTANT: Keep each story segment SHORT - exactly 5-6 sentences maximum
5. Write concisely and get to the point quickly
6. Always end with exactly 2 choices for what ${dogData.name} does next
7. Format choices as: "CHOICE 1: [description]", "CHOICE 2: [description]"
8. Make choices meaningful and reflect ${dogData.name}'s characteristics
9. Use the pronoun "${pronouns.subject}" for ${dogData.name}
10. Keep the tone fun and engaging`;
}

// Generate location options using OpenAI (personalized based on dog's characteristics)
async function generateLocationOptions() {
    const pronouns = dogData.gender === 'boy' ? { subject: 'he', possessive: 'his' } :
                     dogData.gender === 'girl' ? { subject: 'she', possessive: 'her' } :
                     { subject: 'they', possessive: 'their' };
    
    const messages = [
        { 
            role: 'system', 
            content: 'You are a creative assistant helping create personalized adventure locations for dogs based on their unique characteristics. Generate interesting, fun places that match the dog\'s personality and interests. Keep each location short - just the place name, no description.' 
        },
        { 
            role: 'user', 
            content: `Create 3 places where ${dogData.name}, a ${dogData.personality.join(' and ')} dog who loves ${dogData.favoriteActivity}, would want to go for an adventure. Make the locations match ${pronouns.possessive} personality and interests. Examples could include: the dog park, a hiking trail, the pet store, a friend's house, the beach, a forest path, the backyard, etc. Just provide the location names, no descriptions. Format your response as: "LOCATION 1: [place name]", "LOCATION 2: [place name]", "LOCATION 3: [place name]"` 
        }
    ];
    
    const response = await callOpenAI(messages);
    return parseLocationResponse(response);
}

// Parse location options from AI response
function parseLocationResponse(response) {
    const lines = response.split('\n').filter(line => line.trim());
    let locations = [];
    
    lines.forEach(line => {
        const locationMatch = line.match(/LOCATION \d+:\s*(.+)/i);
        if (locationMatch) {
            // Get just the location name, trim any extra text after first sentence
            let locationName = locationMatch[1].trim();
            // Remove any descriptions (text after period, dash, or parenthesis)
            locationName = locationName.split(/[.—\-\(]/)[0].trim();
            locations.push(locationName);
        }
    });
    
    // If we couldn't parse locations, provide defaults
    if (locations.length === 0) {
        locations = [
            'the local dog park',
            'a sunny beach',
            'a cozy pet store'
        ];
    }
    
    return locations.slice(0, 3); // Ensure exactly 3 locations
}

// Set up location selection screen
async function setupLocationScreen() {
    // Display dog photo
    const locationPhotoImg = document.getElementById('location-dog-photo-img');
    locationPhotoImg.src = dogData.photo;
    document.getElementById('location-dog-photo-display').style.display = 'block';
    
    // Display dog's name
    document.getElementById('location-dog-name').textContent = dogData.name;
    
    // Hide error initially
    document.getElementById('location-error').style.display = 'none';
    document.getElementById('location-options').innerHTML = '';
    
    try {
        let locations;
        
        // Check if locations are already pre-generated
        if (preGeneratedLocations) {
            // Use pre-generated locations immediately!
            locations = preGeneratedLocations;
            console.log('Using pre-generated locations');
        } else if (locationGenerationPromise) {
            // Still generating, show loading and wait
            document.getElementById('location-loading').style.display = 'block';
            console.log('Waiting for location generation to complete...');
            await locationGenerationPromise;
            locations = preGeneratedLocations;
            document.getElementById('location-loading').style.display = 'none';
        } else {
            // Not generated yet, generate now
            document.getElementById('location-loading').style.display = 'block';
            console.log('Generating locations now...');
            locations = await generateLocationOptions();
            preGeneratedLocations = locations;
            document.getElementById('location-loading').style.display = 'none';
        }
        
        // Display location options
        displayLocationOptions(locations);
    } catch (error) {
        console.error('Error setting up locations:', error);
        document.getElementById('location-loading').style.display = 'none';
        document.getElementById('location-error').textContent = '⚠️ Failed to generate locations. Please try again.';
        document.getElementById('location-error').style.display = 'block';
    }
}

// Display location options as buttons
function displayLocationOptions(locations) {
    const container = document.getElementById('location-options');
    container.innerHTML = '';
    
    locations.forEach((location, index) => {
        const button = document.createElement('button');
        button.className = 'location-option';
        button.textContent = location;
        button.addEventListener('click', () => selectLocation(location));
        container.appendChild(button);
    });
}

// Handle location selection
function selectLocation(location) {
    selectedLocation = location;
    
    // Switch to game screen
    document.getElementById('location-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
    
    // Initialize game
    initializeGame();
}

// Generate the initial story
async function generateInitialStory() {
    const systemPrompt = buildSystemPrompt();
    const userPrompt = `Start ${dogData.name}'s adventure at ${selectedLocation}! Begin the story with ${dogData.name} arriving at this location. Reflect ${dogData.name}'s ${dogData.personality.join(' and ')} personality. Keep it SHORT - write exactly 5-6 sentences, then provide 2 choices for what ${dogData.name} does first.`;
    
    const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
    ];
    
    const response = await callOpenAI(messages);
    return parseStoryResponse(response);
}

// Continue the story based on user choice
async function continueStory(choice, isFinalChapter = false) {
    const systemPrompt = buildSystemPrompt();
    
    // Build conversation history
    const messages = [{ role: 'system', content: systemPrompt }];
    
    // Add story history
    storyHistory.forEach(entry => {
        messages.push({ role: 'assistant', content: entry.storyText });
        if (entry.choiceMade) {
            messages.push({ role: 'user', content: `${dogData.name} chooses: ${entry.choiceMade}` });
        }
    });
    
    // Add current choice
    if (isFinalChapter) {
        messages.push({ role: 'user', content: `${dogData.name} chooses: ${choice}. This is the FINAL chapter. Write a satisfying conclusion to ${dogData.name}'s adventure. Keep it SHORT - exactly 5-6 sentences maximum. End the story on a positive, uplifting note. DO NOT provide any choices - just end the story.` });
    } else {
        messages.push({ role: 'user', content: `${dogData.name} chooses: ${choice}. Continue the adventure with what happens next. Keep it SHORT - exactly 5-6 sentences maximum, then provide 2 new choices.` });
    }
    
    const response = await callOpenAI(messages);
    return parseStoryResponse(response, isFinalChapter);
}

// Parse the AI response to extract story and choices
function parseStoryResponse(response, isFinalChapter = false) {
    const lines = response.split('\n').filter(line => line.trim());
    let storyText = '';
    let choices = [];
    
    lines.forEach(line => {
        const choiceMatch = line.match(/CHOICE \d+:\s*(.+)/i);
        if (choiceMatch) {
            choices.push(choiceMatch[1].trim());
        } else if (line.trim() && !line.match(/^CHOICE/i)) {
            storyText += line.trim() + ' ';
        }
    });
    
    // If it's the final chapter, we don't need choices
    if (isFinalChapter) {
        return {
            story: storyText.trim(),
            choices: []
        };
    }
    
    // If we couldn't parse choices, create defaults
    if (choices.length === 0) {
        choices = [
            'Continue exploring',
            'Rest for a moment'
        ];
    }
    
    return {
        story: storyText.trim(),
        choices: choices.slice(0, 2) // Ensure exactly 2 choices
    };
}

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    setupUploadScreen();
    setupPersonalityCheckboxes();
    
    const form = document.getElementById('dog-questionnaire');
    form.addEventListener('submit', handleQuestionnaireSubmit);
    
    document.getElementById('restart-btn').addEventListener('click', restartGame);
    
    // Update button text when name changes
    const nameInput = document.getElementById('dog-name-welcome');
    if (nameInput) {
        nameInput.addEventListener('input', () => {
            // Only update button text if image is already uploaded
            const previewContainer = document.getElementById('image-preview-container');
            if (previewContainer.style.display !== 'none') {
                updateContinueButtonText();
            }
        });
    }
});

function setupPersonalityCheckboxes() {
    const checkboxes = document.querySelectorAll('input[name="dogPersonality"]');
    const errorMessage = document.getElementById('personality-error');
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const checked = document.querySelectorAll('input[name="dogPersonality"]:checked');
            
            // Limit to 3 selections
            if (checked.length > 3) {
                checkbox.checked = false;
                errorMessage.textContent = 'Please select no more than 3 traits.';
                errorMessage.style.display = 'block';
                setTimeout(() => {
                    errorMessage.style.display = 'none';
                }, 3000);
            } else if (checked.length === 0) {
                errorMessage.textContent = 'Please select at least 1 trait.';
                errorMessage.style.display = 'block';
            } else {
                errorMessage.style.display = 'none';
            }
        });
    });
}

function setupUploadScreen() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('dog-photo-input');
    const previewContainer = document.getElementById('image-preview-container');
    const previewImage = document.getElementById('image-preview');
    const continueBtn = document.getElementById('continue-btn');
    
    // Click to upload
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    });
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });
    
    // Setup change photo button (now inside image-controls)
    const changePhotoBtn = document.getElementById('change-photo-btn');
    changePhotoBtn.addEventListener('click', () => {
        previewContainer.style.display = 'none';
        uploadArea.style.display = 'block';
        fileInput.value = '';
        dogPhoto = null;
        editedDogPhoto = null;
        imageEditor.image = null;
    });
    
    continueBtn.addEventListener('click', () => {
        // Validate name is entered
        const nameInput = document.getElementById('dog-name-welcome');
        if (!nameInput.value.trim()) {
            alert('Please enter your dog\'s name before continuing.');
            nameInput.focus();
            return;
        }
        
        if (dogPhoto) {
            // Store the dog's name
            dogName = nameInput.value.trim();
            
            // Get the edited photo
            const finalPhoto = getEditedPhoto();
            
            // Move to questionnaire screen
            document.getElementById('welcome-screen').classList.remove('active');
            document.getElementById('questionnaire-screen').classList.add('active');
            
            // Display the edited photo in questionnaire
            const dogPhotoImg = document.getElementById('dog-photo-img');
            dogPhotoImg.src = finalPhoto;
            document.getElementById('dog-photo-display').style.display = 'block';
            
            // Populate dog's name in all questionnaire labels
            document.getElementById('dog-name-title').textContent = dogName;
            document.getElementById('dog-name-questionnaire').textContent = dogName;
            document.getElementById('dog-name-gender-label').textContent = dogName;
            document.getElementById('dog-name-personality-label').textContent = dogName;
            document.getElementById('dog-name-activity-label').textContent = dogName;
        }
    });
}

function handleFileUpload(file) {
    if (!file.type.startsWith('image/')) {
        alert('Please upload an image file (JPG, PNG, or WebP)');
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        dogPhoto = e.target.result;
        document.getElementById('upload-area').style.display = 'none';
        document.getElementById('image-preview-container').style.display = 'block';
        
        // Update continue button text with dog's name if provided
        updateContinueButtonText();
        
        // Initialize image editor
        initializeImageEditor(dogPhoto);
    };
    reader.readAsDataURL(file);
}

// Update the continue button text dynamically
function updateContinueButtonText() {
    const nameInput = document.getElementById('dog-name-welcome');
    const continueBtn = document.getElementById('continue-btn');
    const dogNameValue = nameInput.value.trim();
    
    if (dogNameValue) {
        continueBtn.textContent = `Tell us about ${dogNameValue}`;
    } else {
        continueBtn.textContent = 'Tell us about them';
    }
}


function initializeImageEditor(imageSrc) {
    const canvas = document.getElementById('image-canvas');
    const ctx = canvas.getContext('2d');
    
    imageEditor.canvas = canvas;
    imageEditor.ctx = ctx;
    
    // Set canvas size
    const ovalWidth = 200;
    const ovalHeight = 250;
    canvas.width = ovalWidth;
    canvas.height = ovalHeight;
    
    // Load image
    const img = new Image();
    img.onload = () => {
        imageEditor.image = img;
        
        // Calculate minimum scale to fit image height to oval height
        const scaleToFitHeight = (ovalHeight / img.height) * 100;
        imageEditor.minScale = Math.max(scaleToFitHeight, 10); // At least 10% minimum
        imageEditor.scale = Math.min(scaleToFitHeight, 200); // Cap initial at 200%
        
        // Center the image initially
        imageEditor.positionX = 0;
        imageEditor.positionY = 0;
        
        // Update slider min/max and value
        const scaleSlider = document.getElementById('scale-slider');
        const scaleValue = document.getElementById('scale-value');
        scaleSlider.min = Math.round(imageEditor.minScale);
        scaleSlider.max = 200;
        scaleSlider.value = Math.round(imageEditor.scale);
        scaleValue.textContent = Math.round(imageEditor.scale) + '%';
        
        updateCanvas();
        setupDragHandlers();
    };
    img.src = imageSrc;
    
    // Setup scale slider
    const scaleSlider = document.getElementById('scale-slider');
    const scaleValue = document.getElementById('scale-value');
    
    scaleSlider.addEventListener('input', (e) => {
        imageEditor.scale = parseInt(e.target.value);
        scaleValue.textContent = imageEditor.scale + '%';
        updateCanvas();
    });
}

function setupDragHandlers() {
    const canvas = imageEditor.canvas;
    
    canvas.addEventListener('mousedown', (e) => {
        imageEditor.isDragging = true;
        const rect = canvas.getBoundingClientRect();
        imageEditor.dragStartX = e.clientX - rect.left;
        imageEditor.dragStartY = e.clientY - rect.top;
        imageEditor.initialPositionX = imageEditor.positionX;
        imageEditor.initialPositionY = imageEditor.positionY;
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (!imageEditor.isDragging) return;
        
        const rect = canvas.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        
        // Calculate movement in pixels, convert to percentage
        const deltaX = currentX - imageEditor.dragStartX;
        const deltaY = currentY - imageEditor.dragStartY;
        
        // Convert pixel movement to percentage (canvas is 200x250)
        imageEditor.positionX = imageEditor.initialPositionX + (deltaX / canvas.width) * 100;
        imageEditor.positionY = imageEditor.initialPositionY + (deltaY / canvas.height) * 100;
        
        // Limit movement to reasonable bounds
        imageEditor.positionX = Math.max(-100, Math.min(100, imageEditor.positionX));
        imageEditor.positionY = Math.max(-100, Math.min(100, imageEditor.positionY));
        
        updateCanvas();
    });
    
    canvas.addEventListener('mouseup', () => {
        imageEditor.isDragging = false;
    });
    
    canvas.addEventListener('mouseleave', () => {
        imageEditor.isDragging = false;
    });
    
    // Touch support for mobile
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        imageEditor.isDragging = true;
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        imageEditor.dragStartX = touch.clientX - rect.left;
        imageEditor.dragStartY = touch.clientY - rect.top;
        imageEditor.initialPositionX = imageEditor.positionX;
        imageEditor.initialPositionY = imageEditor.positionY;
    });
    
    canvas.addEventListener('touchmove', (e) => {
        if (!imageEditor.isDragging) return;
        e.preventDefault();
        
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const currentX = touch.clientX - rect.left;
        const currentY = touch.clientY - rect.top;
        
        const deltaX = currentX - imageEditor.dragStartX;
        const deltaY = currentY - imageEditor.dragStartY;
        
        imageEditor.positionX = imageEditor.initialPositionX + (deltaX / canvas.width) * 100;
        imageEditor.positionY = imageEditor.initialPositionY + (deltaY / canvas.height) * 100;
        
        imageEditor.positionX = Math.max(-100, Math.min(100, imageEditor.positionX));
        imageEditor.positionY = Math.max(-100, Math.min(100, imageEditor.positionY));
        
        updateCanvas();
    });
    
    canvas.addEventListener('touchend', () => {
        imageEditor.isDragging = false;
    });
}

function updateCanvas() {
    const { canvas, ctx, image, scale, positionX, positionY } = imageEditor;
    
    if (!image) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Create clipping path for oval
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(canvas.width / 2, canvas.height / 2, canvas.width / 2, canvas.height / 2, 0, 0, 2 * Math.PI);
    ctx.clip();
    
    // Calculate image dimensions with scale
    const scaleFactor = scale / 100;
    const imgWidth = image.width * scaleFactor;
    const imgHeight = image.height * scaleFactor;
    
    // Calculate position (center + offset)
    const x = (canvas.width - imgWidth) / 2 + (positionX / 100) * canvas.width;
    const y = (canvas.height - imgHeight) / 2 + (positionY / 100) * canvas.height;
    
    // Draw image
    ctx.drawImage(image, x, y, imgWidth, imgHeight);
    
    ctx.restore();
    
    // Update the edited photo
    editedDogPhoto = canvas.toDataURL('image/png');
}

function getEditedPhoto() {
    // Return edited photo if available, otherwise return original
    return editedDogPhoto || dogPhoto;
}

function handleQuestionnaireSubmit(e) {
    e.preventDefault();
    
    // Get selected personality traits (up to 3)
    const selectedPersonalities = Array.from(document.querySelectorAll('input[name="dogPersonality"]:checked'))
        .map(cb => cb.value);
    
    // Validate at least 1 personality is selected
    if (selectedPersonalities.length === 0) {
        document.getElementById('personality-error').textContent = 'Please select at least 1 personality trait.';
        document.getElementById('personality-error').style.display = 'block';
        return;
    }
    
    // Collect form data (use dogName from welcome screen)
    dogData = {
        name: dogName, // Use the name captured on welcome screen
        gender: document.getElementById('dog-gender').value,
        personality: selectedPersonalities, // Now an array
        favoriteActivity: document.getElementById('dog-favorite-activity').value,
        photo: getEditedPhoto() // Include the edited/cropped photo
    };
    
    // Start generating personalized locations immediately (before showing screen)
    startLocationGeneration();
    
    // Switch to location selection screen
    document.getElementById('questionnaire-screen').classList.remove('active');
    document.getElementById('location-screen').classList.add('active');
    
    // Set up location selection screen
    setupLocationScreen();
}

// Start generating locations in the background (after we have dogData)
function startLocationGeneration() {
    // Only generate if not already generated or in progress
    if (!preGeneratedLocations && !locationGenerationPromise) {
        locationGenerationPromise = generateLocationOptions()
            .then(locations => {
                preGeneratedLocations = locations;
                console.log('Personalized locations generated:', locations);
            })
            .catch(error => {
                console.error('Error generating locations:', error);
                locationGenerationPromise = null;
            });
    }
}

async function initializeGame() {
    // Display dog info
    document.getElementById('dog-name-display').textContent = dogData.name;
    document.getElementById('dog-breed-display').textContent = `${dogData.personality.join(', ')} pup`;
    
    // Set up dog character
    setupDogCharacter();
    
    // Reset story state
    storyHistory = [];
    chapterCount = 1;
    decisionCount = 0;
    updateStats();
    
    // Generate and display initial story
    await startAdventure();
}

function setupDogCharacter() {
    const dogPhotoImg = document.getElementById('dog-photo-game-img');
    const dogPhotoContainer = document.getElementById('dog-photo-game');
    
    // Display the uploaded and edited dog photo
    if (dogData && dogData.photo) {
        dogPhotoImg.src = dogData.photo;
        dogPhotoImg.style.display = 'block';
    } else {
        dogPhotoImg.style.display = 'none';
    }
    
    // Use the first personality trait for primary behavior
    const primaryPersonality = Array.isArray(dogData.personality) ? dogData.personality[0] : dogData.personality;
    
    // Apply personality-based animation classes to the photo container
    const personalityClasses = Array.isArray(dogData.personality) 
        ? dogData.personality.join(' ') 
        : dogData.personality;
    dogPhotoContainer.className = `dog-photo-game ${personalityClasses}`;
    
    // Initial greeting based on primary personality
    const greetings = {
        playful: `Hi! I'm ${dogData.name}! Let's go on an adventure together!`,
        curious: `Hello! I'm ${dogData.name}. I wonder what we'll discover today!`,
        loyal: `Hi! I'm ${dogData.name}. I'm ready for our adventure!`,
        independent: `Hey! I'm ${dogData.name}. Let's see what today brings!`,
        friendly: `Hi there! I'm ${dogData.name}! I'm so excited for our adventure!`,
        calm: `Hello. I'm ${dogData.name}. Ready for a peaceful adventure.`
    };
    
    speak(greetings[primaryPersonality]);
}

// Start the adventure by generating initial story
async function startAdventure() {
    showLoading(true);
    
    try {
        const { story, choices } = await generateInitialStory();
        displayStory(story, choices);
        
        // Add to history
        storyHistory.push({
            storyText: story,
            choices: choices,
            choiceMade: null
        });
    } catch (error) {
        showError(error.message);
    } finally {
        showLoading(false);
    }
}

// Display story and choices
function displayStory(storyText, choices) {
    const storyContent = document.getElementById('story-content');
    const storyChoices = document.getElementById('story-choices');
    
    // Display story text
    storyContent.innerHTML = `<p>${storyText}</p>`;
    
    // Display choices
    storyChoices.innerHTML = '';
    choices.forEach((choice, index) => {
        const choiceButton = document.createElement('button');
        choiceButton.className = 'story-choice';
        choiceButton.textContent = choice;
        choiceButton.addEventListener('click', () => handleChoice(choice, index));
        storyChoices.appendChild(choiceButton);
    });
}

// Handle user's choice
async function handleChoice(choice, index) {
    // Update last history entry with choice made
    if (storyHistory.length > 0) {
        storyHistory[storyHistory.length - 1].choiceMade = choice;
    }
    
    // Increment decision count
    decisionCount++;
    updateStats();
    
    // Show loading
    showLoading(true);
    
    // Disable all choices
    document.querySelectorAll('.story-choice').forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
    });
    
    try {
        // Check if this is the final chapter (we're at chapter 5 before incrementing)
        const isFinalChapter = (chapterCount >= MAX_CHAPTERS);
        
        // Generate next part of story
        const { story, choices } = await continueStory(choice, isFinalChapter);
        
        // Increment chapter
        chapterCount++;
        updateStats();
        
        // Add to history
        storyHistory.push({
            storyText: story,
            choices: choices,
            choiceMade: null
        });
        
        if (isFinalChapter) {
            // Show final story with Complete Adventure button
            displayStory(story, []);
            speakFinalReaction();
            
            // Show Complete Adventure button
            showCompleteAdventureButton();
    } else {
            // Display new story segment
            displayStory(story, choices);
            
            // Update dog's speech with reaction
            speakReaction();
        }
    } catch (error) {
        showError(error.message);
        // Re-enable choices on error
        document.querySelectorAll('.story-choice').forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        });
    } finally {
        showLoading(false);
    }
}

// Show/hide loading indicator
function showLoading(show) {
    const loadingIndicator = document.getElementById('loading-indicator');
    const storyContent = document.getElementById('story-content');
    const storyChoices = document.getElementById('story-choices');
    
    if (show) {
        loadingIndicator.style.display = 'block';
        storyContent.style.display = 'none';
        storyChoices.style.display = 'none';
    } else {
        loadingIndicator.style.display = 'none';
        storyContent.style.display = 'block';
        storyChoices.style.display = 'flex';
    }
}

// Show error message
function showError(message) {
    const storyContent = document.getElementById('story-content');
    storyContent.innerHTML = `
        <div style="color: #dc3545; padding: 20px; background: #f8d7da; border-radius: 10px; border: 2px solid #dc3545;">
            <strong>⚠️ Oops! Something went wrong:</strong>
            <p>${message}</p>
            <p style="font-size: 0.9em; margin-top: 10px;">
                ${message.includes('API key') ? 
                    'Please add your OpenAI API key to config.js and refresh the page.' : 
                    'Please try again or restart the adventure.'}
            </p>
        </div>
    `;
    document.getElementById('story-choices').innerHTML = '';
}

// Dog speaks a reaction based on personality
function speakReaction() {
    const primaryPersonality = Array.isArray(dogData.personality) ? dogData.personality[0] : dogData.personality;
    
        const reactions = {
        playful: ["This is exciting!", "Woof! What's next?", "I love this adventure!", "Let's keep going!"],
        curious: ["Interesting choice!", "I wonder what will happen?", "Let's see where this leads!", "Fascinating!"],
        loyal: ["I'm with you!", "Let's do this together!", "I trust your choice!", "We've got this!"],
        independent: ["Good choice!", "I would have done the same!", "Let's see what happens!", "This'll be fun!"],
        friendly: ["Yay! This is fun!", "I'm having a great time!", "What an adventure!", "This is awesome!"],
        calm: ["Okay, let's continue.", "Sounds good to me.", "Alright, moving forward.", "Nice and steady."]
    };
    
    const reactionList = reactions[primaryPersonality] || reactions.friendly;
    const randomReaction = reactionList[Math.floor(Math.random() * reactionList.length)];
    speak(randomReaction);
}

// Dog speaks final reaction at end of adventure
function speakFinalReaction() {
    const primaryPersonality = Array.isArray(dogData.personality) ? dogData.personality[0] : dogData.personality;
    
    const finalReactions = {
        playful: "That was the best adventure ever! Can we do it again?! 🎉",
        curious: "What an amazing journey! I learned so much! 🌟",
        loyal: "I'm so glad we did this together. Thank you! ❤️",
        independent: "What a great adventure! I knew we could do it! 💪",
        friendly: "That was so much fun! I'll never forget this! 😊",
        calm: "That was a wonderful adventure. Very peaceful. 🌸"
    };
    
    speak(finalReactions[primaryPersonality] || finalReactions.friendly);
}

// Show Complete Adventure button after final chapter
function showCompleteAdventureButton() {
    const storyChoices = document.getElementById('story-choices');
    storyChoices.style.display = 'flex';
    storyChoices.innerHTML = '';
    
    const completeButton = document.createElement('button');
    completeButton.className = 'story-choice complete-adventure-btn';
    completeButton.textContent = '✨ Complete Adventure';
    completeButton.addEventListener('click', () => {
        showAdventureSummary();
    });
    
    storyChoices.appendChild(completeButton);
}

// Show adventure summary screen
function showAdventureSummary() {
    const storyContent = document.getElementById('story-content');
    const storyChoices = document.getElementById('story-choices');
    
    // Hide choices
    storyChoices.style.display = 'none';
    
    // Build summary HTML
    let summaryHTML = `
        <div class="adventure-summary">
            <h2>🎉 Adventure Complete! 🎉</h2>
            <p class="summary-intro">${dogData.name}'s quick adventure</p>
            <div class="summary-chapters">
    `;
    
    storyHistory.forEach((entry, index) => {
        summaryHTML += `
            <div class="summary-chapter">
                <h3>Chapter ${index + 1}</h3>
                <p class="chapter-story">${entry.storyText}</p>
                ${entry.choiceMade ? `<p class="chapter-choice">✨ <strong>Choice made:</strong> ${entry.choiceMade}</p>` : ''}
            </div>
        `;
    });
    
    summaryHTML += `
            </div>
            <div class="summary-stats">
                <p><strong>Total Chapters:</strong> ${chapterCount}</p>
                <p><strong>Decisions Made:</strong> ${decisionCount}</p>
            </div>
            <div class="summary-actions">
                <button class="btn-primary" id="share-to-gallery-btn">📚 Share to Gallery</button>
                <button class="btn-secondary" onclick="location.reload()">Start New Adventure</button>
            </div>
            <div id="share-status" class="share-status" style="display: none;"></div>
        </div>
    `;
    
    storyContent.innerHTML = summaryHTML;
    
    // Add event listener for share button
    document.getElementById('share-to-gallery-btn').addEventListener('click', shareToGallery);
}

// Share adventure to gallery
async function shareToGallery() {
    const shareBtn = document.getElementById('share-to-gallery-btn');
    const shareStatus = document.getElementById('share-status');
    
    // Disable button
    shareBtn.disabled = true;
    shareBtn.textContent = '📤 Sharing...';
    
    try {
        // Determine API endpoint
        const apiEndpoint = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:8888/.netlify/functions/save-adventure'
            : '/.netlify/functions/save-adventure';
        
        // Prepare adventure data
        const adventureData = {
            dogName: dogData.name,
            dogBreed: dogData.personality.join(', '),
            dogGender: dogData.gender,
            dogLocation: selectedLocation,
            dogPhoto: dogData.photo,
            chapters: storyHistory.map((entry, index) => ({
                number: index + 1,
                story: entry.storyText,
                choice: entry.choiceMade || null
            }))
        };
        
        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(adventureData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to share adventure');
        }
        
        const data = await response.json();
        
        // Show success message
        shareStatus.style.display = 'block';
        shareStatus.className = 'share-status success';
        shareStatus.innerHTML = `
            ✅ Adventure shared successfully!
            <a href="gallery.html" style="color: #667eea; text-decoration: underline; margin-left: 10px;">View Gallery</a>
        `;
        
        shareBtn.textContent = '✓ Shared!';
        shareBtn.style.background = '#28a745';
        
    } catch (error) {
        console.error('Error sharing adventure:', error);
        
        // Show error message
        shareStatus.style.display = 'block';
        shareStatus.className = 'share-status error';
        shareStatus.textContent = '❌ Failed to share adventure. Please try again.';
        
        // Re-enable button
        shareBtn.disabled = false;
        shareBtn.textContent = '📚 Share to Gallery';
    }
}

function updateStats() {
    document.getElementById('chapter-count').textContent = `${chapterCount} of 3`;
}

function speak(text) {
    const speechElement = document.getElementById('dog-speech');
    speechElement.textContent = text;
    
    // Add personality-based speech style (use first personality trait)
    const primaryPersonality = Array.isArray(dogData.personality) ? dogData.personality[0] : dogData.personality;
    speechElement.className = `dog-speech ${primaryPersonality}`;
}

function restartGame() {
    document.getElementById('game-screen').classList.remove('active');
    document.getElementById('location-screen').classList.remove('active');
    document.getElementById('questionnaire-screen').classList.remove('active');
    document.getElementById('welcome-screen').classList.add('active');
    document.getElementById('dog-questionnaire').reset();
    
    // Reset upload screen
    document.getElementById('upload-area').style.display = 'block';
    document.getElementById('image-preview-container').style.display = 'none';
    document.getElementById('dog-photo-input').value = '';
    
    // Reset name input on welcome screen
    document.getElementById('dog-name-welcome').value = '';
    
    // Reset story state
    storyHistory = [];
    chapterCount = 1;
    decisionCount = 0;
    selectedLocation = null;
    preGeneratedLocations = null;
    locationGenerationPromise = null;
    
    dogData = null;
    dogName = null;
    dogPhoto = null;
    editedDogPhoto = null;
    imageEditor.image = null;
}

