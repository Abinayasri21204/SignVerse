SignVerse
SignVerse is a web app that helps deaf and hard-of-hearing users communicate using American Sign Language (ASL). It recognizes signs via webcam, responds with a chatbot, and shows ASL videos with avatars.
Features

Detects ASL signs from your webcam.
Chatbot answers using text or avatar videos.
Supports voice ("Hey Alex"), text, or video input.
Easy-to-use interface with Avatar, Voice, and Text pages.

Setup

Clone the Project:
git clone https://github.com/your-username/signverse.git
cd signverse


Frontend:
cd frontend
npm install
npm start

Opens at http://localhost:3000.

Backend:
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install flask opencv-python cvzone moviepy
python app.py

Runs at http://localhost:5000.

Add API Keys:

In frontend/.env:REACT_APP_FIREBASE_API_KEY=your_key
REACT_APP_TOGETHER_API_KEY=your_key





Usage

Open http://localhost:3000 and log in.
Use the Avatar page to sign with your webcam.
Use the Voice page and say "Hey Alex" to talk.
Use the Text page to type questions.
See chatbot replies as text or avatar videos.

Technologies

Frontend: React, Material-UI
Backend: Flask, OpenCV, cvzone, moviepy
Services: Firebase, Together XYZ API

Contributing
Want to help? Fork the repo, make changes, and submit a pull request!
License
MIT License. See LICENSE for details.
