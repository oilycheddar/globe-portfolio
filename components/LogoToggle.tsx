"use client"

import { useThemeStore } from '../hooks/useThemeStore'
import { ToggleButton } from './toggleButton'

export default function LogoToggle() {
  const { logo3DEnabled, setLogo3DEnabled } = useThemeStore()

  return (
    <ToggleButton
      type="boolean"
      label="3D"
      value={logo3DEnabled}
      onChange={setLogo3DEnabled}
    />
  )
} 