import { NativeSelect } from "@chakra-ui/react"
import { Tooltip } from "@/components/ui/tooltip"

interface LanSelectorProps {
  value: string
  onChange: (value: string) => void
}

const LanSelector = ({ value, onChange }: LanSelectorProps) => {
  return (
    <Tooltip showArrow content="Select AI Model Language">
      <NativeSelect.Root
        size="sm"
        width={{ md: "100px", base: "140px" }}
        h={{ md: "40px", base: "10px" }}
        variant="plain"
      >
        <NativeSelect.Field
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)} // ✅ 外部管理
        >
          <option value="en">English</option>
          <option value="zh">Chinese</option>
        </NativeSelect.Field>
        <NativeSelect.Indicator />
      </NativeSelect.Root>
    </Tooltip>
  )
}

export default LanSelector
