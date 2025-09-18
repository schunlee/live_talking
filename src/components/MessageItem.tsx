import { Avatar, Box, defineStyle, Flex, Text } from "@chakra-ui/react"

interface MessageItemProps {
    avatarUrl?: string;
    messageText?: string;
}

const MessageItem = ({avatarUrl, messageText }: MessageItemProps) => {
    const ringCss = defineStyle({
        outlineWidth: "2px",
        outlineColor: "colorPalette.500",
        outlineOffset: "2px",
        outlineStyle: "solid",
    })
    return (
        <>
            {avatarUrl?.includes("avatar_ai") && <Flex align="flex-start" gap={2} mb={2}>
                <Avatar.Root css={ringCss} colorPalette="pink" size={"xs"} key={"xs"}>
                    <Avatar.Fallback name="X" />
                    <Avatar.Image src={avatarUrl} />
                </Avatar.Root>
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
            </Flex>}
            {!avatarUrl?.includes("avatar_ai") && <Flex align="flex-start" gap={2} mb={2}>
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
                <Avatar.Root css={ringCss} colorPalette="pink" size={"xs"} key={"xs"}>
                    <Avatar.Fallback name="X" />
                    <Avatar.Image src={avatarUrl} />
                </Avatar.Root>
            </Flex>}
        </>
    )
}

export default MessageItem
