// src/components/GestureBot.js

// === Imports ===
import React, { useState } from 'react';
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
  IconButton,
} from '@chakra-ui/react';
import { FaHome, FaComments, FaVideo, FaVideoSlash } from 'react-icons/fa';
import Webcam from 'react-webcam';

// === Main Component ===
function GestureBot({ setShowGestureBot, setShowVoiceBot, setShowChatBot }) {
  // === State Management ===
  const [selectedChat, setSelectedChat] = useState('');
  const [camOn, setCamOn] = useState(true);

  // === Event Handlers ===
  const handleHomeClick = () => {
    setShowGestureBot(false);
  };

  const handleVoiceClick = () => {
    setShowVoiceBot(true);
    setShowGestureBot(false);
  };

  const handleChatClick = () => {
    setShowChatBot(true);
    setShowGestureBot(false);
  };

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
  };

  const toggleCam = () => {
    setCamOn(!camOn);
  };

  // === UI Rendering ===
  return (
    <Flex direction="column" h="100vh" bg="gray.100">
      {/* Navbar Section */}
      <Box as="nav" bg="blue.600" p={4} color="white" shadow="md">
        <Flex justify="space-between" align="center" maxW="container.xl" mx="auto">
          <Heading size="md">Gesture Bot Page</Heading>
          <HStack spacing={4}>
            <Button
              leftIcon={<FaHome />}
              colorScheme="teal"
              onClick={handleHomeClick}
              aria-label="Go to Home"
            >
              Home
            </Button>
            <Button
              colorScheme="purple"
              onClick={handleChatClick}
              aria-label="Text Bot"
            >
              Text Bot
            </Button>
            <Button
              colorScheme="green"
              onClick={handleVoiceClick}
              aria-label="Voice Bot"
            >
              Voice Bot
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
      <Flex flex={1} p={4} overflow="hidden">
        {/* Left Section: Avatar */}
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
            <Text>Avatar</Text>
          </Box>
        </Box>

        {/* Right Section: Camera and Chats */}
        <Box flex={1} bg="white" p={4} ml={4}>
          <VStack spacing={4} align="stretch" h="100%">
            {/* Camera Section */}
            <Box h="50%" position="relative">
              {camOn ? (
                <Webcam
                  width="100%"
                  height="100%"
                  videoConstraints={{ width: 320, height: 240 }}
                  style={{ borderRadius: '8px', boxShadow: 'md', objectFit: 'cover' }}
                />
              ) : (
                <Box
                  w="100%"
                  h="100%"
                  bg="gray.300"
                  borderRadius="md"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text>Camera Off</Text>
                </Box>
              )}
              <IconButton
                icon={camOn ? <FaVideo /> : <FaVideoSlash />}
                colorScheme={camOn ? 'blue' : 'red'}
                onClick={toggleCam}
                aria-label="Toggle Camera"
                position="absolute"
                bottom="10px"
                right="10px"
              />
            </Box>

            {/* Previous Chats Section */}
            <Box h="50%" overflowY="auto" p={2} bg="gray.100" borderRadius="md">
              <Text fontWeight="bold">Previous Chats:</Text>
              <VStack align="stretch" spacing={2} mt={2}>
                <Button
                  variant="outline"
                  colorScheme="blue"
                  onClick={() => handleChatSelect('Would we settle')}
                >
                  Would we settle
                </Button>
                <Button
                  variant="outline"
                  colorScheme="blue"
                  onClick={() => handleChatSelect('I guess, which suits')}
                >
                  I guess, which suits
                </Button>
              </VStack>
              {selectedChat && (
                <Text mt={4} p={2} bg="white" borderRadius="md" boxShadow="md">
                  Selected: {selectedChat}
                </Text>
              )}
            </Box>
          </VStack>
        </Box>
      </Flex>
    </Flex>
  );
}

export default GestureBot;