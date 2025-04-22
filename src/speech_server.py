from flask import Flask, jsonify, request
from flask_cors import CORS
import speech_recognition as sr
from threading import Thread, Event
import time

app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin requests

recognizer = sr.Recognizer()
mic = sr.Microphone()
is_recording = False
stop_event = Event()
recognized_text = ""
trigger_phrase = "hey alex"

def listen_to_speech():
    global is_recording, recognized_text
    with mic as source:
        recognizer.adjust_for_ambient_noise(source, duration=1)
        print("Listening for trigger phrase 'Hey Alex'...")
        while not stop_event.is_set():
            try:
                # Listen continuously for audio
                audio = recognizer.listen(source, timeout=None, phrase_time_limit=5)
                text = recognizer.recognize_google(audio).lower()
                print(f"Recognized: {text}")

                # Check for trigger phrase
                if trigger_phrase in text and not is_recording:
                    is_recording = True
                    recognized_text = ""
                    print("Trigger detected, now listening for command...")
                    continue

                # If triggered, process the command
                if is_recording:
                    command = text.replace(trigger_phrase, "").strip()
                    if command:
                        recognized_text = command
                        print(f"Command recognized: {recognized_text}")
                    # Stop recording after command (silence will be handled by phrase_time_limit)
                    time.sleep(1)  # Brief pause to ensure no overlap
                    is_recording = False
                    print("Stopped listening for command, waiting for trigger again...")

            except sr.WaitTimeoutError:
                continue  # No speech detected within timeout
            except sr.UnknownValueError:
                print("Could not understand audio")
                if is_recording:
                    recognized_text = ""
                    is_recording = False
            except sr.RequestError as e:
                print(f"Speech recognition error: {e}")
                recognized_text = ""
                is_recording = False
            except Exception as e:
                print(f"Unexpected error: {e}")
                is_recording = False
                break

@app.route('/start_speech', methods=['POST'])
def start_speech():
    global is_recording, recognized_text
    if not stop_event.is_set():
        is_recording = False  # Reset to wait for trigger
        recognized_text = ""
        stop_event.clear()
        Thread(target=listen_to_speech, daemon=True).start()
        return jsonify({"status": "success", "message": "Started speech recognition"})
    return jsonify({"status": "error", "message": "Already running"})

@app.route('/stop_speech', methods=['POST'])
def stop_speech():
    global is_recording
    if not stop_event.is_set():
        stop_event.set()
        is_recording = False
        time.sleep(1)  # Allow thread to finish
        return jsonify({"status": "success", "message": "Stopped speech recognition", "text": recognized_text})
    return jsonify({"status": "error", "message": "Not running"})

@app.route('/get_speech', methods=['GET'])
def get_speech():
    return jsonify({"status": "success", "text": recognized_text, "is_recording": is_recording})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)