**SignVerse** is an innovative web application designed to enhance communication for the deaf and hard-of-hearing community by leveraging American Sign Language (ASL). It integrates real-time sign language recognition, a responsive chatbot, and avatar-based sign video generation to provide a seamless and accessible user experience. The app supports multiple input methods (voice, text, and video) and outputs responses as text, avatar videos, or chatbot interactions, making communication inclusive and intuitive.

## Table of Contents
- [Features](#features)
- [Demo](#demo)
- [Technologies](#technologies)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Features
- **Real-Time Sign Language Recognition**: Uses computer vision to detect and interpret ASL gestures from webcam input, converting them to text or gloss sentences.
- **Interactive Chatbot**: Responds to voice, text, or sign inputs with natural language processing, generating text or avatar-based ASL video outputs.
- **Avatar Video Generation**: Creates 3D animated videos of ASL signs using processed chatbot responses, enhancing visual communication.
- **Multi-Modal Input**:
  - **Voice Input**: Triggered by the wake word "Hey Alex" using the browser's SpeechRecognition API.
  - **Text Input**: Allows users to type queries directly.
  - **Video Input**: Processes live webcam feeds for sign recognition.
- **Responsive UI**: Built with React and Material-UI, featuring a clean interface with pages for Avatar, Voice, and Text interactions.
- **Accessibility Focus**: Designed to meet digital accessibility standards for the deaf and hard-of-hearing community.


## Technologies
- **Frontend**:
  - React.js
  - Material-UI
  - React Router
  - Web Speech API
  - Tailwind CSS (optional, if used)
- **Backend**:
  - Flask (Python)
  - OpenCV (cv2)
  - cvzone
  - moviepy
- **APIs and Services**:
  - Firebase (Authentication and Database)
  - Together XYZ API (Chatbot functionality)
- **Other Tools**:
  - Blender (3D avatar animations)
  - Node.js (Development environment)
  - npm (Package management)

## Installation

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- npm
- Git
- A webcam for sign recognition
- Firebase account for authentication
- Together XYZ API key for chatbot functionality

### Steps
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/signverse.git
   cd signverse
   ```

2. **Set Up the Frontend**:
   ```bash
   cd frontend
   npm install
   ```
   - Ensure dependencies like `react-router-dom`, `@mui/material`, and `react-icons` are installed.

3. **Set Up the Backend**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install flask opencv-python cvzone moviepy
   ```

4. **Configure Environment Variables**:
   - Create a `.env` file in the `frontend` directory:
     ```env
     REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
     REACT_APP_TOGETHER_API_KEY=your_together_api_key
     ```
   - Create a `.env` file in the `backend` directory:
     ```env
     FLASK_APP=app.py
     FLASK_ENV=development
     ```

5. **Start the Development Servers**:
   - Frontend:
     ```bash
     cd frontend
     npm start
     ```
     The app will run at `http://localhost:3000`.
   - Backend:
     ```bash
     cd backend
     python app.py
     ```
     The Flask server will run at `http://localhost:5000`.

## Usage
1. **Access the App**:
   - Open `http://localhost:3000` in your browser.
   - Log in using Firebase authentication.

2. **Interact with SignVerse**:
   - **Avatar Page**: Use the webcam to input signs, view real-time predictions, and watch avatar videos generated from chatbot responses.
   - **Voice Page**: Say "Hey Alex" to trigger voice input and receive text or avatar-based responses.
   - **Text Page**: Type queries to interact with the chatbot and view responses.

3. **Sign Recognition**:
   - Ensure your webcam is enabled.
   - Perform ASL gestures in front of the camera to see predictions displayed in the UI.

4. **Avatar Videos**:
   - Chatbot responses are converted to gloss sentences and rendered as 3D avatar videos, displayed in the Avatar section.

## Project Structure
```
signverse/
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/
│   │   │   ├── GestureBot.js
│   │   │   ├── LandingPage.js
│   │   │   ├── AvatarPage.js
│   │   │   ├── VoicePage.js
│   │   │   └── TextPage.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── reportWebVitals.js
│   ├── package.json
│   └── .env
├── backend/
│   ├── app.py
│   ├── sign.py  # Previously capture.py
│   ├── speech_server.py
│   └── .env
├── README.md
└── LICENSE
```

## Contributing
We welcome contributions to SignVerse! To contribute:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Make your changes and commit (`git commit -m "Add your feature"`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a Pull Request with a detailed description of your changes.

Please follow our [Code of Conduct](CODE_OF_CONDUCT.md) and ensure your code adheres to the project's style guidelines.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact
For questions or feedback, reach out to:
- **Project Maintainer**: [Your Name] (your.email@example.com)
- **GitHub Issues**: [SignVerse Issues](https://github.com/your-username/signverse/issues)
- **Project Website**: [SignVerse](https://example.com) <!-- Replace with actual website if available -->

---

Built with ❤️ by the SignVerse team to make communication accessible for all.
