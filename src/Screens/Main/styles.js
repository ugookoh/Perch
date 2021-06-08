import { StyleSheet, Dimensions, StatusBar, Platform } from 'react-native';
import { x, y, height, width, dimensionAssert } from '../../Functions/Functions';

export default StyleSheet.create({
  container: {
    backgroundColor: '#ECF7EB',
    flex: 1,
    alignItems: 'center',
  },
  point: {
    position: 'absolute',
    height: y(37.3),
    width: x(25.13),
    zIndex: 2,
    top: height / 2,
    alignSelf: 'center',

  },
  maps: {
    height: y(900),
    width: width,
    position: 'absolute',
    top: 0,
    left: 0,

    elevation: 0,
    zIndex: 0,
  },
  menuTO: {
    top: y(57),
    left: -x(146),
    height: x(52),
    width: x(52),
    elevation: 1,
    zIndex: 1,
  },
  zoomIcon: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    height: y(dimensionAssert() ? 55 : 45),
    width: y(dimensionAssert() ? 55 : 45),
    borderRadius: y(60),
    zIndex: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 13.84,

    elevation: 1,

    justifyContent: 'center',
    alignItems: 'center',

  },
  menu: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    height: x(52),
    width: x(52),
    backgroundColor: '#4DB748',
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  sContainer: {
    backgroundColor: '#ECF7EB',
    position: 'absolute',
    borderRadius: 10,
    right: x(15),
    alignItems: 'center',
    flexDirection: 'row',
    height: y(dimensionAssert() ? 35 : 30),
    width: y(dimensionAssert() ? 35 : 30),
    justifyContent: 'space-around',
  },
  iosSpinnerView: {
    backgroundColor: '#403D3D',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    top: y(130),
    zIndex: 4
  },
  iosSpinner: {
    paddingHorizontal: x(40),
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: x(320),
    height: y(40),
    backgroundColor: '#403D3D',
    top: y(40),
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  menuView: {
    position: 'absolute',
  },
  menu_: {
    height: x(24),
    width: x(24),
  },
  lowerSection: {
    position: 'absolute',
    //top:y(538),
    left: 0,
    alignItems: 'center',
    width: width,
    //zIndex:1
    //[Platform.OS === 'android' ? 'elevation' : 'zIndex']: 1,
  },
  voidSpace: {
    width: x(343),
    height: y(61),
  },
  searchInverse: {
    position: 'absolute',
    backgroundColor: '#4DB748',
    borderRadius: 5,
    //left:x(16),
    justifyContent: 'center',
    shadowColor: "#000",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,

    zIndex: 2,
    elevation: 2,

  },
  searchInverse_TO: {
    flex: 1,
    justifyContent: 'center'
  },
  done: {
    backgroundColor: '#FFFFFF',
    height: y(70),
    width: x(335),
    borderRadius: 10,
    position: "absolute",
    top: y(dimensionAssert() ? 615 : 625),
    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 3,
  },
  doneView: {
    //backgroundColor:'#4DB748',
    width: '95%',
    height: '70%',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  doneText: {
    fontFamily: 'Gilroy-Bold',
    color: '#FFFFFF',
    fontSize: y(15, true)
  },
  mainText: {
    fontFamily: 'Gilroy-Bold',
    fontSize: y(20, true),
    color: '#FFF',
    marginLeft: x(16),
  },
  history: {
    position: 'relative',
    top: y(-38),
    left: x(0),
    backgroundColor: '#ECF7EB',
    width: width,
    height: y(175),
    justifyContent: 'flex-end'
  },
  choiceSplit: {
    position: 'relative',
    backgroundColor: '#4DB748',
    top: y(-38),
    height: y(105),
    width: width,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center'
  },
  addressMain: {
    fontFamily: 'Gilroy-Medium',
    fontSize: y(15, true),
    width: x(280),
  },
  address2nd: {
    fontFamily: 'Gilroy-Medium',
    fontSize: y(12, true),
    color: '#4DB748',
    width: x(280),
  },
  icon: {
    paddingLeft: x(32),
    paddingRight: x(14.1),
    opacity: 0.6,
  },
  historyList: {
    flexDirection: 'row',
    alignItems: 'center',
    height: y(65),
    width: width
  },
  choice: {
    fontSize: y(15, true),
    fontFamily: 'Gilroy-Bold',
    color: '#FFF',
    // top: -x(10),
    // left: x(10)
  },
  choiceView: {
    height: y(105),
    width: x(188),
    justifyContent: 'center',
    alignItems: 'center'
  },
  choice_: {
    alignItems: 'center',
    top: -x(4),
  },
  choiceIcon: {
    height: y(40),
    width: y(40),
    top: -x(4),
    //position:'absolute',
  },

  container_: {
    flex: 1,
  },
  searchBar: {
    height: y(156),
    width: width,
    //backgroundColor: '#4DB748',
    position: 'absolute',
    top: dimensionAssert() ? -x(7) : 0,
    left: 0,
  },
  cancelIcon: {
    top: y(95.32),
    left: x(18),
    position: 'absolute',
    height: y(35),
    width: y(35),
  },
  canceldivider: {
    position: 'absolute',
    top: dimensionAssert() ? y(61.64) : y(71.64),
    left: x(60)
  },
  textDivider: {
    position: 'absolute',
    top: dimensionAssert() ? y(103.78) : y(106.78),
    left: x(97.5)
  },
  icon1: {
    top: dimensionAssert() ? y(60.64) : y(73.64),
    left: x(82.17),
    position: 'absolute'
  },
  icon2: {
    top: dimensionAssert() ? y(116.26) : y(118.26),
    left: x(82.17),
    position: 'absolute'
  },
  currentLocation: {
    //height: y(28),
    paddingVertical: x(3),
    paddingHorizontal: x(5),
    //width: x(141.14),
    top: dimensionAssert() ? y(60.32) : y(73.32),
    left: x(120),
    position: 'absolute',
    backgroundColor: '#266F23',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentLocationText: {
    color: '#FFF',
    fontFamily: 'Gilroy-Medium',
    fontSize: y(16, true),
  },
  locationInput: {
    height: y(28),
    top: dimensionAssert() ? y(62.78) : y(72.78),
    left: x(119),
    width: x(256),
    position: 'absolute',
    color: '#FFF',
    fontFamily: 'Gilroy-Medium',
    fontSize: y(16, true),
    padding: 0,
  },
  destinationInput: {
    width: x(240),
    height: y(28),
    top: y(118.32),
    left: x(119),
    position: 'absolute',
    color: '#FFF',
    fontFamily: 'Gilroy-Medium',
    fontSize: y(16, true),
    padding: 0,//makes textinput visible on android
    //backgroundColor:'red',

  },
  suggestions: {
    height: y(650),
    width: width,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    left: 0,
    position: 'absolute',
    zIndex: 3,
    //elevation:3,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 3,
  },
  suggestionHeader: {
    height: y(33),
    justifyContent: 'flex-end',
    marginLeft: x(16),
    marginTop: y(8),
    marginBottom: y(10),
  },
  suggestionHeaderText: {
    fontFamily: 'Gilroy-ExtraBold',
    fontSize: y(20, true),
    color: '#4DB748',
    opacity: 0.57

  },
  resultView: {
    //height: dimensionAssert()?y(62):y(56),
    width: width,
    alignItems: 'center',
    flexDirection: 'row',
  },
  mainAddress: {
    fontFamily: 'Gilroy-Medium',
    fontSize: y(16, true),
    color: '#000000',
    maxWidth: x(310),
    marginTop: y(3),
  },
  secondaryAddress: {
    fontFamily: 'Gilroy-Medium',
    fontSize: y(11, true),
    color: '#000000',
    maxWidth: x(310),
    marginBottom: y(5),
    opacity: 0.7

  },
  resultIcon: {
    paddingLeft: x(15),
    paddingRight: x(10),
  },
  resultDivider: {
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.08
  },
});