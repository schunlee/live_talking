import { Button } from '@chakra-ui/react'
import { ScaleLoader } from 'react-spinners'

interface AudioWaveProps {
    btnDisabled: boolean;
    handleMouseUp: () => void;
    handleMouseLeave: () => void;
    handleTouchEnd: () => void;
}


const AudioWaveButton = ({ handleMouseUp, btnDisabled, handleMouseLeave, handleTouchEnd }: AudioWaveProps) => {
    return (
        <Button h={{ md: "40px", base: "40px" }}
            w={{ md: "40px", base: "40px" }}
            fontSize={'sm'}
            disabled={btnDisabled}
            rounded={'full'}
            bg={'green.500'}
            mr={3}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchEnd={handleTouchEnd}
            color={'white'}>
            <ScaleLoader barCount={4} height={10} color="white" />
        </Button>
    )
}

export default AudioWaveButton