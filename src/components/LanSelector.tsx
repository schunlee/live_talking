import { NativeSelect} from "@chakra-ui/react"
import { Tooltip } from "@/components/ui/tooltip"

const LanSelector = () => {
  return (
    <Tooltip showArrow content="Select AI Model Language">
      <NativeSelect.Root size="sm" width={{ md: "100px", base: "140px" }} h={{ md: "40px", base: "10px" }} variant={"plain"}>
        <NativeSelect.Field>
          <option value="react">English</option>
          <option value="vue">Chinese</option>
        </NativeSelect.Field>
        <NativeSelect.Indicator />
      </NativeSelect.Root>
    </Tooltip>
  )
}

export default LanSelector
