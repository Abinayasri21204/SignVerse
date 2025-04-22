import os
import cv2
import moviepy.editor as mp
from flask import Flask, Response, jsonify, request, send_from_directory
from flask_cors import CORS
import time
import numpy as np
import math
from cvzone.HandTrackingModule import HandDetector
from cvzone.ClassificationModule import Classifier
import threading
import logging

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

cap = None
detector = HandDetector(maxHands=1)
classifier = Classifier("C:/Users/abina/Desktop/sign_language-main/src/Data Keras/keras_model.h5", 
                       "C:/Users/abina/Desktop/sign_language-main/src/Data Keras/labels.txt")

labels = ['Again', 'Backspace', 'Boring', 'Boy', 'Deaf', 'Doubt', 'Girl', 'Have', 'Hello', 'How', 'I',
         'I Love You', 'Sad', 'Thanks', 'You', 'Yes', 'No', 'Help', 'More', 'Need']
prediction_buffer = []
last_word = ""
confidence_threshold = 0.75
current_sentence = []
running = False
chatbot_response = ""  # This will be set by the frontend via /process_gloss_sentence

video_folder = "C:/Users/abina/Desktop/sign_language-main/src/Dataset/final avatar dataset"
output_folder = "static"
API_KEY = "b49688c1a8b81f6e2af5039126764bb90f47e3b47e6961c3007960bb42022cdb"  # Replace with your actual Together API key

if not os.path.exists(output_folder):
    os.makedirs(output_folder)

# Fixed target resolution for videos (matching frontend)
TARGET_WIDTH = 502
TARGET_HEIGHT = 857

def crop_video(input_path, output_path, target_width, target_height):
    try:
        clip = mp.VideoFileClip(input_path)
        # Calculate the cropping dimensions while preserving aspect ratio
        orig_width, orig_height = clip.w, clip.h
        target_aspect = target_width / target_height
        orig_aspect = orig_width / orig_height

        if orig_aspect > target_aspect:
            # Original is wider than target, crop width
            new_width = int(orig_height * target_aspect)
            x_center = orig_width / 2
            x1 = int(x_center - new_width / 2)
            x2 = int(x_center + new_width / 2)
            cropped_clip = clip.crop(x1=x1, x2=x2, y1=0, y2=orig_height)
        else:
            # Original is taller than target, crop height
            new_height = int(orig_width / target_aspect)
            y_center = orig_height / 2
            y1 = int(y_center - new_height / 2)
            y2 = int(y_center + new_height / 2)
            cropped_clip = clip.crop(x1=0, x2=orig_width, y1=y1, y2=y2)

        # Resize to exact target dimensions
        final_clip = cropped_clip.resize((target_width, target_height))
        final_clip.write_videofile(output_path, codec="libx264", fps=clip.fps, verbose=False, logger=None)
        logger.info(f"Video cropped and resized successfully: {output_path}")
    except Exception as e:
        logger.error(f"Error cropping video {input_path}: {e}")

def merge_videos(video_paths, output_path):
    try:
        clips = [mp.VideoFileClip(v) for v in video_paths]
        final_clip = mp.concatenate_videoclips(clips, method="compose")
        final_clip.write_videofile(output_path, codec="libx264", fps=30, verbose=False, logger=None)
        logger.info(f"Video merged successfully: {output_path}")
    except Exception as e:
        logger.error(f"Error merging videos: {e}")

def process_frame():
    global last_word, current_sentence, prediction_buffer, running
    logger.info("Starting frame processing thread")
    while running:
        if cap is None or not cap.isOpened():
            logger.warning("Camera not initialized or not opened")
            time.sleep(1)
            continue
        success, img = cap.read()
        if not success:
            logger.error("Failed to read frame from camera")
            continue
        hands, img = detector.findHands(img, draw=True)
        if hands:
            hand = hands[0]
            x, y, w, h = hand['bbox']
            imgWhite = np.ones((300, 300, 3), np.uint8) * 255
            imgCrop = img[max(0, y - 20): min(y + h + 20, img.shape[0]), max(0, x - 20): min(x + w + 20, img.shape[1])]
            if imgCrop.size == 0:
                logger.warning("Cropped image is empty")
                continue
            aspectRatio = h / w
            if aspectRatio > 1:
                k = 300 / h
                wCal = math.ceil(k * w)
                imgResize = cv2.resize(imgCrop, (wCal, 300))
                wGap = (300 - wCal) // 2
                imgWhite[:, wGap:wCal + wGap] = imgResize
            else:
                k = 300 / w
                hCal = math.ceil(k * h)
                imgResize = cv2.resize(imgCrop, (300, hCal))
                hGap = (300 - hCal) // 2
                imgWhite[hGap:hCal + hGap, :] = imgResize
            prediction, index = classifier.getPrediction(imgWhite, draw=False)
            if prediction[index] > confidence_threshold:
                prediction_buffer.append(labels[index])
            if len(prediction_buffer) > 10:
                most_common_sign = max(set(prediction_buffer), key=prediction_buffer.count)
                prediction_buffer = []
                if most_common_sign != last_word:
                    last_word = most_common_sign
                    if most_common_sign == 'Backspace':
                        if current_sentence:
                            current_sentence.pop()
                    else:
                        current_sentence.append(most_common_sign)
                    sentence = " ".join(current_sentence)
                    logger.info(f"Recognized Sign: {most_common_sign}, Sentence: {sentence}")
            cv2.putText(img, f"Sign: {last_word}", (x, y - 20), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            cv2.rectangle(img, (x - 20, y - 20), (x + w + 20, y + h + 20), (0, 255, 0), 2)
        yield img

def generate_frames():
    global running
    while running:
        frame = next(process_frame())
        ret, buffer = cv2.imencode('.jpg', frame)
        if not ret:
            continue
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/start_camera', methods=['GET'])
def start_camera():
    global cap, running
    if not running:
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            logger.error("Failed to open camera")
            return jsonify({"message": "Failed to open camera", "status": "error"}), 500
        running = True
        threading.Thread(target=process_frame, daemon=True).start()
        logger.info("Camera started successfully")
        return jsonify({"message": "Camera started successfully", "status": "success"})
    logger.info("Camera is already running")
    return jsonify({"message": "Camera is already running", "status": "success"})

@app.route('/stop_camera', methods=['GET'])
def stop_camera():
    global cap, running
    running = False
    if cap and cap.isOpened():
        cap.release()
        cap = None
    logger.info("Camera stopped successfully")
    return jsonify({"message": "Camera stopped successfully", "status": "success"})

@app.route('/predict', methods=['GET'])
def predict():
    global current_sentence, last_word, chatbot_response
    sentence = " ".join(current_sentence)
    logger.debug(f"Prediction requested: sign={last_word}, sentence={sentence}")
    return jsonify({"sign": last_word, "sentence": sentence, "chatbot_response": chatbot_response, "status": "success"})

@app.route('/reset', methods=['GET'])
def reset_sentence():
    global current_sentence, last_word, chatbot_response
    current_sentence = []
    last_word = ""
    chatbot_response = ""
    logger.info("Sentence reset successful")
    return jsonify({"message": "Sentence reset successful", "status": "success"})

@app.route('/process_gloss_sentence', methods=['POST'])
def process_gloss_sentence():
    global video_folder, output_folder, chatbot_response, TARGET_WIDTH, TARGET_HEIGHT
    gloss_sentence = request.json.get('sentence', '')
    if not gloss_sentence:
        logger.error("No sentence provided for video generation")
        return jsonify({"message": "No sentence provided", "status": "error"}), 400

    # Update chatbot_response with the provided sentence (chatbot output from frontend)
    chatbot_response = gloss_sentence

    logger.info(f"Processing gloss sentence: {gloss_sentence} with target size: {TARGET_WIDTH}x{TARGET_HEIGHT}")

    video_files = gloss_sentence.split()
    cropped_video_paths = []

    for word in video_files:
        video_path = os.path.join(video_folder, f"{word}.mp4")
        cropped_video_path = os.path.join(output_folder, f"cropped_{word}_{int(time.time())}.mp4")  # Unique filename
        if os.path.exists(video_path):
            crop_video(video_path, cropped_video_path, TARGET_WIDTH, TARGET_HEIGHT)
            cropped_video_paths.append(cropped_video_path)
        else:
            logger.warning(f"Warning: Video for '{word}' not found!")

    if cropped_video_paths:
        final_video_path = os.path.join(output_folder, f"final_output_{int(time.time())}.mp4")  # Unique filename
        merge_videos(cropped_video_paths, final_video_path)
        video_url = f"http://localhost:5001/static/{os.path.basename(final_video_path)}"
        logger.info(f"Video URL generated: {video_url}")
        return jsonify({"message": "Merged video created", "video_url": video_url, "status": "success"})
    else:
        logger.error("No videos to merge")
        return jsonify({"message": "No videos to merge", "status": "error"}), 400

@app.route('/static/<path:filename>')
def serve_video(filename):
    return send_from_directory(output_folder, filename)

if __name__ == '__main__':
    logger.info("Starting Flask server on port 5001")
    app.run(host='0.0.0.0', port=5001, debug=True)