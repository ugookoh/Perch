import * as React from "react"
import Svg, { G, Path, Circle } from "react-native-svg"

function SvgComponent() {
  return (
    <Svg viewBox="0 0 64 64">
      <G data-name="Layer 216">
        <Path
          fill="none"
          stroke="#4DB748"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={4}
          d="M11 23v28.87A9.13 9.13 0 0020.13 61h2.93A3.94 3.94 0 0027 57.06V54h10v3.06A3.94 3.94 0 0040.94 61h2.93A9.13 9.13 0 0053 51.87V23A21 21 0 0032 2h0a21 21 0 00-21 21zM24 54h16"
        />
        <Circle cx={20} cy={22} r={2} fill="#4DB748" />
        <Circle cx={44} cy={22} r={2} fill="#4DB748" />
        <Path
          fill="none"
          stroke="#4DB748"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={4}
          d="M11 41v6a4 4 0 004 4h0a4 4 0 004-4v-6m34-6v6a4 4 0 01-4 4h0a4 4 0 01-4-4v-6m-6-3.91C37.67 29.84 35 29 32 29a11.13 11.13 0 00-6.9 2"
        />
      </G>
    </Svg>
  )
}

export default SvgComponent
