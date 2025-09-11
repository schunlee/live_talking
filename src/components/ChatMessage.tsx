import { Box } from "@chakra-ui/react";

const ChatMessage = () => {
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
    >
    </Box>
  );
};

export default ChatMessage;