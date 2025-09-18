import { Button, } from '@chakra-ui/react'
import { Tooltip } from "@/components/ui/tooltip"
import { t } from 'i18next';
import { VscDebugPause, VscDebugStart } from 'react-icons/vsc';

interface PauseButtonProps {
    isSpeaking: boolean;
    onClick?: () => void;
}


const PauseButton = ({ isSpeaking, onClick }: PauseButtonProps) => {
    return (
        <Tooltip showArrow content={t("pause_btn")}>
            <Button
                onClick={onClick}
                h={{ md: "40px", base: "40px" }}
                w={{ md: "40px", base: "40px" }}
                fontSize={'sm'}
                rounded={'full'}
                bg={'blue.500'}
                color={'white'}
                borderRadius="full"
                disabled={!isSpeaking}
                boxShadow={
                    '0px 1px 25px -5px rgb(66 153 225 / 48%), 0 10px 10px -5px rgb(66 153 225 / 43%)'
                }>
                    {isSpeaking && <VscDebugPause />}
                    {!isSpeaking && <VscDebugStart />}
                
            </Button>
        </Tooltip>
    )
}

export default PauseButton
