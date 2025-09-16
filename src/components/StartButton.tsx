import { Button } from "@chakra-ui/react"
import { VscDebugStart } from "react-icons/vsc";
import { Tooltip } from "@/components/ui/tooltip"
import { t } from "i18next";

interface StartButtonProps {
  onClick?: () => void;
}


const StartButton = ({ onClick }: StartButtonProps) => {
  return (
    <Tooltip showArrow content={t("start_toolip")}>
      <Button bg={'blue.500'}
        onClick={onClick}
        variant="solid"
        h={{ md: "40px", base: "30px" }}
        w={{ md: "150px", base: "140px" }}
        fontSize={{ md: 'md', base: 'xs' }}
        mt={{ md: "0px", base: "25px" }}
        borderRadius={"lg"}
        boxShadow={
          '0px 1px 25px -5px rgb(66 153 225 / 48%), 0 10px 10px -5px rgb(66 153 225 / 43%)'
        }
        _hover={{
          bg: 'blue.400',
        }}
        _focus={{
          bg: 'blue.400',
        }}>
        <VscDebugStart />{t("start_btn")}</Button></Tooltip>
  )
}

export default StartButton
