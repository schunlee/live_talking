import { Box, Center, Spinner, VStack, Text } from "@chakra-ui/react"
import { t } from "i18next"

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
            {t("waiting_title")}
          </Text>
          <Text fontSize="md" color="whiteAlpha.900" textAlign="center">
            {t("waiting_msg")}
          </Text>
        </VStack>
      </Center>
    </Box>
  )
}

export default LoadingOverlay