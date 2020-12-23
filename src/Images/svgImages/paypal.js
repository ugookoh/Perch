import React from 'react';
import { View } from 'react-native';
import Svg, { G, Path, Defs, LinearGradient, Stop, Rect, Circle } from 'react-native-svg';


export default class PayPal extends React.Component {
  render() {
    return (
      <View style={{ height: this.props.height, width: this.props.width }}>
        <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19.664 23.023">
          <G id="paypal_1_" data-name="paypal (1)" transform="translate(-37.352)">
            <Path id="Path_1676" data-name="Path 1676" d="M43.507,13.653a1.028,1.028,0,0,1,1.017-.863H46.64c4.157,0,7.411-1.675,8.362-6.52.029-.144.073-.42.073-.42A4.578,4.578,0,0,0,54.1,1.737C53.023.521,51.08,0,48.6,0H41.383a1.032,1.032,0,0,0-1.02.863l-3,18.895a.616.616,0,0,0,.612.709h4.452l1.118-7.036Z" transform="translate(0 0)" fill="#0d47a1" />
            <Path id="Path_1677" data-name="Path 1677" d="M173.537,157.79h-1.9l-1.416,8.962H173.3a.9.9,0,0,0,.892-.757l.036-.19.708-4.448.046-.245a.9.9,0,0,1,.891-.757h.563c3.636,0,6.482-1.465,7.314-5.7a4.931,4.931,0,0,0-.652-4.157C182.066,155.266,178.769,157.79,173.537,157.79Z" transform="translate(-126.898 -143.729)" fill="#0d47a1" />
          </G>
        </Svg>
      </View>
    )
  }
}


