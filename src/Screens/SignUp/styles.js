import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';
import { x, y, height, width, dimensionAssert } from '../../Functions/Functions';

export default StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    flex: 1,
    alignItems: 'center',
  },
  secContainer: {
    alignItems: 'center',
    width: width,
    height: y(470 + (StatusBar.currentHeight ? StatusBar.currentHeight : 0)),
    marginTop: y(63.71),

  },
  logo: {
    height: y(81),
    width: x(51.53),
  },
  error: {
    fontFamily: 'Gilroy-SemiBold',
    fontSize: y(10),
    color: '#FF0000',
    bottom: dimensionAssert() ? (StatusBar.currentHeight ? x(12) : -x(6)) : (StatusBar.currentHeight ? x(45) : x(22)),
    textAlign: 'center',
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
  },

  view: {
    borderWidth: 1,
    borderColor: 'rgba(149,149,149,0.25)',
    borderRadius: 5,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    fontFamily: 'Gilroy-Regular',
    fontSize: y(15),
    paddingLeft: x(10),
    color: '#000000',
  },
  countryCodeBox: {
    width: '25%',
    borderRightWidth: 1,
    borderColor: 'rgba(149,149,149,0.25)',
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%'
  },

  //picker
  pickerView: {
    position: 'absolute',
    zIndex: 2,
    backgroundColor: '#DBD4D4'
  },
  pickerChoice: {
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    flexDirection: 'row-reverse',
    borderColor: '#B2ACAC'
  },
  picker_: {
    width: width,
    height: y(250),
  },
  pM: {
    width: x(343),
    fontFamily: 'Gilroy-Bold',
    fontSize: y(17),
    marginTop: y(70)
  },
  pMView: {
    backgroundColor: 'rgba(145, 134, 134, 0.5)',
    width: width,
    padding: y(10),
    alignItems: 'center',
  },
  pM_: {
    width: x(343),
    fontFamily: 'Gilroy-Regular',
    fontSize: y(13),
  },
});
