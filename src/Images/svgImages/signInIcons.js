import React from 'react';
import { View } from 'react-native';
import Svg, { G, Path, } from 'react-native-svg';


export default class SignInIcons extends React.Component {
    render() {
        if (this.props.icon == 'envelope')
            return (
                <View style={{ height: this.props.height, width: this.props.width }}>
                    <Svg id="envelope" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13.236 9.927">
                        <G id="Group_3" data-name="Group 3">
                            <G id="Group_2" data-name="Group 2">
                                <Path id="Path_86" data-name="Path 86" d="M7.011,64.805c1.817,1.538,5,4.245,5.941,5.089a.553.553,0,0,0,.8,0c.938-.845,4.125-3.552,5.942-5.09a.276.276,0,0,0,.039-.381A1.1,1.1,0,0,0,18.868,64H7.838a1.1,1.1,0,0,0-.865.425A.276.276,0,0,0,7.011,64.805Z" transform="translate(-6.735 -64)" fill="#4db748" />
                                <Path id="Path_87" data-name="Path 87" d="M13.076,126.437a.274.274,0,0,0-.294.04c-2.015,1.708-4.586,3.9-5.395,4.626a1.117,1.117,0,0,1-1.539,0c-.862-.777-3.75-3.231-5.394-4.625a.276.276,0,0,0-.454.21v6.935a1.1,1.1,0,0,0,1.1,1.1h11.03a1.1,1.1,0,0,0,1.1-1.1v-6.935A.276.276,0,0,0,13.076,126.437Z" transform="translate(0 -124.798)" fill="#4db748" />
                            </G>
                        </G>
                    </Svg>
                </View>
            )
        else (this.props.icon == 'padlock')
            return (
                <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 11.153 14.871">
                    <Path id="lock" d="M9.759,5.577H9.294V3.718a3.718,3.718,0,1,0-7.436,0V5.577H1.394A1.4,1.4,0,0,0,0,6.971v6.506a1.4,1.4,0,0,0,1.394,1.394H9.759a1.4,1.4,0,0,0,1.394-1.394V6.971A1.4,1.4,0,0,0,9.759,5.577ZM3.1,3.718a2.478,2.478,0,1,1,4.957,0V5.577H3.1Zm0,0" fill="#4db748" />
                </Svg>
            )
    }
}


