"use client"

import { ChakraProvider, createSystem, defaultConfig, defaultSystem } from "@chakra-ui/react"
import {
  ColorModeProvider,
  type ColorModeProviderProps,
} from "./color-mode"

const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      fonts: {
        heading: { value: "Bricolage Grotesque Variable" },
        body: { value: "Bricolage Grotesque Variable" },
      },
    },
    keyframes: {
      pulse: {
        "0%": { transform: "scale(1)", opacity: 1 },
        "50%": { transform: "scale(1.2)", opacity: 0.8},
        "100%": { transform: "scale(1)", opacity: 1 },
      },
    },
  },
})

export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={system}>
      <ColorModeProvider {...props} />
    </ChakraProvider>
  )
}
