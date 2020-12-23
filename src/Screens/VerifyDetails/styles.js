import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';
import { x, y, height, width, dimensionAssert } from '../../Functions/Functions';

export default StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  logo: {
    position: 'absolute',
    left: x(162.02),
    top: y(63.71),
    height: y(81),
    width: x(51.53),
  },
  signUp: {
    alignItems: 'center',
    position: 'absolute',
    top: y(164),
    width: width,
  },
  sinUpText: {
    fontSize: y(30),
    lineHeight: y(36),
    textAlign: 'center',
    fontFamily: 'Gilroy-SemiBold',
  },
  text1: {
    position: 'absolute',
    top: y(203),
    width: width,
    alignItems: 'center',
  },
  regularText: {
    fontSize: y(15),
    lineHeight: y(25),
    textAlign: 'center',
    fontFamily: 'Gilroy-Medium',
  },
  messageText: {
    fontFamily: 'Gilroy-Regular',
    fontSize: y(15),
  },
  messageView: {
    position: 'absolute',
    left: x(0),
    width: width,
    alignItems: 'center'
  },
  form: {
    flexDirection: 'row',
    width: x(264),
    justifyContent: 'space-between',
    position: 'absolute',
    top: y(285),
    left: x(56),
  }
});