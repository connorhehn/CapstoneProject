function sendMessage() {
    var userInput = document.getElementById("user-input").value;
    var languageSelect = document.getElementById("language-select");
    var selectedLanguage = languageSelect.value;

    if (userInput.trim() !== "") {
        // Display user's message immediately
        displayMessage(userInput, true);

        // Display loading message for bot response
        displayMessage("...", false);

        // Send user's message and selected language to server
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/process_message", true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.onload = function () {
            if (xhr.status === 200) {
                var responseData = JSON.parse(xhr.responseText);
                // Update bot's response
                updateBotResponse(responseData.response);
            }
        };
        xhr.send(JSON.stringify({ message: userInput, language: selectedLanguage }));
        document.getElementById("user-input").value = "";
    }
}

function updateBotResponse(botMessage) {
    // Find the loading message and replace it with the bot's response
    var loadingMessage = document.querySelector(".loading-message");
    if (loadingMessage) {
        loadingMessage.textContent = botMessage;
        loadingMessage.classList.remove("loading-message");
    } else {
        // If loading message is not found, add the bot's response
        displayMessage(botMessage, false);
    }
}

function displayMessage(message, isUserMessage) {
    var chatList = document.querySelector(".chat");

    // Display user's message or bot's response
    var messageElement = document.createElement("li");
    messageElement.textContent = message;
    messageElement.className = "message" + (isUserMessage ? " user-message" : " loading-message");
    chatList.appendChild(messageElement);
}

function startNewChat() {
    // Clear chat history on the client side
    var chatList = document.querySelector(".chat");
    chatList.innerHTML = '';

    // Send a POST request to clear the conversation history on the server side
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/clear_history", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onload = function () {
        if (xhr.status === 200) {
            console.log("Conversation history cleared.");
        }
    };
    xhr.send();
}

function handleKeyDown(event) {
    if (event.key === "Enter") {
        event.preventDefault(); // Prevents the default Enter key behavior (like adding a new line)
        sendMessage(); // Calls the sendMessage function when Enter is pressed
    }
}
