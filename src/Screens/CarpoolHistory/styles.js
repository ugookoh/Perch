import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';
import { x, y, height, width, dimensionAssert } from '../../Functions/Functions';
const MAX_HEADER_HEIGHT = y(156);
const MIN_HEADER_HEIGHT = y(96.5);

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    zIndex: 3,
  },
  body: {
    width: width,
  },
  spaceout: {
    width: x(313),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rating: {
    position: 'absolute',
    width: width,
    height: height - MIN_HEADER_HEIGHT,
    top: MIN_HEADER_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainBackground: {
    position: 'absolute',
    //zIndex: 1,
    backgroundColor: '#FFFFFF',
    height: height,
    width: width
  },
  mapGroup: {
    height: y(dimensionAssert() ? 340 : 310),
    width: x(343),
    backgroundColor: '#FFFFFF',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
    borderRadius: 10,
    marginBottom: 20,

  },
  help: {
    width: x(343),
    backgroundColor: '#FFFFFF',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  contactUsContainer: {
    flexDirection: 'row',
    zIndex: 2,
    width: x(313),
    justifyContent: 'space-between',
  },
  travel: {
    flexDirection: 'row',
    position: 'absolute',
    left: x(16),
  },
  calendar: {
    flexDirection: 'row',
    position: 'absolute',
    top: y(dimensionAssert() ? 17 : 22),
    right: x(23.4)
  },
  LtoD_Divider: {
    left: x(dimensionAssert() ? 20 : 21.5),
    top: y(dimensionAssert() ? 72 : 70),
    position: 'absolute'
  },
  maps: {
    height: y(123),
    width: x(312),
    position: 'absolute',
    bottom: x(15),
    left: x(16),
  },
  tripContainer: {
    zIndex: 1,
    width: width,
    alignItems: 'center',
    position: 'absolute',
    //backgroundColor:'#FFFFFF',
    //top:y(0),
  },
  tripDetails: {
    width: x(343),
    backgroundColor: '#FFFFFF',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',

  },
  background: {
    backgroundColor: '#FFFFFF',
    width: width,
    height: 1150,
    position: 'absolute',
    top: y(20),
  },
  tripBreakdown: {
    //height: y(680),
    width: x(343),
    backgroundColor: '#FFFFFF',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
    borderRadius: 10,
    alignItems: 'center',
  },

  tripTitle: {
    fontFamily: 'Gilroy-ExtraBold',
    color: '#000000',
    fontSize: y(20, true),
    zIndex: 2,
  },
  firstLayer: {
    fontFamily: 'Gilroy-Medium',
    color: '#000000',

    fontSize: y(15, true),
    zIndex: 2,
  },
  divider: {
    zIndex: 2,
    width: x(343),
    alignItems: 'center',
    opacity: 0.25,

  },
  total: {
    fontFamily: 'Gilroy-ExtraBold',
    color: '#000000',
    fontSize: y(22, true),
    zIndex: 2,
    color: '#4DB748'
  },
  payment: {
    zIndex: 2,
    width: x(313),
  },
  cardNumber: {
    fontFamily: 'Gilroy-Regular',
    fontSize: y(15, true),
    bottom: -x(15)
  },
  visa: {
    height: y(33.13),
    width: x(42.2),
    bottom: -x(6),
    left: -x(5),
  },
  visa_: {
    height: y(30.13),
    width: x(21.2),
    bottom: -x(7),
    //left: -x(15),
    marginRight: x(10),
  },
  applePay: {
    height: y(33.13),
    width: x(35.2),
    bottom: -x(7),
    marginRight: x(10),
  },
  googlePay: {
    height: y(30.13),
    width: x(48.2),
    bottom: -x(7),
    marginLeft:-x(7),
    marginRight:x(2),
  },
});