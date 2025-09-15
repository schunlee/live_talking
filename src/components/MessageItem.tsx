import { Avatar, Box, defineStyle, Flex, Text } from "@chakra-ui/react"
// import avatar from '@/assets/avatar_ai.png'

interface MessageItemProps {
    avatarUrl?: string;
    messageText?: string;
}

const MessageItem = ({ avatarUrl, messageText }: MessageItemProps) => {
    const ringCss = defineStyle({
        outlineWidth: "2px",
        outlineColor: "colorPalette.500",
        outlineOffset: "2px",
        outlineStyle: "solid",
    })
    return (
        <Flex align="flex-start" gap={2} mb={2}>
            {/* 左边头像 */}
            <Avatar.Root css={ringCss} colorPalette="pink" size={"xs"} key={"xs"}>
                <Avatar.Fallback name="X" />
                <Avatar.Image src={avatarUrl} />
            </Avatar.Root>

            {/* 右边消息气泡 */}
            <Box
                bg="gray.100"
                px={2}
                py={2}
                borderRadius="lg"
                w="300px"
                boxShadow="sm"
            >
                <Text fontSize="md" color="gray.800">
                    {messageText}
                </Text>
            </Box>
        </Flex>
    )
}

export default MessageItem
