import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';
import { x, y, height, width, dimensionAssert } from '../../Functions/Functions';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  cancelContainer: {
    zIndex: 6,
    elevation: 6,
    backgroundColor: 'rgba(255,255,255,0.6)',
    height: height,
    width: width,
    position: 'absolute',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',

  },
  cancelLoadingContainer: {
    width: x(250),
    height: y(140),
    borderRadius: 5,
    backgroundColor: '#ffffff',
    flexDirection: 'column',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,

    elevation: 2,
    padding: 5
  },
  cancelLoadingText: {
    fontFamily: 'Gilroy-Medium',
    fontSize: y(15, true),
    textAlign: 'center',


  },
  driverContainer: {
    backgroundColor: 'rgba(180, 179, 179, 0.80)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    width: width,
    height: y(707),
    zIndex: 4,
    elevation: 4,
    top: y(105),
  },
  secondaryDriverConatiner_: {
    alignItems: 'center',
    padding: x(10),
    top: -y(20),
    //height: y(dimensionAssert() ? 210 : 180),
    width: x(300),
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,

    elevation: 2,

  },
  driverTitle: {
    fontFamily: 'Gilroy-SemiBold',
    fontSize: y(18, true),
  },
  driverName: {
    fontFamily: 'Gilroy-Regular',
    fontSize: y(15, true),
    width: x(220)
  },
  driverRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: x(250),
  },
  header: {
    zIndex: 5,
    elevation: 4,
  },
  backButton: {
    marginTop: y(15),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4DB748',
    borderRadius: 5,
    width: '100%',
    height: y(40),
  },
  body: {
    width: width,
  },
  maps: {
    height: y(383.5),
    width: width,
    //zIndex: -1
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
    //height: y(414),
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
    height: height * 10,
    position: 'absolute',
    top: y(20),
    zIndex: 1,
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
  },
  bubble: {
    zIndex: 2,
    backgroundColor: '#4DB748',
    height: x(63),
    width: x(63),
    position: 'absolute',
    top: -x(63 / 2),
    left: x(261),
    borderRadius: 63,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.36,
    shadowRadius: 6.68,
    elevation: 11,
  },
  bubbleText: {
    fontSize: y(14, true),
    color: '#FFFFFF',
    fontFamily: 'Gilroy-ExtraBold',
  },
  tripTitle: {
    fontFamily: 'Gilroy-ExtraBold',
    color: '#000000',
    position: 'absolute',
    fontSize: y(20, true),
    zIndex: 2,
  },
  textContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: x(310),
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
    fontSize: y(18, true),
    zIndex: 2,
  },
  payment: {
    height: y(57.3),
    width: x(310),
    justifyContent: 'space-between',
  },
  button: {
    width: x(313),
    height: y(48),
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
    width: x(35.2),
    bottom: -x(8),
    left: -x(0),
  },
  paymentText: {
    fontFamily: 'Gilroy-Regular',
    fontSize: y(15, true),
  },
  change: {

    fontFamily: 'Gilroy-ExtraBold',
    fontSize: y(15, true),
    color: '#080EB2',
  },
  icon: {
    height: y(40),
    width: y(40),
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
  lowerSection: {
    zIndex: 3,
    elevation: 3,
    height: height * 8,
    width: width
  },



  carpoolSlider: {
    width: x(343),
    alignItems: 'center'
  },
  contactContainer: {
    width: x(313),
    justifyContent: 'space-between',
    flexDirection: 'row',

  },
  contactButton: {
    backgroundColor: '#4DB748',
    height: y(dimensionAssert() ? 55 : 45),
    width: x(134),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  maps_: {
    height: height - y(dimensionAssert() ? 420 : 365),
    width: width,
  },
  switchContainer: {
    width: x(313),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchText: {
    fontSize: y(16, true),
    fontFamily: 'Gilroy-Regular',
  },
  cancelAlertContainer: {
    position: 'absolute',
    height: height,
    width: width,
    backgroundColor: 'rgba(255, 255, 255, 0.90)',
    zIndex: 5,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelAlert: {

    width: x(250),
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
  cancelText: {
    fontFamily: 'Gilroy-SemiBold',
    textAlign: 'center',
  },
  cancelAlertLower: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '50%',
  },
  cancelAlertUpper: {
    borderBottomWidth: 1,
    borderColor: 'rgba(64, 61, 61, 0.3)',
    padding: x(10),

  },
  adText: {
    fontFamily: 'Gilroy-Regular',
    fontSize: y(15, true),
    width: x(313)
  },
  share: {
    width: x(313),
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  shareCode: {
    backgroundColor: '#DAF2D9',
    borderWidth: 2,
    borderColor: '#4DB748',
    borderRadius: 5,
    height: y(48),
    width: x(252),
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center'
  },
  shareCodeText: {
    fontFamily: 'Gilroy-Bold',
    color: '#4DB748',
    fontSize: y(15, true),
  },
  send: {
    backgroundColor: '#4DB748',
    borderRadius: 5,
    height: y(48),
    width: y(48),
    justifyContent: 'center',
    alignItems: 'center'
  },
  ratingContainer: {
    height: height,
    width: width,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    //justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    zIndex: 4,
  },
  ratingCancel: {
    width: x(313),
    flexDirection: 'row-reverse',
    marginTop: y(50),
  },
  ratingTitle: {
    fontFamily: 'Gilroy-Bold',
    fontSize: y(20, true),
    width: x(313)
  },

  driverRatingContainer: {
    width: x(313),
    alignItems: 'center',

  },
  //dpAndStars: {
  //width: x(313),
  //flexDirection: 'row',
  //justifyContent: 'space-between',
  // backgroundColor:'red'
  //},
  driverRatingdp: {
    borderRadius: x(60),
    width: x(60),
    height: x(60),
    borderWidth: 1,
    marginTop: y(18),
    overflow: 'hidden',
  },
  ratingFlex: {
    //backgroundColor:'red',
    flex: 0.8,
    justifyContent: 'center',
  },
  star: {
    width: x(200),
  },
  ratingDriverName: {
    fontFamily: 'Gilroy-SemiBold',
    fontSize: y(16, true),
  },
  cancelIcon: {
    width: "100%",
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  phoneContainer: {
    flexDirection: 'row',
    width: "100%",
    justifyContent: 'space-between',
    marginVertical: y(10),
  },
  phoneIcon: {
    width: y(50),
    height: y(50),
    borderRadius: y(50),
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneText: {
    fontFamily: 'Gilroy-Regular',
    fontSize: y(13, true),
    maxWidth: x(70),
  },
  phoneText_: {
    marginTop: y(5),
    fontFamily: 'Gilroy-SemiBold',
    fontSize: y(13, true),

  },
  startTrip: {
    height: y(48),
    width: x(313),
  },
});