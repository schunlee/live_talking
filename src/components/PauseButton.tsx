import { Button, } from '@chakra-ui/react'
import { Tooltip } from "@/components/ui/tooltip"
import { FaPause } from 'react-icons/fa';
import { t } from 'i18next';

interface PauseButtonProps {
    onClick?: () => void;
}


const PauseButton = ({ onClick }: PauseButtonProps) => {
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
                boxShadow={
                    '0px 1px 25px -5px rgb(66 153 225 / 48%), 0 10px 10px -5px rgb(66 153 225 / 43%)'
                }>
                <FaPause />
            </Button>
        </Tooltip>
    )
}

export default PauseButton
