import * as React from "react"
import Svg, { Defs, LinearGradient, Stop, Path } from "react-native-svg"

function SvgComponent() {
  return (
    <Svg viewBox="0 0 20.125 31.317">
      <Defs>
        <LinearGradient
          id="prefix__a"
          y1={0.5}
          x2={1}
          y2={0.5}
          gradientUnits="objectBoundingBox"
        >
          <Stop offset={0} stopColor="#5f965d" />
          <Stop offset={1} stopColor="#3f9a3b" />
        </LinearGradient>
        <LinearGradient
          id="prefix__b"
          x1={-0.133}
          y1={0.504}
          x2={1.044}
          y2={0.471}
          gradientUnits="objectBoundingBox"
        >
          <Stop offset={0} stopColor="#3f9a3b" />
          <Stop offset={1} stopColor="#0a4b07" />
        </LinearGradient>
      </Defs>
      <Path
        data-name="Path 2344"
        d="M24.063 4A10.063 10.063 0 0014 14.063a10.216 10.216 0 00.052 1.025.39.39 0 00.007.05 10.667 10.667 0 002.885 6.341 20.125 20.125 0 015.739 11.734l.123.983a1.266 1.266 0 002.516 0l.123-.983a20.125 20.125 0 015.739-11.734 10.667 10.667 0 002.885-6.341c0-.017.006-.034.007-.05q.05-.515.05-1.025A10.062 10.062 0 0024.062 4zm0 14.535a4.472 4.472 0 114.472-4.472 4.472 4.472 0 01-4.472 4.472z"
        transform="translate(-14 -4)"
        fill="url(#prefix__a)"
      />
      <Path
        data-name="Path 2345"
        d="M31.987 4h-.017l.006 5.59h.011a4.472 4.472 0 010 8.944h-.011l.011 16.771a1.267 1.267 0 001.258-1.105l.123-.984A20.1 20.1 0 0139.1 21.481a9.671 9.671 0 001.968-2.907 11.232 11.232 0 00.917-3.438c.006-.017.006-.034.011-.05q.05-.512.05-1.023A10.062 10.062 0 0031.987 4z"
        transform="translate(-21.924 -4)"
        fill="url(#prefix__b)"
      />
    </Svg>
  )
}

export default SvgComponent
