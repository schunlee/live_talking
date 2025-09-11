import { Box, Flex, } from "@chakra-ui/react";
import MessageItem from "./MessageItem";

interface ChatMessageProps {
  messages: { avatarUrl: string; messageText: string }[];
}

const ChatMessage = ({ messages }: ChatMessageProps) => {
  return (
    <Box
      w="100%"
      h="100%"
      bgColor="rgba(255, 255, 255, 0.75)" // 设置半透明背景
      p={10}
      borderRadius="xl"
      mb="10px"
      backdropFilter="blur(10px)" // 添加磨砂效果
      boxShadow="lg" // 可选：添加阴影效果
      overflowY="auto"
    >
      <Flex
        direction="column-reverse"  // 让最新消息显示在底部
        alignItems="flex-start"
        minH="100%"
        gap={3}
      >
        {messages.map((item, index) => (
          <MessageItem key={index} avatarUrl={item.avatarUrl} messageText={item.messageText} />
        ))}
      </Flex>
    </Box>
  );
};

export default ChatMessage;