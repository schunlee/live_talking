import { Box, Flex, Input, InputGroup } from '@chakra-ui/react'
import { AiOutlineSend } from 'react-icons/ai'
import ChatButton from './ChatButton'
import ChatMessage from './ChatMessage'

const ChatBox = () => {
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
                <ChatMessage />
                <InputGroup endElement={<AiOutlineSend />} bgColor={"white"} borderRadius="xl">
                    <Input fontFamily="bold" placeholder="Send me message..." />
                </InputGroup>
                {/* <ChatButton /> */}
            </Flex>
            

        </Box>
    )
}

export default ChatBox