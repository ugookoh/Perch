import React from 'react';
import { View } from 'react-native';
import Dash from 'react-native-dash';
export default class Divider extends React.Component {
    render() {
        const flexdirection = this.props.height > this.props.width ? 'column' : 'row';
        return (
            <View style={{ height: this.props.height, width: this.props.width, borderRadius: this.props.borderRadius, borderColor: this.props.borderColor, borderWidth: this.props.borderWidth, }}>
            </View>
            // <Dash style={{ height: this.props.height, width: this.props.width, flexDirection: flexdirection }} dashGap={0} dashColor={this.props.borderColor} />
        );
    }
}