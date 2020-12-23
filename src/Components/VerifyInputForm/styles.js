import { StyleSheet, Dimensions, StatusBar, Platform } from 'react-native';
import { x, y, height, width, dimensionAssert } from '../../Functions/Functions';

export default StyleSheet.create({
  position: {
    justifyContent: 'center',
    alignItems: 'center',
    height: y(48),
    width: y(48),
    borderWidth: 1,
    borderColor: 'rgba(149,149,149,0.25)',
    borderRadius: 5
  },
  text: {
    fontFamily: 'Gilroy-Medium',
    fontSize: y(15),
  },
});