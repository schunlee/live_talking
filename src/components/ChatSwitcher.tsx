import { Icon, Switch } from '@chakra-ui/react'
import { HiOutlineMicrophone } from 'react-icons/hi'
import { PiMicrophoneSlashLight } from 'react-icons/pi'
import { Tooltip } from "@/components/ui/tooltip"

interface ChatSwitcherProps {
    isOn: boolean;
    onToggle: () => void;
}

const ChatSwitcher = ({ isOn, onToggle }: ChatSwitcherProps) => {
    return (
        <Switch.Root
            colorPalette="blue"
            size="lg"
            onCheckedChange={onToggle}
            checked={isOn}>

            <Switch.HiddenInput />

            <Switch.Control>
                <Switch.Thumb />
                <Tooltip showArrow content="Turn on/off the microphone">
                    <Switch.Indicator fallback={<Icon as={PiMicrophoneSlashLight} color="gray.400" />}>
                        <Icon as={HiOutlineMicrophone} color="white" />
                    </Switch.Indicator>
                </Tooltip>
            </Switch.Control>

            <Switch.Label></Switch.Label>
        </Switch.Root>
    )
}

export default ChatSwitcher