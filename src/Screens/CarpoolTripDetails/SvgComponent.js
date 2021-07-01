import React from 'react';
import Svg, { G, Path } from "react-native-svg";
import { colors } from '../../Functions/Functions';

export default function SvgComponent() {
    return (
        <Svg width={16} height={24} viewBox="0 0 14 20" fill={colors.GREY}>
            <G data-name="Group 3003">
                <Path
                    data-name="pin_sharp_circle-[#625]"
                    d="M7 0a7 7 0 00-7 7c0 3.866 7 13 7 13s7-9.134 7-13a7 7 0 00-7-7"
                    fillRule="evenodd"
                />
                <G data-name="Page-1">
                    <G data-name="Dribbble-Light-Preview">
                        <G data-name="icons">
                            <Path
                                data-name="pin_sharp_circle-[#625]"
                                d="M7 7.635a1 1 0 111-1 1 1 0 01-1 1m0-4a3 3 0 103 3 3 3 0 00-3-3"
                                fill="#fff"
                                fillRule="evenodd"
                            />
                        </G>
                    </G>
                </G>
            </G>
        </Svg>
    );
};