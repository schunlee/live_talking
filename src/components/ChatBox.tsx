import { Box, Flex, Input, InputGroup } from '@chakra-ui/react'
import { AiOutlineSend } from 'react-icons/ai'
// import ChatButton from './ChatButton'
import ChatMessage from './ChatMessage'
import { useState } from 'react';
import avatar_client from '@/assets/avatar_client.png'


const ChatBox = () => {

    const [messages, setMessages] = useState<{ avatarUrl: string; messageText: string }[]>([]);
    const [inputMsg, setInputMsg] = useState("");


    const handleSubmit = () => {
        if (!inputMsg) return; // 如果输入为空，直接返回
        const newMessage = { avatarUrl: avatar_client, messageText: inputMsg };
        setMessages([newMessage, ...messages]);
        setInputMsg("")
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputMsg(e.target.value);
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    }

    return (
        <Box
            backdropFilter="blur(6px)"
            boxShadow="lg"
            h={{ base: "20px", md: "80vh" }}
            ml={10}
            minW={{ md: "400px", base: '200px' }}
            bg={"blue.100"}
            borderRadius="2xl">
            <Flex direction={'column'} h="100%" p={4} justifyContent="flex-end">
                <ChatMessage messages={messages} />
                <InputGroup endElement={<AiOutlineSend />} bgColor={"white"} borderRadius="xl" onClick={handleSubmit} onKeyDown={handleKeyDown}>
                    <Input fontFamily="bold" placeholder="Send me message..." value={inputMsg} onInput={handleInputChange} />
                </InputGroup>
            </Flex>
        </Box>
    )
}

export default ChatBox