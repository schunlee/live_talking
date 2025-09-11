import { Box, Center, Spinner, VStack, Text } from "@chakra-ui/react"

const LoadingOverlay = () => {
  return (
    <Box
      pos="absolute"
      inset="0"
      bg="rgba(88, 86, 86, 0.3)"   // 半透明背景
      backdropFilter="blur(8px)"       // 背景磨砂
      zIndex={10}                      // 确保在最上层
    >
      <Center h="100%">
        <VStack>
          <Spinner
            color="white"
            size="xl"
          />
          <Text fontSize="2xl" fontWeight="bold" color="white">
            Connecting...
          </Text>
          <Text fontSize="md" color="whiteAlpha.900" textAlign="center">
            Loading up your avatar now for a realtime interactive experience.
          </Text>
        </VStack>
      </Center>
    </Box>
  )
}

export default LoadingOverlay