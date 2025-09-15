import { Box, Flex, Input, InputGroup } from '@chakra-ui/react'
import { AiOutlineSend } from 'react-icons/ai'
import ChatMessage from './ChatMessage'
import { useState } from 'react';
import avatar_client from '@/assets/avatar_client.png'
import avatar_ai from '@/assets/avatar_ai.png'



interface ChatBoxProps {
    sessionId?: string | null;
    messages: { avatarUrl: string; messageText: string }[];
    setMessages: React.Dispatch<React.SetStateAction<{ avatarUrl: string; messageText: string }[]>>;
    setStatusText: React.Dispatch<React.SetStateAction<string>>;
}


const ChatBox = ({ sessionId, messages, setMessages, setStatusText }: ChatBoxProps) => {
    const sid = sessionId ? parseInt(sessionId) : 0;
    const [inputMsg, setInputMsg] = useState("");


    const handleSubmit = async () => {
        if (!inputMsg) return; // 如果输入为空，直接返回
        const newMessage = { avatarUrl: avatar_client, messageText: inputMsg };
        setMessages((prev) => [...prev, newMessage]);
        setInputMsg("")

        try {
            console.log('Sending chat message:', inputMsg);

            let resp = await fetch('/human', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: inputMsg,
                    type: 'chat',
                    interrupt: true,
                    sessionid: sid,
                }),
            });
            let data = await resp.json();
            const reply = data.msg;
            const replayMsg = { avatarUrl: avatar_ai, messageText: reply };
            setTimeout(() => {
                setMessages((prev) => [...prev, replayMsg]);
            }, 2000)
            setStatusText("Opening")

        } catch (error) {
            console.error('发送失败:', error);
        }
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
            minW={{ md: "440px", base: '440px' }}
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