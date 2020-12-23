import React from 'react';
import { View } from 'react-native';
import Svg, { G, Path, Rect } from 'react-native-svg';


export default class Menu extends React.Component {
    render() {
        return (
            <View style={{ height: this.props.height, width: this.props.width }}>
                <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <G id="icons_menu" data-name="icons/menu" transform="translate(-48 -134)">
                        <Rect id="bg" width="24" height="24" transform="translate(48 134)" fill="none" />
                        <Path id="ico" d="M8.75,13.5a.75.75,0,0,1,0-1.5h10.5a.75.75,0,0,1,0,1.5Zm-8-6A.75.75,0,0,1,.75,6h18.5a.75.75,0,0,1,0,1.5Zm0-6A.75.75,0,0,1,.75,0h10.5a.75.75,0,0,1,0,1.5Z" transform="translate(50 139)" fill="#fff" />
                    </G>
                </Svg>
            </View>
        )
    }
}


