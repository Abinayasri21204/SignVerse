// src/speechRecognition.js
class SpeechRecognitionModule {
    constructor(onResult, onError) {
      this.recognition = null;
      this.isActive = false;
      this.silenceTimeout = null;
      this.onResult = onResult;
      this.onError = onError;
      this.initialize();
    }
  
    initialize() {
      if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
  
        this.recognition.onstart = () => {
          console.log("Speech recognition started");
          this.isActive = true;
        };
  
        this.recognition.onend = () => {
          console.log("Speech recognition ended");
          this.isActive = false;
          if (!this.isActive) {
            setTimeout(() => {
              if (!this.isActive && this.recognition) {
                console.log("Restarting speech recognition after end");
                this.recognition.start();
              }
            }, 100);
          }
        };
  
        this.recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('')
            .trim();
          console.log("Recognized speech:", transcript);
          this.onResult(transcript);
        };
  
        this.recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          this.onError(event.error);
          if (!this.isActive) {
            setTimeout(() => {
              if (!this.isActive && this.recognition) {
                console.log("Restarting speech recognition after error");
                this.recognition.start();
              }
            }, 100);
          }
        };
  
        if (!this.isActive) {
          console.log("Starting speech recognition...");
          this.recognition.start();
        }
      } else {
        console.error("SpeechRecognition API not supported in this browser.");
      }
    }
  
    stop() {
      if (this.recognition && this.isActive) {
        this.recognition.stop();
      }
      if (this.silenceTimeout) {
        clearTimeout(this.silenceTimeout);
        this.silenceTimeout = null;
      }
    }
  
    setSilenceTimeout(callback, delay) {
      if (this.silenceTimeout) {
        clearTimeout(this.silenceTimeout);
      }
      this.silenceTimeout = setTimeout(callback, delay);
    }
  }
  
  export default SpeechRecognitionModule;