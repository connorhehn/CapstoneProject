from flask import Flask, render_template, request, jsonify
from huggingface_hub import InferenceClient
from gtts import gTTS
import speech_recognition as sr
import os

app = Flask(__name__)

# app = Flask(__name__, static_url_path='/static')

# Initialize the Hugging Face model
client = InferenceClient("mistralai/Mixtral-8x7B-Instruct-v0.1")

# Pre-fill the system input
english_system_prompt = "You are a helpful AI assistant. Please answer the questions concisely and politely. You are located at Fairfield University Campus, in Fairfield, CT."
spanish_system_prompt = "Eres un útil asistente de IA. Por favor responda las preguntas de manera concisa y cortés. Está ubicado en el campus de la Universidad de Fairfield, en Fairfield, CT."
italian_system_prompt = "Sei un utile assistente AI. Si prega di rispondere alle domande in modo conciso e cortese. Ti trovi nel campus della Fairfield University, a Fairfield, CT."
french_system_prompt = "Vous êtes un assistant IA utile. Veuillez répondre aux questions de manière concise et polie. Vous êtes situé sur le campus de l'Université Fairfield, à Fairfield, CT."
german_system_prompt = "Sie sind ein hilfreicher KI-Assistent. Bitte beantworten Sie die Fragen prägnant und höflich. Sie befinden sich auf dem Fairfield University Campus in Fairfield, CT."

conversation_history = []


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
        max_new_tokens=256,
        top_p=0.9,
        repetition_penalty=1.0,
        do_sample=True,
        seed=42,
    )
    output = client.text_generation(formatted_prompt, **generate_kwargs)
    return output

# Your chatbot logic goes here (this is just a placeholder)
def get_chatbot_response(user_input):
    # You need to implement your chatbot logic here
    # For now, let's just echo back the user's input
    return "hello world!"

@app.route('/')
def index():
    return render_template('index.html')

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

    print(selected_language)
    bot_response = generate_output(user_input, conversation_history, system_prompt)
    conversation_history.append((user_input, bot_response))
    return jsonify({'response': bot_response})


@app.route('/clear_history', methods=['POST'])
def clear_history():
    global conversation_history
    print(conversation_history)
    conversation_history = []
    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(debug=True)
