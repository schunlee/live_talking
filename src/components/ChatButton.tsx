import { Button, Center } from "@chakra-ui/react"
import { SlMicrophone } from "react-icons/sl"



const ChatButton = () => {
    return (
        <Center>
            <Button
                mt={4}
                h={{ md: "50px", base: "40px" }}
                w={{ md: "50px", base: "40px" }}
                fontSize={'sm'}
                mr={{ md: "20px", base: "30px" }}
                rounded={'full'}
                bg={'blue.500'}
                color={'white'}
                borderRadius="full"
                boxShadow={
                    '0px 1px 25px -5px rgb(66 153 225 / 48%), 0 10px 10px -5px rgb(66 153 225 / 43%)'
                }>
                <SlMicrophone />
            </Button></Center>
    )
}

export default ChatButton