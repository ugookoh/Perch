import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';
import { x, y, height, width, dimensionAssert } from '../../Functions/Functions';

export default StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    flex: 1,
    alignItems:'center',
  },
  secContainer: {
    alignItems: 'center',
    width: width,
    height: y(470 + (StatusBar.currentHeight ? StatusBar.currentHeight : 0) ),
    marginTop: y(63.71),

  },
  logo: {
    height: y(81),
    width: x(51.53),
  },
  error: {
    fontFamily: 'Gilroy-ExtraBold',
    fontSize: y(15),
    color: '#FF0000',
    bottom:dimensionAssert()?(StatusBar.currentHeight?x(12):-x(6)):(StatusBar.currentHeight?x(45):x(25)),
    textAlign:'center',
},
  signUp: {
    alignItems: 'center',
    top: y(20.29),
    width: width,
  },
  sinUpText: {
    fontSize: y(30),
    lineHeight: y(36),
    textAlign: 'center',
    fontFamily: 'Gilroy-SemiBold',
  },
  inputContainer: {
    top: y(40),
  },
  messageText: {
    fontFamily: 'Gilroy-Regular',
    fontSize: y(15),
  },
  topInput: {
    width: x(322),
    height: y(48),
    flexDirection: 'row',
    justifyContent: 'space-between',

  },
  messageView: {
    position: 'absolute',
    left: x(0),
    width: width,
    alignItems: 'center'
  }
});
