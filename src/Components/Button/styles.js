import { StyleSheet, Dimensions, StatusBar, Platform } from 'react-native';
import { x, y, height, width, dimensionAssert } from '../../Functions/Functions';

export default StyleSheet.create({
  button: {
    backgroundColor: '#4DB748',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  position: {
    position: 'absolute',
  },
  text: {
    fontFamily: 'Gilroy-Bold',
    color: '#FFFFFF',
    fontSize: y(15, true)
  }
});

