

import React from 'react';
import { View } from 'react-native';
import Svg, { G, Path, Rect } from 'react-native-svg';


export default class Visa extends React.Component {
    render() {
        return (
            <View style={{ height: this.props.height, width: this.props.width }}>
                <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 58" >
                    <Path
                        d="M54.783 50H3.217A3.217 3.217 0 010 46.783V11.217A3.217 3.217 0 013.217 8h51.566A3.217 3.217 0 0158 11.217v35.566A3.217 3.217 0 0154.783 50"
                        fill="#8798cc"
                    />
                    <Path fill="#556180" d="M0 13h58v8H0z" />
                    <Path
                        d="M15 26H6a1 1 0 100 2h9a1 1 0 100-2M29 27a1 1 0 00-1-1h-9a1 1 0 100 2h9a1 1 0 001-1M7 31H6a1 1 0 100 2h1a1 1 0 100-2M13 31h-2a1 1 0 100 2h2a1 1 0 100-2M18 31h-1a1 1 0 100 2h1a1 1 0 100-2M24 31h-2a1 1 0 100 2h2a1 1 0 100-2M27.29 31.29c-.181.19-.29.45-.29.71 0 .26.109.52.29.71.188.18.438.29.71.29.26 0 .519-.11.71-.29.18-.19.29-.45.29-.71 0-.26-.11-.52-.29-.71-.37-.37-1.05-.37-1.42 0"
                        fill="#b0d3f0"
                    />
                    <Path fill="#91bae1" d="M36 34h16v10H36z" />
                </Svg>
            </View>
        )

    }
}

