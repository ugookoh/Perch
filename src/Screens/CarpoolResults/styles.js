import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';
import { x, y, height, width, dimensionAssert } from '../../Functions/Functions';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems:'center'
  },
  numberOfSeatContainer: {
    height: y(656),
    top: y(156),
    width: width,
    backgroundColor: 'rgba(180, 179, 179, 0.50)',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  secondaryNumberOfSeatContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: x(10),
    top: -y(20),
    height: y(dimensionAssert() ? 210 : 180),
    width: x(225),
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

  },
  counterText: {
    fontFamily: 'Gilroy-SemiBold',
    fontSize: y(18),
    textAlign: 'center',
  },
  counterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    alignItems: 'center'
  },
  seatNumberView: {
    height: y(40),
    width: y(40),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 2,
    borderColor: 'rgba(180, 179, 179, 0.50)',
    borderWidth: 1,
  },
  seatNumberText: {
    fontFamily: 'Gilroy-SemiBold',
    fontSize: y(20),
  },
  doneButton: {
    width: '100%',
    height: y(50),
    backgroundColor: '#4DB748',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneText: {
    color: '#FFFFFF',
    fontFamily: 'Gilroy-SemiBold',
    fontSize: y(15),
  },
  location: {
    flexDirection: 'row',
    position: 'absolute',
    top: y(186),
    left: x(21),
  },
  destination: {
    flexDirection: 'row',
    position: 'absolute',
    top: y(220),
    left: x(21),
  },
  text: {
    fontFamily: 'Gilroy-Regular',
    fontSize: y(13),
    paddingLeft: x(7),
    width: x(300),
  },
  sortResultView: {
    position: 'absolute',
    top: y(262),
    right: x(22),
    opacity: 0.5,
    flexDirection: 'row',
  },
  numberOfSeat: {
    position: 'absolute',
    top: y(262),
    left: x(22),
    opacity: 0.5,
    flexDirection: 'row',
  },
  sortResultText: {
    fontFamily: 'Gilroy-ExtraBold',
    fontSize: y(17),
    color: '#4DB748',
  },
  dropDownIcon: {
    height: y(25),
    width: y(25),
    paddingLeft: x(6),
    //bottom: 0,
  },
  L_to_D: {
    position: 'absolute',
    left: x(dimensionAssert() ? 27 : 28.5),
    top: y(dimensionAssert() ? 205 : 203)
  },
  divider: {
    opacity: 0.5,
    position: 'absolute',
    top: y(255),
    width: width,
    alignItems: 'center',
  },
  rateText: {
    fontFamily: 'Gilroy-ExtraBold',
    fontSize: y(12),
    opacity: 0.5,
    position: 'absolute',
    top: y(262),
    left: x(21),
    color: '#4DB748',
  },
  scrollView: {
    position: 'absolute',
    left: 0,
    width: width,
    justifyContent: 'center',
    alignItems: 'center'
  },
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
  box: {
    top: -x(60),
    // borderRadius: 15,
    // width: x(60),
    // height: x(60),
    // backgroundColor: '#FFFFFF',

    // shadowColor: "#000",
    // shadowOffset: {
    //     width: 0,
    //     height: 3,
    // },
    // shadowOpacity: 0.29,
    // shadowRadius: 4.65,

    // elevation: 7,
  },
  noResultView: {
    top: -y(50),
    alignItems: 'center'
  },
  noResult: {
    height: y(290),
    width: y(290),
    opacity: 0.7
  },
  noResultText: {
    top: y(5),
    textAlign: 'center',
    fontFamily: 'Gilroy-SemiBold',
    fontSize: y(14),
    color: '#4DB748'
  },
  scheduledView: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    right: x(22),
    top: y(297),
  },
  scheduledText: {
    fontFamily: 'Gilroy-SemiBold',
    fontSize: y(16),
    marginRight: x(10),
  },
  iosSpinnerView:{
    backgroundColor: '#403D3D' ,
    borderTopLeftRadius:10,
    borderTopRightRadius:10,
    top:y(130),
    zIndex:4
  },
  iosSpinner: {
    paddingHorizontal: x(40),
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: x(320),
    height: y(40),
    backgroundColor: '#403D3D',
    top: y(40),
    borderBottomLeftRadius:10,
    borderBottomRightRadius:10,
  },
});