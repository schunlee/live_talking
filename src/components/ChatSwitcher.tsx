import { Icon, Switch } from '@chakra-ui/react'
import { HiOutlineMicrophone } from 'react-icons/hi'
import { PiMicrophoneSlashLight } from 'react-icons/pi'
import { Tooltip } from "@/components/ui/tooltip"

const ChatSwitcher = () => {
    return (
        <Switch.Root colorPalette="blue" size="lg">
            <Switch.HiddenInput />
            
            <Switch.Control>
                <Switch.Thumb />
                <Tooltip showArrow content="Turn on/off the microphone">
                <Switch.Indicator fallback={<Icon as={HiOutlineMicrophone} color="gray.400" />}>
                    <Icon as={PiMicrophoneSlashLight} color="white" />
                </Switch.Indicator>
                </Tooltip>
            </Switch.Control>
            
            <Switch.Label></Switch.Label>
        </Switch.Root>
    )
}

export default ChatSwitcher