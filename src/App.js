// App.js

// === Imports ===
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Flex,
  Heading,
  Button,
  VStack,
  HStack,
  Text,
  Input,
  IconButton,
  Avatar as ChakraAvatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaComments } from 'react-icons/fa';
import Webcam from 'react-webcam';
import VoiceBot from './components/VoiceBot';
import GestureBot from './components/GestureBot';
import ChatBot from './components/ChatBot'; // Import ChatBot

// === Main Component ===
function App() {
  // === Refs for DOM and Audio Context ===
  const webcamRef = useRef(null);
  const canvasRef = useRef(null); // For waveform
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const sourceRef = useRef(null);
  const animationFrameIdRef = useRef(null);

  // === State Management ===
  const [messages, setMessages] = useState([]);
  const [micOn, setMicOn] = useState(false);
  const [camOn, setCamOn] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [showVoiceBot, setShowVoiceBot] = useState(false);
  const [showGestureBot, setShowGestureBot] = useState(false);
  const [showChatBot, setShowChatBot] = useState(false); // New state for ChatBot

  // === Web Audio API Setup and Waveform Logic ===
  useEffect(() => {
    if (micOn) {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;

      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          const source = audioContext.createMediaStreamSource(stream);
          sourceRef.current = source;

          const analyser = audioContext.createAnalyser();
          analyser.fftSize = 2048;
          analyserRef.current = analyser;
          source.connect(analyser);

          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          dataArrayRef.current = dataArray;

          drawWaveform();
        })
        .catch(err => {
          console.error('Error accessing microphone:', err);
          setMicOn(false);
        });
    } else {
      if (sourceRef.current && audioContextRef.current) {
        sourceRef.current.disconnect();
        audioContextRef.current.close().then(() => {
          audioContextRef.current = null;
          analyserRef.current = null;
          dataArrayRef.current = null;
          if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          }
          if (animationFrameIdRef.current) {
            cancelAnimationFrame(animationFrameIdRef.current);
            animationFrameIdRef.current = null;
          }
        }).catch(err => console.error('Error closing audio context:', err));
      }
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close().then(() => {
          audioContextRef.current = null;
          analyserRef.current = null;
          dataArrayRef.current = null;
          if (animationFrameIdRef.current) {
            cancelAnimationFrame(animationFrameIdRef.current);
            animationFrameIdRef.current = null;
          }
        }).catch(err => console.error('Error during cleanup:', err));
      }
    };
  }, [micOn]);

  const drawWaveform = () => {
    if (!analyserRef.current || !canvasRef.current || !micOn) return;

    const ctx = canvasRef.current.getContext('2d');
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = dataArrayRef.current;

    function animate() {
      if (!micOn || !analyserRef.current || !canvasRef.current) {
        return;
      }

      animationFrameIdRef.current = requestAnimationFrame(animate);

      analyserRef.current.getByteTimeDomainData(dataArray);

      ctx.fillStyle = 'rgb(255, 255, 255)';
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgb(0, 0, 255)';
      ctx.beginPath();

      const sliceWidth = canvasRef.current.width * 1.0 / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * (canvasRef.current.height / 2);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvasRef.current.width, canvasRef.current.height / 2);
      ctx.stroke();
    }

    animate();
  };

  // === Event Handlers ===
  const handleTranslate = () => {
    setMessages((prev) => [...prev, 'Hello']);
  };

  const toggleMic = () => {
    setMicOn(!micOn);
  };

  const toggleCam = () => setCamOn(!camOn);

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (chatInput.trim()) {
      setMessages((prev) => [...prev, chatInput]);
      setChatInput('');
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const handleVoiceClick = () => {
    setShowVoiceBot(true);
    setShowGestureBot(false);
    setShowChatBot(false);
  };

  const handleGestureClick = () => {
    setShowGestureBot(true);
    setShowVoiceBot(false);
    setShowChatBot(false);
  };

  const handleChatClick = () => {
    setShowChatBot(true);
    setShowGestureBot(false);
    setShowVoiceBot(false);
  };

  // === Conditional Rendering ===
  if (showVoiceBot) {
    return <VoiceBot setShowVoiceBot={setShowVoiceBot} setShowGestureBot={setShowGestureBot} setShowChatBot={setShowChatBot} />;
  }
  if (showGestureBot) {
    return <GestureBot setShowGestureBot={setShowGestureBot} setShowVoiceBot={setShowVoiceBot} setShowChatBot={setShowChatBot} />;
  }
  if (showChatBot) {
    return <ChatBot setShowChatBot={setShowChatBot} setShowGestureBot={setShowGestureBot} setShowVoiceBot={setShowVoiceBot} />;
  }

  // === UI Rendering ===
  return (
    <Flex direction="column" h="100vh" bg="gray.100">
      {/* Navbar Section */}
      <Box as="nav" bg="blue.600" p={4} color="white" shadow="md">
        <Flex justify="space-between" align="center" maxW="container.xl" mx="auto">
          <Heading size="md">SignVerse</Heading>
          <HStack spacing={4}>
            <Menu>
              <MenuButton as={Button} leftIcon={<FaComments />} variant="solid" bg="blue.700">
                Chats
              </MenuButton>
              <MenuList color="black">
                <MenuItem>Current Chat</MenuItem>
                <MenuItem>Chat History</MenuItem>
              </MenuList>
            </Menu>
            <ChakraAvatar size="sm" name="User" bg="blue.300" />
          </HStack>
        </Flex>
      </Box>

      {/* Main Content Section */}
      <Flex flex={1} overflow="hidden">
        {/* Leftmost Section: Dummy Avatar */}
        <Box w="30%" bg="gray.50" p={4} display="flex" alignItems="center" justifyContent="center">
          <Box
            w="80%"
            h="80%"
            bg="gray.300"
            borderRadius="md"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text>Dummy Avatar Placeholder</Text>
          </Box>
        </Box>

        {/* Middle Section: Chat */}
        <Box flex={1} bg="white" p={4} position="relative">
          <VStack h="100%" justify="space-between" spacing={4}>
            <Box flex={1} overflowY="auto" w="100%">
              {messages.length === 0 ? (
                <Text color="gray.500" textAlign="center">
                  Chat messages will appear here
                </Text>
              ) : (
                <VStack align="flex-end" spacing={2}>
                  {messages.map((msg, index) => (
                    <Box
                      key={index}
                      bg="blue.100"
                      p={2}
                      px={4}
                      borderRadius="lg"
                      maxW="70%"
                      wordBreak="break-word"
                    >
                      <Text>{msg}</Text>
                    </Box>
                  ))}
                </VStack>
              )}
            </Box>
            <Box w="100%">
              <form onSubmit={handleChatSubmit} style={{ width: '100%' }}>
                <HStack spacing={2} bg="gray.100" p={2} borderRadius="md">
                  <IconButton
                    icon={micOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
                    colorScheme={micOn ? 'green' : 'red'}
                    onClick={toggleMic}
                    aria-label="Toggle Microphone"
                  />
                  <IconButton
                    icon={camOn ? <FaVideo /> : <FaVideoSlash />}
                    colorScheme={camOn ? 'blue' : 'red'}
                    onClick={toggleCam}
                    aria-label="Toggle Camera"
                  />
                  {micOn ? (
                    <canvas
                      ref={canvasRef}
                      width="100%"
                      height={30}
                      style={{ border: '1px solid #ccc', borderRadius: '4px', flex: 1 }}
                    />
                  ) : (
                    <>
                      <Box width="100px" height="30px" />
                      <Input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Type your message..."
                        flex={1}
                      />
                      <Button type="submit" colorScheme="blue">
                        Send
                      </Button>
                    </>
                  )}
                </HStack>
              </form>
              <Button
                mt={2}
                w="full"
                colorScheme="red"
                variant="outline"
                onClick={handleClearChat}
              >
                Clear Chat
              </Button>
            </Box>
          </VStack>
        </Box>

        {/* Rightmost Section: Webcam + Buttons */}
        <Box w="30%" bg="gray.50" p={4}>
          {camOn ? (
            <Webcam
              ref={webcamRef}
              width="100%"
              height="auto"
              videoConstraints={{ width: 320, height: 240 }}
              style={{ borderRadius: '8px', boxShadow: 'md' }}
            />
          ) : (
            <Box
              w="100%"
              h="240px"
              bg="gray.300"
              borderRadius="md"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text>Camera Off</Text>
            </Box>
          )}
          <HStack spacing={4} mt={4} justify="center">
            <Button
              colorScheme="blue"
              variant="outline"
              _hover={{ bg: 'blue.100', transform: 'scale(1.05)' }}
              transition="all 0.2s"
              onClick={handleGestureClick}
            >
              GestureBot
            </Button>
            <Button
              colorScheme="green"
              variant="outline"
              _hover={{ bg: 'green.100', transform: 'scale(1.05)' }}
              transition="all 0.2s"
              onClick={handleVoiceClick}
            >
              VoiceBot
            </Button>
            <Button
              colorScheme="purple"
              variant="outline"
              _hover={{ bg: 'purple.100', transform: 'scale(1.05)' }}
              transition="all 0.2s"
              onClick={handleChatClick}
            >
              ChatBot
            </Button>
          </HStack>
        </Box>
      </Flex>
    </Flex>
  );
}

export default App;