import { Box, Flex, } from "@chakra-ui/react";
import MessageItem from "./MessageItem";
import { useEffect, useRef } from "react";

interface ChatMessageProps {
  messages: { avatarUrl: string; messageText: string, sender: "ai"| "user" }[];
}

const ChatMessage = ({ messages}: ChatMessageProps) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Box
      w="100%"
      h="100%"
      bgColor="rgba(255, 255, 255, 0.75)" // 设置半透明背景
      p={8}
      borderRadius="xl"
      mb="10px"
      backdropFilter="blur(10px)" // 添加磨砂效果
      boxShadow="lg" // 可选：添加阴影效果
      overflowY="auto"
    >
      <Flex
        direction="column"
        alignItems="flex-start"
        minH="100%"
        gap={2}
      >
        {messages.map((item, index) => (
          <MessageItem key={index} avatarUrl={item.avatarUrl} messageText={item.messageText} sender={item.sender}/>
        ))}
        <div ref={messagesEndRef} />
      </Flex>
    </Box>
  );
};

export default ChatMessage;