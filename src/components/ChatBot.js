// src/components/ChatBot.js

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
  Input,
  IconButton,
} from '@chakra-ui/react';
import { FaHome, FaComments, FaArrowRight } from 'react-icons/fa';

// === Main Component ===
function ChatBot({ setShowChatBot, setShowGestureBot, setShowVoiceBot }) {
  // === State Management ===
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [previousChats, setPreviousChats] = useState(['Chat 1', 'Chat 2', 'Chat 3']);
  const [selectedChat, setSelectedChat] = useState('');

  // === Event Handlers ===
  const handleHomeClick = () => {
    setShowChatBot(false);
  };

  const handleGestureClick = () => {
    setShowGestureBot(true);
    setShowChatBot(false);
  };

  const handleVoiceClick = () => {
    setShowVoiceBot(true);
    setShowChatBot(false);
  };

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    // Simulate loading messages for the selected chat
    setMessages([`Messages from ${chat}...`]);
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (chatInput.trim()) {
      setMessages((prev) => [...prev, chatInput]);
      setChatInput('');
    }
  };

  // === UI Rendering ===
  return (
    <Flex direction="column" h="100vh" bg="gray.100">
      {/* Navbar Section */}
      <Box as="nav" bg="blue.600" p={4} color="white" shadow="md">
        <Flex justify="space-between" align="center" maxW="container.xl" mx="auto">
          <Heading size="md">Chat Bot Page</Heading>
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
              colorScheme="blue"
              onClick={handleGestureClick}
              aria-label="Gesture Bot"
            >
              Gesture Bot
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
      <Flex flex={1} overflow="hidden">
        {/* Left Section: Previous Chats */}
        <Box w="30%" bg="gray.50" p={4} display="flex" alignItems="center">
          <VStack spacing={4} align="stretch" w="100%">
            <Text fontWeight="bold">Previous Chats</Text>
            {previousChats.map((chat, index) => (
              <Button
                key={index}
                variant="outline"
                colorScheme="blue"
                onClick={() => handleChatSelect(chat)}
              >
                {chat}
              </Button>
            ))}
          </VStack>
        </Box>

        {/* Right Section: Chat Bot Output */}
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
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type your message..."
                    flex={1}
                  />
                  <IconButton
                    type="submit"
                    icon={<FaArrowRight />}
                    colorScheme="blue"
                    aria-label="Send Message"
                  />
                </HStack>
              </form>
            </Box>
          </VStack>
        </Box>
      </Flex>
    </Flex>
  );
}

export default ChatBot;