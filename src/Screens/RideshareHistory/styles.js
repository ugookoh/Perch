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
    height: y(dimensionAssert() ? 300 : 280),
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
  travel: {
    flexDirection: 'row',
    position: 'absolute',
    left: x(16),
  },
  LtoD_Divider: {
    left: x(20),
    top: y(dimensionAssert() ? 72 : 68),
    position: 'absolute'
  },
  calendar: {
    flexDirection: 'row',
    position: 'absolute',
    top: y(dimensionAssert() ? 17 : 22),
    right: x(23.4)
  },
  maps: {
    height: y(123),
    width: x(312),
    position: 'absolute',
    bottom: x(15),
    left: x(16),
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
    alignItems:'center',
  },
  background: {
    backgroundColor: '#FFFFFF',
    width: width,
    height: 1150,
    position: 'absolute',
    top: y(20),
  },
  driverCentralize: {
    marginTop: x(10),
    width: x(313),
    flexDirection: 'row',
    alignItems:'center'

  },
  profileFrame: {
    height: y(102.72),
    width: y(102.72),
    borderRadius: y(102.72),
    borderWidth: 2
  },
  driverName: {
    fontFamily: 'Gilroy-Bold',
    fontSize: y(20)
  },
  driverTripNumber: {
    fontFamily: 'Gilroy-Regular',
    fontSize: y(15),
    color: '#ACB1C0'
  },
  star: {
    width: x(80),
  },
  tripTitle: {
    fontFamily: 'Gilroy-ExtraBold',
    color: '#000000',
    fontSize: y(20),
    zIndex: 2,
  },
  firstLayer: {
    fontFamily: 'Gilroy-Medium',
    color: '#000000',
    fontSize: y(15),
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
    fontSize: y(22),
    zIndex: 2,
    color: '#4DB748'
  },

  payment: {
    zIndex: 2,
    width: x(313),
  },
  cardNumber: {
    fontFamily: 'Gilroy-Regular',
    fontSize: y(15),
    bottom: -x(15)
  },
  visa: {
    height: y(33.13),
    width: x(42.2),
    bottom: -x(8),
    left: -x(12),
  },
  visa_: {
    height: y(33.13),
    width: x(25.2),
    bottom: -x(8),
    left: -x(5),
  },
  historyRating: {
    flexDirection: 'row',
  },
  spaceOut: {
    width: x(313),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dashedDivider: {
    position: 'absolute',
    height: 0.5,
    width: '100%',
    borderWidth: 0.5,
    borderStyle: 'dashed'
  },

});
