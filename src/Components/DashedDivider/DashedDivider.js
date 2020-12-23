import React from 'react';
import {View} from 'react-native';
import Dash from 'react-native-dash';

export default class DashedDivider extends React.Component {
    render() {

        const flexDirection=this.props.height>this.props.width?'column':'row';
        return (
            // <View style={{
            //     borderColor:this.props.borderColor,
            //     height:this.props.height,
            //     width:this.props.width,
            //     borderRadius:this.props.borderRadius,
            //     borderWidth:this.props.borderWidth,
            //     borderStyle:'dashed'}}>
            // </View>

            <Dash style={{ width: this.props.width, height: this.props.height, flexDirection: flexDirection }} dashColor={this.props.borderColor} />
        );
    }
}