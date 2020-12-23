import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';
import { x, y, height, width, dimensionAssert } from '../../Functions/Functions';
const MAX_HEADER_HEIGHT = y(156);
const MIN_HEADER_HEIGHT = y(96.5);
const LOWERSECTIONHEIGHT = y(dimensionAssert() ? 500 : 430);
const MAPHEIGHT = y(dimensionAssert() ? 551 : 600);

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  menu: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: y(57),
    left: x(16),
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
    zIndex: 2
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
  containerLD: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    height: y(dimensionAssert() ? 55 : 45),
    width: x(dimensionAssert() ? 300 : 300),
    borderRadius: 10,
    zIndex: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 13.84,

    elevation: 1,

    flexDirection: 'row',
    alignItems: 'center',

  },
  textLD: {
    fontFamily: 'Gilroy-Regular',
    fontSize: y(12),
    width: x(245),
  },
  maps: {
    // height: y(dimensionAssert() ? 360 : 420),
    height: MAPHEIGHT,
    //width: width,
    zIndex: -1
  },
  lowerSection: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.30,
    shadowRadius: 8,

    elevation: 3,

    width: width,
    backgroundColor: '#FFFFFF',

    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
  },
  icon: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  content: {
    alignItems: 'center',
    width: x(90),
  },
  etaConatiner:{
    borderRadius:15,
    borderWidth:2,
    borderColor:'#f2f2f2',
    backgroundColor:'#4DB748',
    position:'absolute',
    top:-x(10),
    right:-x(10),
    zIndex:1,
    padding:5,
  },
  etaText:{
    fontFamily:'Gilroy-SemiBold',
    fontSize:y(12),
    color:'#f2f2f2',
  },
  etaConatiner_:{
    borderRadius:15,
    backgroundColor:'#4DB748',
    paddingHorizontal:x(9),
    height:y(22),
  },
  etaText_:{
    fontFamily:'Gilroy-SemiBold',
    fontSize:y(15),
    color:'#FFFFFF',
  },
  title: {
    fontFamily: 'Gilroy-Bold',
    fontSize: y(19),
    //position: 'absolute',
    //marginLeft: -x(32),
    marginTop: y(37)
  },
  description: {
    fontFamily: 'Gilroy-Regular',
    fontSize: y(15),
  },
  type: {
    fontFamily: 'Gilroy-Light',
    fontSize: y(14),
    marginTop: x(7),
  },
  cost: {
    fontFamily: 'Gilroy-SemiBold',
    fontSize: y(16),
    marginTop: x(10),
  },
  choice: {
    width: x(307.81),

    marginTop: y(14.4),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems:'center',

  },
  choiceIcon: {
    width: x(64.64),
    height: x(64.64),
  },
  payment: {
    height: y(57.3),
    width: x(310),
    marginTop: y(14),
    justifyContent: 'space-between',
  },
  paymentText: {
    fontFamily: 'Gilroy-SemiBold',
    fontSize: y(15),
    top: 0,
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
    left: -x(5),
  },
  visa_: {
    height: y(33.13),
    width: x(25.2),
    bottom: -x(8),
    left: -x(5),
  },
  change: {
    fontFamily: 'Gilroy-ExtraBold',
    fontSize: y(15),
    color: '#080EB2',
  },
  button: {
    width: x(313),
    height: y(48),
    marginVertical: y(17)
  },
  containerSearch: {
    position: 'absolute',
    backgroundColor: 'rgba(180, 179, 179, 0.80)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    width: width,
    height: height,
    zIndex: 5,
    elevation: 5,
  },
  secondaryContainerSearch: {
    padding: x(10),
    //height: y(dimensionAssert() ? 210 : 180),
    width: x(300),
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,

    elevation: 2,
    alignItems:'center',
  },
  secondaryContainerCity:{
    width:x(100),
    height:y(50),
    marginVertical:y(20)
  },
  searchText: {
    fontFamily: 'Gilroy-Regular',
    fontSize: y(15),
    textAlign: 'center',
  },


  vehicle: {
    zIndex: 4,
    elevation: 4,
    position: 'absolute'
  },
  vehicleContainer: {
    height: height,
    width: width,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  xContainer: {
    marginTop: y(50),
    width: x(313),
  },
  vehiclePicture: {
    width: y(200),
    height: y(200),
    marginTop: y(15),
  },
  vehicleTitle: {
    marginTop: y(20),
    fontFamily: 'Gilroy-Bold',
    fontSize: y(25),
  },
  vehicleDescription: {
    fontFamily: 'Gilroy-Regular',
    fontSize: y(15),
  },
  vehicleLocation: {
    width: x(313),
    flexDirection: 'row',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    borderColor: '#918686',
    marginTop: y(5),
  },
  confirmPickup: {
    flexDirection: 'row',
    alignItems: 'center',
    height: y(50),
    width: x(313),
    //borderStyle:'dashed',
    borderColor: 'rgba(77, 183, 72, 0.6)',
    borderWidth: 1,
    borderRadius: 10,
    marginTop: y(12)
  },
  point: {
    position: 'absolute',
    zIndex: 4,
    elevation: 4,
    top: (MAPHEIGHT / 2) - y(20),
    left: width / 2 - x(15),
    height: y(37.3),
    width: x(25.13),
  },
  city:{
    height:y(100),
    width:x(150),
    marginBottom:y(25),
    marginTop:y(90),
  },
  noResultText:{
    fontFamily:'Gilroy-SemiBold',
    fontSize:y(17),
    textAlign:'center',
    width:x(313),
    marginBottom:y(10),

  },
});
