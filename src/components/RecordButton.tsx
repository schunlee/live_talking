import { Button } from "@chakra-ui/react";
import { HiOutlineMicrophone } from "react-icons/hi";
import { PiMicrophoneSlashLight } from "react-icons/pi";
import { Tooltip } from "@/components/ui/tooltip"

interface RecordButtonProps {
    isPulsing: boolean;
    handleClick: () => void;
}

const RecordButton = ({ isPulsing, handleClick }: RecordButtonProps) => {
    return (
        <Tooltip showArrow content="Turn on/off the microphone">
            <Button
                bg="green.500"
                color="white"
                fontWeight="bold"
                h={{ md: "40px", base: "40px" }}
                w={{ md: "40px", base: "40px" }}
                fontSize={'sm'}
                rounded={'full'}
                mr={3}
                borderRadius="full"
                // _hover={{ bg: "blue.600" }}
                boxShadow="lg"
                animationName={isPulsing ? "pulse" : undefined}
                animationDuration={isPulsing ? "1s" : undefined}
                animationTimingFunction={isPulsing ? "ease-in-out" : undefined}
                animationIterationCount={isPulsing ? "infinite" : undefined}
                onClick={handleClick}
            >
                {isPulsing ? <HiOutlineMicrophone /> : <PiMicrophoneSlashLight />}
            </Button>
        </Tooltip>
    );
};

export default RecordButton;
