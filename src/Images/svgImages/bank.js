import React from 'react';
import { View } from 'react-native';
import Svg, { G, Path, } from 'react-native-svg';


export default class Bank extends React.Component {
  render() {
    return (
      <View style={{ height: this.props.height, width: this.props.width }}>
        <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25.559 23.023">
          <Path id="Path_1655" data-name="Path 1655" d="M23.949,165.228h1.428v13.319H23.949v5.268H49.508v-5.268H47.434V165.228h2.074v-4.435H23.949Zm15.079,0H42.19v13.319H39.028Zm-8.406,0h3.162v13.319H30.621Zm0,0" transform="translate(-23.949 -160.793)" fill="#00a7d9" />
        </Svg>
      </View>
    )
  }
}


