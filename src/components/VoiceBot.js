// src/components/VoiceBot.js

// === Imports ===
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  VStack,
  Text,
  Flex,
  Heading,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar as ChakraAvatar,
} from '@chakra-ui/react';
import { FaMicrophone, FaMicrophoneSlash, FaComments } from 'react-icons/fa';

// === Main Component ===
function VoiceBot({ setShowVoiceBot, setShowGestureBot, setShowChatBot }) {
  // === State Management ===
  const [micOn, setMicOn] = useState(false);
  const [transcriptionVisible, setTranscriptionVisible] = useState(false);
  const [transcription, setTranscription] = useState('');

  // === Refs for Audio Context and Waveform ===
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const sourceRef = useRef(null);
  const animationFrameIdRef = useRef(null);

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

      ctx.lineWidth = 2;
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
  const toggleMic = () => {
    setMicOn(!micOn);
  };

  const toggleTranscription = () => {
    setTranscriptionVisible(!transcriptionVisible);
    if (!transcriptionVisible) {
      setTranscription('This is a placeholder transcription. (Real-time transcription would require a speech-to-text API)');
    } else {
      setTranscription('');
    }
  };

  const handleBackToHome = () => {
    setShowVoiceBot(false);
  };

  const handleChatClick = () => {
    setShowChatBot(true);
    setShowVoiceBot(false);
  };

  const handleGestureClick = () => {
    setShowGestureBot(true);
    setShowVoiceBot(false);
  };

  // === UI Rendering ===
  return (
    <Flex direction="column" h="100vh" bg="gray.100">
      {/* Navbar Section */}
      <Box as="nav" bg="blue.600" p={4} color="white" shadow="md">
        <Flex justify="space-between" align="center" maxW="container.xl" mx="auto">
          <Heading size="md">Sign Language App</Heading>
          <HStack spacing={4}>
            <Button
              colorScheme="teal"
              onClick={handleBackToHome}
              aria-label="Go to Home"
            >
              Home
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleGestureClick}
              aria-label="Gesture Bot"
            >
              Gesture Bot
            </Button>
            <Button
              colorScheme="purple"
              onClick={handleChatClick}
              aria-label="Text Bot"
            >
              Text Bot
            </Button>
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
      <Box p={4} flex={1} display="flex" justifyContent="center" alignItems="center">
        <VStack spacing={4} align="center">
          <Text fontSize="2xl" fontWeight="bold">Voice Bot</Text>
          <canvas
            ref={canvasRef}
            width={600}
            height={200}
            style={{ border: '1px solid #ccc', borderRadius: '8px' }}
          />
          <Button
            leftIcon={micOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
            colorScheme={micOn ? 'green' : 'red'}
            onClick={toggleMic}
            aria-label="Toggle Microphone"
          >
            {micOn ? 'Mic On' : 'Mic Off'}
          </Button>
          <Button
            colorScheme="blue"
            onClick={toggleTranscription}
            aria-label="Show Transcriptions"
          >
            Show Transcriptions
          </Button>
          {transcriptionVisible && (
            <Box p={4} bg="white" borderRadius="md" boxShadow="md">
              <Text>{transcription}</Text>
            </Box>
          )}
        </VStack>
      </Box>
    </Flex>
  );
}

export default VoiceBot;