import { Button, } from '@chakra-ui/react'
import { BsTelephoneX } from 'react-icons/bs'
import { Tooltip } from "@/components/ui/tooltip"

interface StopButtonProps {
    onClick?: () => void;
}


const StopButton = ({ onClick }: StopButtonProps) => {
    return (
        <Tooltip showArrow content="End the call">
            <Button
                onClick={onClick}
                h={{ md: "40px", base: "40px" }}
                w={{ md: "40px", base: "40px" }}
                fontSize={'sm'}
                // mr={{ md: "20px", base: "30px" }}
                rounded={'full'}
                bg={'red.500'}
                color={'white'}
                borderRadius="full"
                boxShadow={
                    '0px 1px 25px -5px rgb(66 153 225 / 48%), 0 10px 10px -5px rgb(66 153 225 / 43%)'
                }>
                <BsTelephoneX />
            </Button>
        </Tooltip>
    )
}

export default StopButton
