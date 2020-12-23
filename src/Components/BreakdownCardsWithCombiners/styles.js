import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';
import { height, width, x, y, dimensionAssert } from '../../Functions/Functions';
const CONTAINER_WIDTH = x(343);
const CARD_WIDTH = x(319);

export default StyleSheet.create({
  cardCentralize: {
    alignItems: 'center',
    width: CONTAINER_WIDTH,
  },
  driverCentralize_: {
    width: x(343),
    alignItems: 'center',
  },
  dp: {
    position: 'absolute',
    borderWidth: 2,
    width: x(55),
    height: x(55),
    borderRadius: x(60),
    top: x(20),
    left: x(8),
    overflow:'hidden',
  },
  driverCentralize: {
    flexDirection: 'row',
  },
  profileConatainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileFrame: {
    height: y(dimensionAssert() ? 125 : 102.72),
    width: y(dimensionAssert() ? 125 : 102.72),
    borderRadius: 1000,
    borderWidth: 2,
    marginRight: x(10),
    marginLeft: -x(65),
    overflow:'hidden'
  },
  nextDriverContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: x(343),
    marginBottom: y(3),
  },

  rideConfirmedText: {
    fontSize: y(13),
    fontFamily: 'Gilroy-ExtraBold',
    color: '#4DB748',
  },
  star: {
    width: x(80),
  },
  driverName: {
    fontFamily: 'Gilroy-Bold',
    fontSize: y(20),
    marginBottom: y(dimensionAssert() ? 0 : 3),
  },
  driverTripNumber: {
    marginBottom: y(dimensionAssert() ? 0 : 3),
    fontFamily: 'Gilroy-Regular',
    fontSize: y(15),
    color: '#ACB1C0',
  },

  historyRating: {
    position: 'absolute',
    right: (0),
    bottom: 0,
    flexDirection: 'row',
  },
  timer: {
    borderRadius: x(9),
    width: y(dimensionAssert() ? 70 : 58.43),
    height: y(dimensionAssert() ? 70 : 60.43),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    right: -x(65),
    bottom: 0,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.5,
    shadowRadius: 30.00,

    elevation: 2,
  },

  card: {
    //height: y(130),
    width: x(319),
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.36,
    shadowRadius: 6.68,
    elevation: 11,
  },
  loader: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    position: 'absolute',
    backgroundColor: 'rgba(180, 179, 179, 0.50)',
  },
  bubble: {
    borderRadius: x(9),
    width: y(dimensionAssert() ? 60 : 48.43),
    height: y(dimensionAssert() ? 60 : 50.43),
    justifyContent: 'center',
    alignItems: 'center',
  },
  seatNumber: {
    textAlign: 'center',
    fontFamily: 'Gilroy-ExtraBold',
    fontSize: y(18),
  },
  name: {
    fontFamily: 'Gilroy-ExtraBold',
    fontSize: y(18),
    width: x(175),
  },
  seatLeft: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: x(3),
    //width: x(65),
    position: 'absolute',
    right: -x(61),
  },
  car: {
    fontFamily: 'Gilroy-SemiBold',
    fontSize: y(15),
    //lineHeight:y(9),
    width: x(225),
  },
  youRated: {
    fontFamily: 'Gilroy-SemiBold',
    fontSize: y(12),
  },
  topCombiner: {
    //height: y(60),
    width: CARD_WIDTH,
    flexDirection: 'row'
    //backgroundColor:'black'
  },
  middleAligner: {
    flexDirection: 'column',
    paddingLeft: x(5),
    alignItems: 'center'
  },
  combinerTime: {
    fontSize: y(12),
    fontFamily: 'Gilroy-ExtraBold',
    //position: 'absolute'
  },
  time: {
    justifyContent: 'center',
    alignItems: 'center',
    height: y(50.43),
    width: x(49.57),
    borderRadius: 10,
    position: 'absolute',
    right: x(13.5),
    bottom: y(12)
  },
  // topCardIcon: {
  //   position: 'absolute',
  //   top: y(62.3),
  //   left: x(53.8),
  // },
  // bottomCardIcon: {
  //   position: 'absolute',
  //   left: x(53.8),
  //   top: y(106.3),
  // },
  topCardText: {
    //position: 'absolute',
    //top: y(62.3),
    //left: x(70),
    fontFamily: 'Gilroy-SemiBold',
    fontSize: y(12),
  },
  // carIcon: {
  //   position: 'absolute',
  //   left: x(29),
  //   top: y(83)
  // },
  bottomCardText: {
    //position: 'absolute',
    //left: x(70),
    //top: y(106.3),
    fontFamily: 'Gilroy-SemiBold',
    fontSize: y(12),
  },
  // cardDivider: {
  //  //position: 'absolute',
  //   top: y(74.9),
  //   left: x(58.9),
  // },
  combinerText: {
    fontSize: y(13),
    fontFamily: 'Gilroy-Medium',
    //position: 'absolute'
    width: x(230),
  },
  middle: {
    height: y(44),
    justifyContent: 'center'
  },
  bubbleText: {
    color: '#FFF',
    fontFamily: 'Gilroy-ExtraBold'
  },

  distanceText: {
    fontSize: y(16),
    fontFamily: 'Gilroy-ExtraBold',
  },
  middleWalker: {
    position: 'absolute',
    left: x(34),
    top: y(12.3),
  },

  middleCombiner: {
    alignItems: 'center',
    height: y(44),
    width: CARD_WIDTH,
    flexDirection: 'row'
  },
  bottomCombiner: {
    height: y(60),
    width: CONTAINER_WIDTH,
  },
  bottomIcon: {
    position: 'absolute',
    left: x(65.4),
    bottom: 0,
  },
  bottomDivider: {
    position: 'absolute',
    top: 0,
    left: x(70),
  },
  bottomWalker: {
    position: 'absolute',
    left: x(34),
    top: y(12.3),
  },
});
