let mapEnabled = false; // Flag to track if mapping is enabled
let spotifyEnabled = false; // Flag to track if spotify is enabled

function sendMessage() {
    // Hide sample questions buttons
    hideAdditionalButtons();

    // Determine route based on Map and Spotify flags
    if (mapEnabled) {
        // If mapping is enabled, handle mapping functionality
        handleMapping()
    } else if (spotifyEnabled) {
        // If spotify is enabled, handle spotify functionality
        var userInput = document.getElementById("user-input").value.trim();
        if (userInput !== "") {
            // Pass user input to Python Flask for processing
            sendSpotifyRequest(userInput);
        } else {
            updateAndDisplayMessage("Please enter a song title or artist.", false);
        }
    } else {
        var userInput = document.getElementById("user-input").value.trim();
        sendRegularMessage(userInput)
    }
    // Clear input field
    document.getElementById("user-input").value = "";
}


// ============================== Spotify ==============================
function toggleSpotify(){
    hideAdditionalButtons();
    spotifyEnabled = !spotifyEnabled
    mapEnabled = false;
    // Update the appearance of the buttons
    updateButtons(spotifyEnabled,mapEnabled)

    if (spotifyEnabled) {
        updateAndDisplayMessage("Please enter a song title or artist.", false);
    } else {
        updateAndDisplayMessage("Spotify turned off.", false);
    }

}
function sendSpotifyRequest(musicRequest) {
    // Display user's message immediately
    displayMessage(musicRequest, true);

    // Send user's message and selected language to server
    fetch('/handle_spotify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=UTF-8'
        },
        body: JSON.stringify({ song: musicRequest })
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Network response was not ok.');
        }
    })
    .then(responseData => {
        // Update bot's response
        displaySpotifyResults(responseData)
        console.log("Attempting to display results");
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
function displaySpotifyResults(results) {
    updateAndDisplayMessage("Here are the top 5 results for this query:");
    var chatList = document.querySelector(".chat");
    results.forEach(track => {
        var messageElement = document.createElement("li");
        messageElement.className = "message-music";

        // Create and append image element
        var imageElement = document.createElement("img");
        imageElement.src = track.image;
        imageElement.className = "play-btn";
        imageElement.dataset.id = track.preview_url; // Use preview URL as track ID
        imageElement.addEventListener("click", play);
        messageElement.appendChild(imageElement);

        // Create and append text content (track name and artist)
        var textElement = document.createElement("span");
        textElement.textContent = track.name + ' - ' + track.artist;
        messageElement.appendChild(textElement);

        chatList.appendChild(messageElement);
    });
}

function play() {
    const trackId = this.getAttribute('data-id');
    fetch('/play', {
        method: 'POST',
        body: new URLSearchParams({track_id: trackId}),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
    .then(response => response.json())
    .then(data => {
        const player = document.getElementById('player');
        player.innerHTML = '';
        if (data && data.preview_url) {
            const audio = document.createElement('audio');
            audio.controls = true;
            audio.src = data.preview_url;
            player.appendChild(audio);
            audio.play()
            audio.addEventListener('ended', function() {
                audio.currentTime = 0; // Reset audio to the beginning
                audio.play(); // Restart playback
            });
        } else {
            player.innerHTML = 'No preview available';
        }
    });
}


// ============================== Mapping ==============================
function toggleMap() {
    hideAdditionalButtons();
    mapEnabled = !mapEnabled; // Toggle the flag
    spotifyEnabled = false;
    updateButtons(spotifyEnabled,mapEnabled)
    // Display message in the chat area based on the state
    if (mapEnabled) {
        addLocationDropDown("start_location", false);
        addLocationDropDown("end_location", false);
    } else {
        updateAndDisplayMessage("Mapping turned off.", false);
    }
}
function addLocationDropDown(idAndName, isUserMessage) {
    var chatList = document.querySelector(".chat");
    var messageElement = document.createElement("li");
    messageElement.className = "message";
    var dropdownLabel = document.createElement("label");
    dropdownLabel.setAttribute("for", idAndName);
    dropdownLabel.textContent = "Select " + idAndName + " Location: ";
    messageElement.appendChild(dropdownLabel);
    chatList.appendChild(messageElement);

    var dropdown = document.createElement("select");
    dropdown.setAttribute("id", idAndName);
    dropdown.setAttribute("name", idAndName);
    dropdown.className = "location-dropdown";

    var locations = [
        "42 Langguth Road, West Langguth Road, 06824 Fairfield, Connecticut, United States",
        "Aloysius P. Kelley Center, Loyola Drive, 06824 Fairfield, United States",
        "Alumni Hall Sports Arena, Leeber Road, 06824 Fairfield, Connecticut, United States",
        "Alumni House, Stonkas Road, 06824 Fairfield, United States",
        "Alumni Softball Field, McCormick Road, 06824 Fairfield, United States",
        "Barlow Field, Barlow Road, 06824 Fairfield, United States",
        "Barone Campus Center, Loyola Drive, 06824 Fairfield, United States",
        "Bellarmine Hall, Fitzgerald Way, 06824 Fairfield, United States",
        "Campion Hall, McCormick Road, 06824 Fairfield, United States",
        "Canisius Hall, East Langguth Road, 06824 Fairfield, Connecticut, United States",
        "Center for Nursing and Health Studies, McInnes Road, 06824 Fairfield, United States",
        "Charles F Dolan School of Business, Bellarmine Road, 06824 Fairfield, CT, United States",
        "Claver Hall, Mahan Road, 06824 Fairfield, United States",
        "Conference Center at Fairfield University, Walters Way, 06824 Fairfield, United States",
        "David J Dolan House, Mooney Road, 06824 Fairfield, CT, United States",
        "DiMenna-Nyselius Library, McInnes Road, 06824 Fairfield, United States",
        "Donnarumma Hall, East Langguth Road, 06824 Fairfield, Connecticut, United States",
        "Egan Chapel of Saint Ignatius Loyola, Bellarmine Road, 06824 Fairfield, United States",
        "Faber Hall, Bellarmine Road, 06824 Fairfield, United States",
        "Gonzaga Hall, East Langguth Road, 06824 Fairfield, Connecticut, United States",
        "Jesuit Community Center, Bellarmine Road, 06824 Fairfield, United States",
        "Jogues Hall, McCormick Road, 06824 Fairfield, United States",
        "John C. Dolan Hall, Mooney Road, 06824 Fairfield, CT, United States",
        "Kelley Center Parking Garage, Leeber Road, 06824 Fairfield, Connecticut, United States",
        "Kostka Hall, Mahan Road, 06824 Fairfield, United States",
        "Lessing Field, Leeber Road, 06824 Fairfield, Connecticut, United States",
        "Loyola Hall, McCormick Road, 06824 Fairfield, United States",
        "Mahan Road, 06824 Fairfield, United States",
        "McAuliffe Hall, Ross Road, 06824 Fairfield, United States",
        "McCormick Road, 06824 Fairfield, United States",
        "Meditz Hall, McInnes Road, 06824 Fairfield, United States",
        "Rafferty Stadium, Lynch Road, 06824 Fairfield, United States",
        "Regina A Quick Center for the Arts, McInnes Road, 06824 Fairfield, CT, United States",
        "Regis Hall, East Langguth Road, 06824 Fairfield, Connecticut, United States",
        "Rudolph F. Bannow Science Center, McInnes Road, 06824 Fairfield, United States",
        "Student Townhouse Complex, Lynch Road, 06824 Fairfield, CT, United States",
        "The Levee, Lynch Road, 06824 Fairfield, CT, United States",
        "University Field, Leeber Road, 06824 Fairfield, Connecticut, United States",
        "Walsh Athletic Center, Lynch Road, 06824 Fairfield, United States"
    ];

    locations.forEach(function(location) {
        var option = document.createElement("option");
        option.setAttribute("value", location);
        option.textContent = location;
        dropdown.appendChild(option);
    });
    messageElement.appendChild(dropdown);
}

function handleMapping() {
    var start_location = document.getElementById("start_location").value
    var end_location = document.getElementById("end_location").value
    // Create an object with the data
    var data = {
        start_location: start_location,
        end_location: end_location
    };
    fetch('/handle_mapping', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=UTF-8'
        },
        body: JSON.stringify(data) // Pass the data object
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Network response was not ok.');
        }
    })
    .then(responseData => {
        // Update bot's response
        console.log("Attempting to display results");
        toggleMap();
        clearChat();
        // TODO: add walking and distance metrics
        console.log(responseData.message);
        displayMessage(responseData.message, false);
        displayMap(responseData);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
function displayMap(responseData){
    var chatList = document.querySelector(".chat");
    var messageElement = document.createElement("li");
    messageElement.className = "message";

    var mapContainer = document.createElement("iframe");
    mapContainer.srcdoc = responseData.map_html
    // var mapElement = document.createElement("iframe");
    // mapElement.innerHTML = responseData.map_html;
    messageElement.appendChild(mapContainer);
    chatList.appendChild(messageElement);
}


// ============================== Chatbot ==============================
function sendRegularMessage(userInput) {
    var languageSelect = document.getElementById("language-select");
    var selectedLanguage = languageSelect.value;

    if (userInput.trim() !== "") {
        // Display user's message immediately
        displayMessage(userInput, true);

        // Display loading message for bot response
        displayMessage("...", false);

        // Send user's message and selected language to server using fetch
        fetch('/process_message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8'
            },
            body: JSON.stringify({ message: userInput, language: selectedLanguage })
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Network response was not ok.');
            }
        })
        .then(responseData => {
            // Update bot's response
            updateBotResponse(responseData.response);
        })
        .catch(error => {
            console.error('Error:', error);
        });

        // Clear user input field
        document.getElementById("user-input").value = "";
    }
}

function hasCodeSnippet(message) {
    return /\```(?:[^```]+)\```/g.test(message);
}

// Function to convert message to HTML with code blocks
function convertMessageToHTML(message) {
    // Check if the message contains code snippets
    if (hasCodeSnippet(message)) {
        // Replace triple backticks with <pre><code> and </code></pre>
        message = message.replace(/```(.*?)```/gs, '<div class="code-wrapper"><pre><code>$1</code></pre></div>');
        return message
        // Split the message into parts before and after the code snippet
        // var parts = message.split(/```(.*?)```/gs);
        // var html = '';

        // // Loop through the parts and format them accordingly
        // for (var i = 0; i < parts.length; i++) {
        //     // Alternate between text and code snippet parts
        //     if (i % 2 === 0) {
        //         // Text before or after the code snippet
        //         html += '<div class="text">' + parts[i] + '</div>';
        //     } else {
        //         // Code snippet
        //         html += '<div class="code-wrapper"><pre><code>' + parts[i] + '</code></pre></div>';
        //     }
        // }

        // Return the formatted HTML
        // return html;
    } else {
        return message
    }
}

function updateBotResponse(botMessage) {
    // Find the loading message and replace it with the bot's response
    var loadingMessage = document.querySelector(".loading-message");
    if (loadingMessage) {
        if (hasCodeSnippet(botMessage)){
            // TODO: Need to fix how the code displays
            loadingMessage.innerHTML = convertMessageToHTML(botMessage);
            loadingMessage.classList.remove("loading-message");
        } else {
            loadingMessage.innerHTML = botMessage.trim();
            loadingMessage.classList.remove("loading-message");
        }
    } else {
        // If loading message is not found, add the bot's response
        displayMessage(botMessage, false);
    }
}

function displayMessage(message, isUserMessage) {
    var chatList = document.querySelector(".chat");

    // Display user's message or bot's response
    var messageElement = document.createElement("li");
    if (hasCodeSnippet(message)){
        messageElement.innerHTML = convertMessageToHTML(message);
        messageElement.className = "message" + (isUserMessage ? " user-message" : " loading-message");
        chatList.appendChild(messageElement);
    } else {
        messageElement.innerHTML = message;
        messageElement.className = "message" + (isUserMessage ? " user-message" : " loading-message");
        chatList.appendChild(messageElement);
    }
}

function updateAndDisplayMessage(message, isUserMessage){
    displayMessage(message, isUserMessage);
    updateBotResponse(message);
}


// ============================== New Chat ==============================
function startNewChat() {
    mapEnabled = false;
    spotifyEnabled = false;
    showAdditionalButtons();
    updateButtons(spotifyEnabled,mapEnabled);
    // Clear chat history on the client side
    clearChat();
    updateAndDisplayMessage("Hello, how can I assist you?", false);

    // Send a POST request to clear the conversation history on the server side
    fetch('/clear_history', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=UTF-8'
        }
    })
    .then(response => {
        if (response.ok) {
            console.log('Conversation history cleared.');
        } else {
            throw new Error('Failed to clear conversation history.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
    // Clear the audio player
    const player = document.getElementById('player');
    player.innerHTML = '';
}
function clearChat(){
    var chatList = document.querySelector(".chat");
    chatList.innerHTML = '';
}

function handleKeyDown(event) {
    if (event.key === "Enter") {
        event.preventDefault(); // Prevents the default Enter key behavior (like adding a new line)
        sendMessage(); // Calls the sendMessage function when Enter is pressed
    }
}


// ============================== Speech Recognition ==============================
function startSpeechRecognition() {
    var recognition = new window.webkitSpeechRecognition(); // Create a new SpeechRecognition object

    recognition.lang = "en-US"; // Set language to English (United States)

    recognition.onresult = function(event) { // When speech recognition is successful
        var transcript = event.results[0][0].transcript; // Get the recognized transcript
        document.getElementById("user-input").value = transcript; // Set the transcript as user input
        sendMessage(); // Call sendMessage function to process the input
    };

    recognition.onerror = function(event) { // If there's an error in speech recognition
        console.error("Speech recognition error:", event.error);
        alert("Error occurred in speech recognition. Please try again."); // Show an error message
    };

    recognition.onstart = function() { // When speech recognition starts
        document.getElementById("record-button").classList.add("active"); // Add "active" class to record button
    };

    recognition.onend = function() { // When speech recognition ends
        document.getElementById("record-button").classList.remove("active"); // Remove "active" class from record button
    };

    recognition.start(); // Start speech recognition
}

// ============================== Instructions ==============================
const instructions = `Start Conversation: Type your message in the text box and press 'Send' to start a conversation with the chatbot.\n
Voice Input: Click 'Record Speech' to speak instead of typing. The chatbot will transcribe and respond to your voice message. \n
Language Selection: Use the dropdown menu to select your preferred language for communication with the chatbot. \n
New Chat: Click 'New Chat' to start a new conversation and clear the chat history. \n
Spotify: Click the spotify button to toggle functionality \n
Map: Click the map button to toggle mapping functionality\n`
// Function to display the instructions
function addInstructions() {
    startNewChat();
    updateAndDisplayMessage(instructions,false);
    hideAdditionalButtons();
}


// ============================== Buttons ==============================
// Function to update the spotify and map buttons
function updateButtons(spotifyEnabled,mapEnabled) {
    // Update spotify button
    const spotifyButton = document.getElementById("spotify-button");
    spotifyButton.classList.toggle("active", spotifyEnabled); // Add or remove "active" class

    // Update map button
    const mapButton = document.getElementById("map-button");
    mapButton.classList.toggle("active", mapEnabled); // Add or remove "active" class
}
// Function to hide additional buttons
function hideAdditionalButtons() {
    var additionalButtons = document.getElementById("additional-buttons");
    additionalButtons.style.display = "none";
}
// Function to show additional buttons
function showAdditionalButtons() {
    var additionalButtons = document.getElementById("additional-buttons");
    additionalButtons.style.display = "block";
}
// Function to handle sample buttons
function handleSample(button){
    const question = button.innerText.trim(); // Get the inner text of the button
    hideAdditionalButtons();
    sendRegularMessage(question);
}
