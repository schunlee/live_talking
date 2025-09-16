import { Button } from '@chakra-ui/react'
import { ScaleLoader } from 'react-spinners'

interface AudioWaveProps {
    handleClick: () => void;
}


const AudioWaveButton = ({ handleClick }: AudioWaveProps) => {
    return (
        <Button h={{ md: "40px", base: "40px" }}
            w={{ md: "40px", base: "40px" }}
            fontSize={'sm'}
            rounded={'full'}
            bg={'green.500'}
            mr={3}
            color={'white'}>
            <ScaleLoader barCount={4} height={10} color="white" onClick={handleClick} />
        </Button>
    )
}

export default AudioWaveButton