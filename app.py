from flask import Flask, render_template, request, jsonify
from huggingface_hub import InferenceClient
from gtts import gTTS
from dotenv import load_dotenv
import speech_recognition as sr
import requests
import base64
import os

# Load environment variables from .env file
load_dotenv()

# Initialize flask
app = Flask(__name__)

# Initialize the Hugging Face model
HF_access_token = "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"
client = InferenceClient(model="mistralai/Mixtral-8x7B-Instruct-v0.1",token=HF_access_token)

# Spotify Initializations
CLIENT_ID = "f18d5f1bbc5c4f2bbdd24c33c8da38cf"
CLIENT_SECRET = "bc0bc31a06cd48b0aed581869d7f86f2"
SPOTIFY_API_URL = 'https://api.spotify.com/v1/'

# Pre-fill the system input
english_system_prompt = "Please answer the questions as concisely and politely as possible. You are virtually located at Fairfield University Campus, in Fairfield, CT."
# english_system_prompt = "You are virtually hosted at Fairfield University"
spanish_system_prompt = "Eres un útil asistente de IA. Por favor responda las preguntas de manera concisa y cortés. Está ubicado en el campus de la Universidad de Fairfield, en Fairfield, CT."
italian_system_prompt = "Sei un utile assistente AI. Si prega di rispondere alle domande in modo conciso e cortese. Ti trovi nel campus della Fairfield University, a Fairfield, CT."
french_system_prompt = "Vous êtes un assistant IA utile. Veuillez répondre aux questions de manière concise et polie. Vous êtes situé sur le campus de l'Université Fairfield, à Fairfield, CT."
german_system_prompt = "Sie sind ein hilfreicher KI-Assistent. Bitte beantworten Sie die Fragen prägnant und höflich. Sie befinden sich auf dem Fairfield University Campus in Fairfield, CT."

# Initialize conversation history
conversation_history = []

# List of valid buildings (replace with your actual data)
valid_buildings = ["Building A", "Building B", "Building C"]

def format_prompt(message, history):
    prompt = "<s>"
    for user_prompt, bot_response in history:
        prompt += f"[INST] {user_prompt} [/INST]"
        prompt += f" {bot_response}</s> "
    prompt += f"[INST] {message} [/INST]"
    return prompt

def generate_output(prompt, history, system_prompt):
    formatted_prompt = format_prompt(f"{system_prompt}, {prompt}", history)
    generate_kwargs = dict(
        temperature=0.15,
        max_new_tokens=512,
        top_p=0.9,
        repetition_penalty=1.0,
        do_sample=True,
        seed=42,
    )
    output = client.text_generation(formatted_prompt, **generate_kwargs)
    return output

@app.route('/')
def index():
    return render_template('index.html')

# Process Message Route - Normal Bot Response
@app.route('/process_message', methods=['POST'])
def process_message():
    user_input = request.json['message']
    selected_language = request.json['language']
    if selected_language == "english":
        system_prompt = english_system_prompt
    elif selected_language == "spanish":
        system_prompt = spanish_system_prompt
    elif selected_language == "french":
        system_prompt = french_system_prompt
    elif selected_language == "german":
        system_prompt = german_system_prompt
    elif selected_language == "italian":
        system_prompt = italian_system_prompt
    else:
        system_prompt = english_system_prompt

    bot_response = generate_output(user_input, conversation_history, system_prompt)
    conversation_history.append((user_input, bot_response))
    return jsonify({'response': bot_response})

# Clear Conversation History
@app.route('/clear_history', methods=['POST'])
def clear_history():
    global conversation_history
    conversation_history = []
    return jsonify({'success': True})

# Mapping Route
@app.route('/handle_mapping', methods=['POST'])
def handle_mapping():
    # Get the building name from the request JSON data
    data = request.get_json()
    building_name = data.get('building').lower()  # Convert to lowercase
    print(building_name)

    # Convert valid building names to lowercase for case-insensitive comparison
    valid_buildings_lower = [building.lower() for building in valid_buildings]

    # Validate the building name
    if building_name in valid_buildings_lower:
        # Building name is valid, prompt for ending location or perform further logic
        return jsonify({'status': 'success', 'message': 'Please enter the ending location.'})
    else:
        # Building name is not valid, send an error message
        return jsonify({'status': 'error', 'message': 'Invalid building name.'})


# Spotify Route
@app.route('/handle_spotify', methods=['POST'])
def handle_spotify():
    access_token = get_access_token()
    data = request.get_json()
    musicRequest = data.get('song')  # Convert to lowercase
    print(musicRequest)

    if access_token:
        headers = {
            'Authorization': 'Bearer {}'.format(access_token)
        }
        params = {
            'q': musicRequest,
            'type': 'track',
            'limit': 3
        }
        response = requests.get(SPOTIFY_API_URL + 'search', params=params, headers=headers)
        if response.status_code == 200:
            data = response.json()
            return jsonify(data['tracks']['items'])
        else:
            return jsonify({'status': 'Error', 'message': 'Unable to fetch serach results from spotify'})
    else:
            return jsonify({'status': 'Error', 'message': 'Unable to retrieve access token'})

def get_access_token():
    auth_header = base64.b64encode((CLIENT_ID + ':' + CLIENT_SECRET).encode('utf-8')).decode('utf-8')
    headers = {'Authorization': 'Basic {}'.format(auth_header)}
    data = {
        'grant_type': 'client_credentials',
    }
    response = requests.post('https://accounts.spotify.com/api/token', data=data, headers=headers)
    if response.status_code == 200:
        token_info = response.json()
        access_token = token_info['access_token']
        return access_token
    else:
        return None

@app.route('/play', methods=['POST'])
def play():
    track_id = request.form['track_id']
    access_token = get_access_token()

    if access_token:
        headers = {
            'Authorization': 'Bearer {}'.format(access_token)
        }
        response = requests.get(SPOTIFY_API_URL + 'tracks/{}'.format(track_id), headers=headers)
        if response.status_code == 200:
            data = response.json()
            preview_url = data.get('preview_url', "")
            return jsonify({"preview_url": preview_url})
        else:
            return "Error: Unable to fetch track preview from Spotify API"
    else:
        return "Error: Unable to retrieve access token"

if __name__ == '__main__':
    app.run(debug=True)
