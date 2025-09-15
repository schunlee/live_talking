import { Box, Flex } from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip"

interface StartProps {
    content: string;
}

function StatusTag({ content }: StartProps) {
    return (
        <Tooltip showArrow content="Status of AI Avatar">
            <Flex justifyContent="center" alignItems="center">
                <Box bgColor="#B0AFB0" borderRadius="xl" px={2} py={1} color="#F4F2F3">{content}</Box>
            </Flex>
        </Tooltip>
    );
}

export default StatusTag;