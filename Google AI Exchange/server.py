from flask import Flask, request, jsonify, render_template
import requests
import os
from groq import Groq
from googlesearch import search
import datetime
from dotenv import dotenv_values
from json import load, dump

app = Flask(__name__)

# Load environment variables from a .env file for security
env_vars = dotenv_values(".env")
GroqAPIKey = env_vars.get("GroqAPIKey")

# Initialize the Groq client
client = Groq(api_key=GroqAPIKey)

# Define the system instructions for the chatbot
System = "You are a very accurate and advanced AI chatbot which has real-time up-to-date information from the internet. Provide answers professionally with proper grammar, and just answer the question from the provided data."

# Try to load previous chat logs
try:
    with open(r"Data/ChatLog.json", "r") as f:
        messages = load(f)
except:
    # Create the Data directory and an empty ChatLog.json if they don't exist
    os.makedirs(r"Data", exist_ok=True)
    with open(r"Data/ChatLog.json", "w") as f:
        dump([], f)
    messages = []

# Function to perform a Google search
def GoogleSearch(query):
    results = list(search(query, advanced=True, num_results=5))
    Answer = f"The search results for '{query}' are:\n[start]\n"
    for i in results:
        Answer += f"Title: {i.title}\nDescription: {i.description}\n\n"
    Answer += "[end]"
    return Answer

# Function to fetch current real-time information
def Information():
    current_date_time = datetime.datetime.now()
    day = current_date_time.strftime("%A")
    date = current_date_time.strftime("%d")
    month = current_date_time.strftime("%B")
    year = current_date_time.strftime("%Y")
    hour = current_date_time.strftime("%H")
    minute = current_date_time.strftime("%M")
    second = current_date_time.strftime("%S")
    
    data = f"Use This Real Time Information if needed: \n"
    data += f"Day: {day}\n"
    data += f"Date: {date}\n"
    data += f"Month: {month}\n"
    data += f"Year: {year}\n"
    data += f"Time: {hour} hours, {minute} minutes, {second} seconds.\n"
    return data

# Function to handle real-time search and completion with Groq API
def RealtimeSearchEngine(prompt):
    global messages

    # Perform Google search and append to the system instructions for the Groq call
    SystemChatBot = [
        {"role": "system", "content": System},
        {"role": "system", "content": GoogleSearch(prompt)},
        {"role": "system", "content": Information()}
    ]

    # Perform Groq API call for completion
    completion = client.chat.completions.create(
        model="llama3-70b-8192",
        messages=SystemChatBot + [{"role": "user", "content": prompt}],
        temperature=0.7,
        max_tokens=2048,
        top_p=1,
        stream=False,
        stop=None
    )

    Answer = completion.choices[0].message.content
    Answer = Answer.strip().replace("</s>", "")

    return Answer

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/check-misinformation", methods=["POST"])
def check_misinformation_endpoint():
    try:
        data = request.json
        query = data.get("text")
        
        if not query:
            return jsonify({"error": "No text provided"}), 400

        # Use your real-time search engine function
        response_text = RealtimeSearchEngine(query)
        
        # A simple keyword check to see if the AI's response is an unsure/neutral response
        if "I cannot verify this information" in response_text or "I do not have enough information" in response_text:
            return jsonify({"status": "neutral", "message": response_text})
        
        # In a real app, you would have the AI provide a "true" or "false" verdict directly.
        # For this prototype, we'll assume any definitive answer is a check.
        return jsonify({"status": "verified", "message": response_text})

    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({"error": "An unexpected server error occurred"}), 500

if __name__ == "__main__":
    app.run(debug=True)