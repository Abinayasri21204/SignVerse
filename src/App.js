import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Typography, Avatar, Button, TextField, Paper, IconButton, CircularProgress, AppBar, Toolbar,
  List, ListItem, ListItemText, ListItemSecondaryAction, Divider, Dialog, DialogTitle, DialogContent,
  DialogActions, Menu, MenuItem, InputAdornment,
} from '@mui/material';
import { styled } from '@mui/system';
import DeleteIcon from '@mui/icons-material/Delete';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { auth, db } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import pfpImage from './Pages/Pics/pfp.png';
import avatarImage from './Pages/Pics/avatar.jpeg';

const Container = styled(Box)({
  display: 'flex',
  height: 'calc(100vh - 64px)',
  flexDirection: 'row',
  marginTop: '64px',
});

const LeftSection = styled(Box)({
  width: '30%',
  backgroundColor: '#F5F5F5',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
  overflowY: 'auto',
});

const MiddleSection = styled(Paper)({
  width: '50%',
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
});

const RightSection = styled(Box)({
  width: '20%',
  backgroundColor: '#F5F5F5',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
  overflowY: 'auto',
});

const VideoContainer = styled(Box)({
  position: 'relative',
  width: '100%',
  '&:hover .video-controls': {
    opacity: 1,
  },
});

const VideoPlayer = styled('video')({
  width: '100%',
  height: '857px',
  borderRadius: '8px',
  marginTop: '20px',
  backgroundColor: '#E0E0E0',
  objectFit: 'cover',
});

const VideoControls = styled(Box)({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  opacity: 0,
  transition: 'opacity 0.2s ease',
  display: 'flex',
  gap: '10px',
});

const ControlButton = styled(IconButton)({
  backgroundColor: 'rgba(0, 122, 204, 0.8)',
  color: 'white',
  '&:hover': {
    backgroundColor: 'rgba(0, 95, 158, 0.8)',
  },
});

const ChatContainer = styled(Box)({
  flexGrow: 1,
  overflowY: 'auto',
  padding: '20px 20px 20px 20px',
  display: 'flex',
  flexDirection: 'column',
});

const MessageBubble = styled(Box)(({ isUser }) => ({
  maxWidth: '60%',
  padding: '10px 15px',
  margin: '10px 10px',
  borderRadius: '12px',
  backgroundColor: isUser ? '#007ACC' : '#E0E0E0',
  color: isUser ? 'white' : 'black',
  alignSelf: isUser ? 'flex-end' : 'flex-start',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  position: 'relative',
  '&:hover .message-actions': {
    opacity: 1,
  },
}));

const MessageActions = styled(Box)({
  position: 'absolute',
  bottom: '5px',
  right: '5px',
  display: 'flex',
  gap: '5px',
  opacity: 0,
  transition: 'opacity 0.2s ease',
});

const GeneratingBubble = styled(Box)({
  alignSelf: 'flex-start',
  padding: '10px 15px',
  margin: '10px 10px',
  display: 'flex',
  alignItems: 'center',
});

const InputContainer = styled(Box)({
  position: 'sticky',
  bottom: 0,
  left: 0,
  right: 0,
  padding: '10px 20px',
  backgroundColor: '#FFFFFF',
  borderTop: '1px solid #E0E0E0',
  display: 'flex',
  alignItems: 'center',
  zIndex: 1,
});

const LongTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: '20px',
    backgroundColor: '#F0F0F0',
    paddingRight: '40px',
    transition: 'all 0.3s ease',
  },
  flexGrow: 1,
});

const WaveformAnimation = styled(Box)({
  height: '40px',
  width: '100%',
  background: 'linear-gradient(90deg, #007ACC 0%, #E0E0E0 100%)',
  borderRadius: '20px',
  animation: 'waveform 1s infinite',
  '@keyframes waveform': {
    '0%': { transform: 'scaleY(1)' },
    '50%': { transform: 'scaleY(1.5)' },
    '100%': { transform: 'scaleY(1)' },
  },
});

const SmallSendButton = styled(Button)({
  borderRadius: '20px',
  backgroundColor: '#007ACC',
  color: 'white',
  padding: '10px',
  minWidth: '60px',
  textTransform: 'none',
  marginLeft: '10px',
  '&:hover': {
    backgroundColor: '#005F9E',
  },
});

const ClearChatButton = styled(Button)({
  borderRadius: '20px',
  backgroundColor: '#FF4444',
  color: 'white',
  padding: '10px 20px',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: '#CC0000',
  },
});

const CameraPlaceholder = styled(Box)({
  width: '100%',
  height: '350px',
  backgroundColor: '#E0E0E0',
  borderRadius: '8px',
  marginBottom: '20px',
  position: 'relative',
  overflow: 'hidden',
});

const VideoStream = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: '8px',
  position: 'absolute',
  top: 0,
  left: 0,
});

const FancyCameraButton = styled(Button)({
  position: 'absolute',
  bottom: 16,
  right: 16,
  borderRadius: '25px',
  padding: '12px 24px',
  background: 'linear-gradient(45deg, #007ACC 30%, #00BCD4 90%)',
  color: 'white',
  boxShadow: '0 3px 5px 2px rgba(0, 122, 204, .3)',
  '&:hover': {
    background: 'linear-gradient(45deg, #005F9E 30%, #00ACC1 90%)',
  },
});

const StyledAppBar = styled(AppBar)({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  backgroundColor: '#007ACC',
  height: '64px',
  display: 'flex',
  justifyContent: 'center',
});

const SmallRoundButton = styled(IconButton)({
  borderRadius: '50%',
  width: '40px',
  height: '40px',
  backgroundColor: '#FFFFFF',
  color: '#007ACC',
  '&:hover': {
    backgroundColor: '#E0E0E0',
  },
});

const VideoTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: '20px',
    backgroundColor: '#F0F0F0',
  },
  width: '100%',
  marginBottom: '8px',
});

const renderContent = (content, highlightedIndex, isUser) => {
  const lines = content.split('\n');
  return lines.map((line, index) => {
    const isHighlighted = index === highlightedIndex;
    if (line.startsWith('*') && line.endsWith('*') && line.length > 2) {
      const text = line.slice(1, -1);
      return (
        <Typography key={index} variant="subtitle1" sx={{ fontWeight: 'bold', color: isUser ? 'white' : 'black', mb: 1, backgroundColor: isHighlighted ? 'rgba(255, 255, 0, 0.5)' : 'transparent' }}>
          {text}
        </Typography>
      );
    }
    if (line.startsWith('----') && line.endsWith('----') && line.length > 8) {
      const text = line.slice(4, -4);
      return (
        <Typography key={index} variant="h6" sx={{ fontWeight: 'bold', color: isUser ? 'white' : 'black', mb: 1, backgroundColor: isHighlighted ? 'rgba(255, 255, 0, 0.5)' : 'transparent' }}>
          {text}
        </Typography>
      );
    }
    return (
      <Typography key={index} variant="body1" sx={{ color: isUser ? 'white' : 'black', mb: line.match(/^\d+\.\s|-\s/) ? 1 : 0, backgroundColor: isHighlighted ? 'rgba(255, 255, 0, 0.5)' : 'transparent' }}>
        {line}
      </Typography>
    );
  });
};

function App() {
  const [user, setUser] = useState(null);
  const [openAuthDialog, setOpenAuthDialog] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('anonymousChat');
    return saved ? JSON.parse(saved) : [];
  });
  const [messageInput, setMessageInput] = useState('');
  const [videoInput, setVideoInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openNewChatDialog, setOpenNewChatDialog] = useState(false);
  const [newChatName, setNewChatName] = useState('');
  const [speakingMessageIndex, setSpeakingMessageIndex] = useState(null);
  const [highlightedLineIndex, setHighlightedLineIndex] = useState(-1);
  const [avatarVideoUrl, setAvatarVideoUrl] = useState(null);
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVoiceInput, setIsVoiceInput] = useState(false); // New state to track voice input
  const messageContainerRef = useRef(null);
  const videoRef = useRef(null);
  const videoPlayerRef = useRef(null);
  const speechSynthesisRef = useRef(window.speechSynthesis);
  const speechPollIntervalRef = useRef(null);
  const lastSpeechTextRef = useRef(''); // Track last processed speech

  const handleSpeakMessage = useCallback((content, messageIndex) => {
    if (speechSynthesisRef.current.speaking) {
      speechSynthesisRef.current.cancel();
      setSpeakingMessageIndex(null);
      setHighlightedLineIndex(-1);
      return Promise.resolve();
    }

    setSpeakingMessageIndex(messageIndex);
    const lines = content.split('\n').filter(line => line.trim());
    let currentLineIndex = 0;

    const speakLine = () => {
      if (currentLineIndex >= lines.length) {
        setSpeakingMessageIndex(null);
        setHighlightedLineIndex(-1);
        return Promise.resolve();
      }

      return new Promise((resolve) => {
        const utterance = new SpeechSynthesisUtterance(lines[currentLineIndex]);
        utterance.onstart = () => {
          setHighlightedLineIndex(currentLineIndex);
        };
        utterance.onend = () => {
          currentLineIndex++;
          speakLine().then(resolve);
        };
        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event);
          setSpeakingMessageIndex(null);
          setHighlightedLineIndex(-1);
          resolve();
        };
        speechSynthesisRef.current.speak(utterance);
      });
    };

    return speakLine();
  }, []);

  const handleSendMessage = useCallback(async (input = messageInput, viaVoice = false) => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    let updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setMessageInput("");
    setIsGenerating(true);
    setIsVoiceInput(viaVoice); // Set voice input flag

    if (user && selectedChat) {
      const chatRef = doc(db, "chats", user.uid, "chatBot", selectedChat.id);
      await updateDoc(chatRef, { messages: updatedMessages });
    }

    const apiKey = process.env.REACT_APP_TOGETHER_API_KEY || "b49688c1a8b81f6e2af5039126764bb90f47e3b47e6961c3007960bb42022cdb";
    if (apiKey === "your-api-key-here") {
      console.error("API key is not set. Please provide a valid API key.");
      setMessages([...updatedMessages, { role: "assistant", content: "Error: API key not configured." }]);
      setIsGenerating(false);
      return;
    }

    try {
      const response = await fetch("https://api.together.xyz/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            ...updatedMessages,
          ],
          max_tokens: 1024,
          temperature: 0.7,
          top_p: 0.7,
          top_k: 50,
          repetition_penalty: 1.0,
          stop: ["<|eot_id|>", "<|eom_id|>"],
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiMessageContent = "";
      let aiMessageIndex = updatedMessages.length;

      updatedMessages = [...updatedMessages, { role: "assistant", content: "" }];
      setMessages(updatedMessages);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((line) => line.trim() !== "");

        for (const line of lines) {
          if (line.startsWith("data: ") && line !== "data: [DONE]") {
            try {
              const data = JSON.parse(line.slice(6));
              const content = data.choices?.[0]?.delta?.content;
              if (content) {
                aiMessageContent += content;
                const formattedContent = aiMessageContent
                  .replace(/\*([^*]+)\*/g, "$1")
                  .replace(/----([^-]+)----/g, "$1")
                  .replace(/(\d+\.\s|-\s)/g, "\n$1");
                updatedMessages[aiMessageIndex] = {
                  role: "assistant",
                  content: formattedContent,
                };
                setMessages([...updatedMessages]);
              }
            } catch (error) {
              console.error("Error parsing streaming chunk:", error, "Chunk:", line);
            }
          }
        }
      }

      if (aiMessageContent) {
        const formattedContent = aiMessageContent
          .replace(/\*([^*]+)\*/g, "$1")
          .replace(/----([^-]+)----/g, "$1")
          .replace(/(\d+\.\s|-\s)/g, "\n$1");
        const finalMessages = [
          ...updatedMessages.slice(0, -1),
          { role: "assistant", content: formattedContent },
        ];
        if (formattedContent.length >= 1024) {
          finalMessages[finalMessages.length - 1].content +=
            "\n... [response truncated due to length]";
        }
        setMessages(finalMessages);

        // Only speak if the input was via voice
        if (viaVoice) {
          await handleSpeakMessage(formattedContent, finalMessages.length - 1);
        }
        await handleGenerateAvatarVideo(formattedContent);

        if (user && selectedChat) {
          await updateDoc(doc(db, "chats", user.uid, "chatBot", selectedChat.id), {
            messages: finalMessages,
          });
        }
      } else {
        setMessages([...updatedMessages, { role: "assistant", content: "No response received." }]);
      }
    } catch (error) {
      console.error("Error in handleSendMessage:", error);
      setMessages([
        ...updatedMessages,
        { role: "assistant", content: `Error: ${error.message}. Please try again.` },
      ]);

      try {
        const fallbackResponse = await fetch("https://api.together.xyz/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
            messages: [
              { role: "system", content: "You are a helpful assistant." },
              ...updatedMessages,
            ],
            max_tokens: 1024,
            temperature: 0.7,
            top_p: 0.7,
            top_k: 50,
            repetition_penalty: 1.0,
            stream: false,
          }),
        });

        const data = await fallbackResponse.json();
        if (data.choices && data.choices[0] && data.choices[0].message) {
          const content = data.choices[0].message.content;
          const finalMessages = [...updatedMessages, { role: "assistant", content }];
          setMessages(finalMessages);

          // Only speak if the input was via voice
          if (viaVoice) {
            await handleSpeakMessage(content, finalMessages.length - 1);
          }
          await handleGenerateAvatarVideo(content);

          if (user && selectedChat) {
            await updateDoc(doc(db, "chats", user.uid, "chatBot", selectedChat.id), {
              messages: finalMessages,
            });
          }
        }
      } catch (fallbackError) {
        console.error("Fallback request failed:", fallbackError);
        setMessages([
          ...updatedMessages,
          { role: "assistant", content: "Fallback failed. Please check your API setup." },
        ]);
      }
    } finally {
      setIsGenerating(false);
    }
  }, [messageInput, messages, user, selectedChat, handleSpeakMessage]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setMessages([]);
        localStorage.removeItem('anonymousChat');
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      localStorage.setItem('anonymousChat', JSON.stringify(messages));
    } else {
      const fetchChats = async () => {
        const chatsCollection = collection(db, 'chats', user.uid, 'chatBot');
        const snapshot = await getDocs(chatsCollection);
        const chatList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setChats(chatList);
      };
      fetchChats();
    }
  }, [user, messages]);

  useEffect(() => {
    const scrollToBottom = () => {
      if (messageContainerRef.current) {
        messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
      }
    };
    setTimeout(scrollToBottom, 0);
  }, [messages, isGenerating]);

  const startSpeechRecognition = async () => {
    try {
      const response = await fetch('http://localhost:5002/start_speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.status === 'success') {
        console.log("Speech recognition started on server");
        setIsRecording(true);
        speechPollIntervalRef.current = setInterval(async () => {
          const speechResponse = await fetch('http://localhost:5002/get_speech');
          const speechData = await speechResponse.json();
          if (speechData.status === 'success') {
            setIsRecording(speechData.is_recording);
            if (speechData.text && speechData.text !== lastSpeechTextRef.current && !speechData.is_recording) {
              lastSpeechTextRef.current = speechData.text;
              setMessageInput(speechData.text);
              await handleSendMessage(speechData.text, true); // Pass true for voice input
              await stopSpeechRecognition(); // Stop after successful input
            }
          }
        }, 500);
      } else {
        console.error("Failed to start speech recognition:", data.message);
      }
    } catch (error) {
      console.error("Error starting speech recognition:", error);
    }
  };

  const stopSpeechRecognition = async () => {
    try {
      const response = await fetch('http://localhost:5002/stop_speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.status === 'success') {
        console.log("Speech recognition stopped on server");
        setIsRecording(false);
        if (speechPollIntervalRef.current) {
          clearInterval(speechPollIntervalRef.current);
          speechPollIntervalRef.current = null;
        }
      }
    } catch (error) {
      console.error("Error stopping speech recognition:", error);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopSpeechRecognition();
    } else {
      startSpeechRecognition();
    }
  };

  useEffect(() => {
    return () => {
      if (speechPollIntervalRef.current) {
        clearInterval(speechPollIntervalRef.current);
      }
      stopSpeechRecognition();
    };
  }, []);

  useEffect(() => {
    if (isCameraOn && videoRef.current) {
      videoRef.current.src = 'http://localhost:5001/video_feed';
    } else if (!isCameraOn && videoRef.current) {
      videoRef.current.src = '';
    }
  }, [isCameraOn]);

  useEffect(() => {
    let interval;
    if (isCameraOn) {
      interval = setInterval(async () => {
        try {
          const data = await getPrediction();
          if (data && data.status === 'success' && data.sentence) {
            setMessageInput(data.sentence);
          }
        } catch (error) {
          console.error("Prediction fetch error:", error);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCameraOn]);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setOpenAuthDialog(false);
      setEmail('');
      setPassword('');
      setError('');
      setTimeout(() => setLoading(false), 1000);
    } catch (err) {
      setLoading(false);
      setError('Wrong email or password!');
    }
  };

  const handleSignup = async () => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: fullName });
      setSignupSuccess(true);
      setEmail('');
      setPassword('');
      setFullName('');
      setError('');
      setTimeout(() => {
        setOpenAuthDialog(false);
        setSignupSuccess(false);
        setLoading(false);
      }, 2000);
    } catch (err) {
      setLoading(false);
      setError('Signup failed—check your email/password!');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setSelectedChat(null);
    setMessages([]);
    setAnchorEl(null);
    if (isCameraOn) {
      await stopCamera();
      setIsCameraOn(false);
    }
    stopSpeechRecognition();
  };

  const handleDeleteChat = async (chatId) => {
    await deleteDoc(doc(db, 'chats', user.uid, 'chatBot', chatId));
    setChats(chats.filter(chat => chat.id !== chatId));
    if (selectedChat?.id === chatId) setSelectedChat(null);
  };

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    setMessages(chat.messages || []);
  };

  const handleOpenNewChatDialog = () => {
    setOpenNewChatDialog(true);
  };

  const handleCloseNewChatDialog = () => {
    setOpenNewChatDialog(false);
    setNewChatName('');
  };

  const handleSaveNewChat = async () => {
    if (!newChatName.trim()) return;
    if (user) {
      const newChat = {
        name: newChatName,
        messages: [],
        timestamp: new Date().toISOString(),
      };
      const chatRef = await addDoc(collection(db, 'chats', user.uid, 'chatBot'), newChat);
      setChats([...chats, { id: chatRef.id, ...newChat }]);
      setSelectedChat({ id: chatRef.id, ...newChat });
      setMessages([]);
    } else {
      setMessages([]);
      localStorage.setItem('anonymousChat', JSON.stringify([]));
    }
    handleCloseNewChatDialog();
  };

  const toggleCamera = async () => {
    if (isCameraOn) {
      await stopCamera();
      setIsCameraOn(false);
      setMessageInput('');
      setAvatarVideoUrl(null);
    } else {
      try {
        const response = await fetch('http://localhost:5001/start_camera');
        const data = await response.json();
        if (data.status === 'success') {
          setIsCameraOn(true);
        } else {
          setError("Failed to start camera on backend");
          console.error("Camera start failed:", data.message);
        }
      } catch (err) {
        setError("Camera access denied or unavailable");
        setIsCameraOn(false);
        console.error("Camera start error:", err);
      }
    }
  };

  const stopCamera = async () => {
    try {
      const response = await fetch('http://localhost:5001/stop_camera');
      const data = await response.json();
      if (data.status === 'success') {
        console.log("Camera stopped successfully");
      }
    } catch (error) {
      console.error('Error stopping camera:', error);
    }
  };

  const getPrediction = async () => {
    try {
      const response = await fetch('http://localhost:5001/predict');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting prediction:', error);
      return null;
    }
  };

  const resetSentence = async () => {
    try {
      const response = await fetch('http://localhost:5001/reset');
      const data = await response.json();
      if (data.status === 'success') {
        setMessageInput('');
        setAvatarVideoUrl(null);
      }
    } catch (error) {
      console.error('Error resetting sentence:', error);
    }
  };

  const handleGenerateAvatarVideo = async (sentence) => {
    if (!sentence.trim()) return;

    setIsProcessingVideo(true);
    try {
      const response = await fetch('http://localhost:5001/process_gloss_sentence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sentence: sentence
        }),
      });

      const data = await response.json();
      console.log('Video Generation Response:', data);
      if (data.status === 'success' && data.video_url) {
        setAvatarVideoUrl(data.video_url + `?t=${Date.now()}`);
      } else {
        console.error('Video generation failed:', data.message);
      }
    } catch (error) {
      console.error('Error generating avatar video:', error);
    } finally {
      setIsProcessingVideo(false);
    }
  };

  const handlePlayVideo = () => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.play();
      setIsVideoPlaying(true);
    }
  };

  const handlePauseVideo = () => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.pause();
      setIsVideoPlaying(false);
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMyAccount = () => {
    console.log('Navigate to My Account');
    handleMenuClose();
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClearChat = () => {
    setMessages([]);
    localStorage.removeItem('anonymousChat');
    setAvatarVideoUrl(null);
  };

  const handleCopyMessage = (content) => {
    navigator.clipboard.writeText(content).then(() => {
      console.log('Message copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy message:', err);
    });
  };

  return (
    <>
      <StyledAppBar>
        <Toolbar sx={{ justifyContent: 'center' }}>
          <Typography variant="h6">
            SignVerse
          </Typography>
          {user ? (
            <Box sx={{ position: 'absolute', right: 16, display: 'flex', alignItems: 'center', gap: 1 }}>
              <SmallRoundButton onClick={handleOpenNewChatDialog}>
                <AddIcon />
              </SmallRoundButton>
              <Avatar sx={{ bgcolor: '#FFFFFF', color: '#007ACC', mr: 1 }}>
                {user.displayName ? user.displayName[0].toUpperCase() : user.email[0].toUpperCase()}
              </Avatar>
              <IconButton color="inherit" onClick={handleMenuOpen}>
                <ArrowDropDownIcon />
              </IconButton>
            </Box>
          ) : (
            <Box sx={{ position: 'absolute', right: 16 }}>
              <Button color="inherit" onClick={() => setOpenAuthDialog(true)}>
                Login/Signup
              </Button>
            </Box>
          )}
        </Toolbar>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={handleMyAccount}>My Account</MenuItem>
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </StyledAppBar>

      <Container>
        <LeftSection>
          {avatarVideoUrl ? (
            <VideoContainer>
              <VideoPlayer ref={videoPlayerRef} controls={false} key={avatarVideoUrl}>
                <source src={avatarVideoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </VideoPlayer>
              <VideoControls className="video-controls">
                <ControlButton onClick={handlePlayVideo}>
                  <PlayArrowIcon />
                </ControlButton>
                <ControlButton onClick={handlePauseVideo}>
                  <PauseIcon />
                </ControlButton>
              </VideoControls>
            </VideoContainer>
          ) : (
            <Box sx={{ 
              width: '100%', 
              height: 857, 
              borderRadius: '8px',
              marginTop: '20px',
              backgroundImage: `url(${avatarImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }} />
          )}
          {isProcessingVideo && <CircularProgress sx={{ mt: 2 }} />}
        </LeftSection>

        <MiddleSection elevation={3}>
          <ChatContainer ref={messageContainerRef}>
            {!user && messages.length > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <ClearChatButton startIcon={<ClearIcon />} onClick={handleClearChat}>
                  Clear Chat
                </ClearChatButton>
              </Box>
            )}
            {messages.map((msg, index) => (
              <MessageBubble key={index} isUser={msg.role === 'user'}>
                {renderContent(
                  msg.content,
                  speakingMessageIndex === index ? highlightedLineIndex : -1,
                  msg.role === 'user'
                )}
                {msg.role === 'assistant' && (
                  <MessageActions className="message-actions">
                    <IconButton size="small" onClick={() => handleCopyMessage(msg.content)} sx={{ color: 'black' }}>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleSpeakMessage(msg.content, index)} sx={{ color: 'black' }}>
                      <VolumeUpIcon fontSize="small" />
                    </IconButton>
                  </MessageActions>
                )}
              </MessageBubble>
            ))}
            {isGenerating && (
              <GeneratingBubble>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                <Typography variant="body2" color="textSecondary">Generating...</Typography>
              </GeneratingBubble>
            )}
          </ChatContainer>
          <InputContainer>
            {isRecording ? (
              <WaveformAnimation />
            ) : (
              <Box sx={{ position: 'relative', flexGrow: 1 }}>
                <LongTextField
                  fullWidth
                  placeholder="Type your message or say 'Hey Alex'..."
                  variant="outlined"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <IconButton
                  onClick={toggleRecording}
                  sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}
                >
                  {isRecording ? <MicOffIcon /> : <MicIcon />}
                </IconButton>
              </Box>
            )}
            <SmallSendButton onClick={() => handleSendMessage()}>Send</SmallSendButton>
          </InputContainer>
        </MiddleSection>

        <RightSection>
          <CameraPlaceholder>
            {isCameraOn ? (
              <VideoStream ref={videoRef} />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  backgroundImage: `url(${pfpImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: '8px',
                }}
              />
            )}
            <FancyCameraButton onClick={toggleCamera} startIcon={isCameraOn ? <VideocamIcon /> : <VideocamOffIcon />}>
              {isCameraOn ? 'Stop Camera' : 'Start Camera'}
            </FancyCameraButton>
          </CameraPlaceholder>

          <Typography variant="h6" sx={{ p: 2 }}>Want to know how to sign something?</Typography>
          <Typography variant="body2" sx={{ pb: 1, color: 'text.secondary' }}>
            Type the word you want to sign and click generate
          </Typography>
          
          <VideoTextField
            variant="outlined"
            placeholder="Generate Avatar Video"
            value={videoInput}
            onChange={(e) => setVideoInput(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleGenerateAvatarVideo(videoInput)}
            disabled={isProcessingVideo || !videoInput}
            sx={{ borderRadius: '20px', width: '100%', mb: 1 }}
          >
            {isProcessingVideo ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Generate'
            )}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={resetSentence}
            sx={{ borderRadius: '20px', width: '100%', mb: 2 }}
          >
            Reset Sentence
          </Button>

          <Typography variant="h6" sx={{ p: 2 }}>Previous Chats</Typography>
          <Divider />
          <List sx={{ width: '100%' }}>
            {chats.map(chat => (
              <ListItem button key={chat.id} onClick={() => handleSelectChat(chat)}>
                <ListItemText primary={chat.name} />
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={() => handleDeleteChat(chat.id)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </RightSection>
      </Container>

      <Dialog open={openAuthDialog} onClose={() => !loading && setOpenAuthDialog(false)}>
        <DialogTitle>{isLogin ? 'Login to SignVerse' : 'Sign Up for SignVerse'}</DialogTitle>
        <DialogContent>
          {loading ? (
            signupSuccess ? (
              <Typography variant="h6" align="center">
                Thank you for signing up! You are being redirected to SignVerse...
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            )
          ) : (
            <>
              {!isLogin && (
                <TextField
                  label="Full Name"
                  fullWidth
                  margin="normal"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
              <TextField
                label="Email"
                fullWidth
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleTogglePassword} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {error && <Typography color="error">{error}</Typography>}
              {isLogin ? (
                <Typography sx={{ mt: 1 }}>
                  New here?{' '}
                  <Button color="primary" onClick={() => setIsLogin(false)}>
                    Create an account
                  </Button>
                </Typography>
              ) : (
                <Typography sx={{ mt: 1 }}>
                  Already have an account?{' '}
                  <Button color="primary" onClick={() => setIsLogin(true)}>
                    Sign in
                  </Button>
                </Typography>
              )}
            </>
          )}
        </DialogContent>
        {!loading && !signupSuccess && (
          <DialogActions>
            <Button onClick={() => setOpenAuthDialog(false)}>Cancel</Button>
            <Button onClick={isLogin ? handleLogin : handleSignup} color="primary">
              {isLogin ? 'Login' : 'Sign Up'}
            </Button>
          </DialogActions>
        )}
      </Dialog>

      <Dialog open={openNewChatDialog} onClose={handleCloseNewChatDialog}>
        <DialogTitle>Create New Chat</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Chat Name"
            fullWidth
            value={newChatName}
            onChange={(e) => setNewChatName(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNewChatDialog}>Cancel</Button>
          <Button onClick={handleSaveNewChat} color="primary" disabled={!newChatName.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default App;