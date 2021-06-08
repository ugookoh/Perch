import { StyleSheet, Dimensions, StatusBar, Platform } from 'react-native';
import { x, y, height, width, dimensionAssert } from '../../Functions/Functions';

export default StyleSheet.create({
  container: {
    width: width,
    marginTop: y(5),
    //backgroundColor:'#FFFFFF',
    alignItems: 'center',
  },
  card: {
    alignItems: 'center',

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
    marginBottom: y(30),
    //paddingVertical: y(6),
  },
  maps: {
    width: x(313),
    height: y(20),
    marginVertical: y(10),
    borderRadius: 6,
    opacity: 0.5,
    flexDirection: 'row',
  },
  travel: {
    flexDirection: 'row',
  },
  travelContainer: {
    width: x(313),
  },
  firstLayer: {
    fontFamily: 'Gilroy-Medium',
    color: '#000000',
    fontSize: y(dimensionAssert() ? 11 : 12, true),
    marginLeft: x(5),
    width: x(298),
    bottom: x(dimensionAssert() ? 2 : 0),
  },
  loader: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    zIndex: 2,
    backgroundColor: 'rgba(180, 179, 179, 0.50)',
  },
  LtoD_Divider: {
    left: x(dimensionAssert() ? 4.5 : 5.5),
    top: y(9),
    position: 'absolute'
  },
  divider: {
    width: x(343),
    alignItems: 'center',
    opacity: 0.25,
    top: y(17),
  },
  spaceView: {
    width: x(313),
    flexDirection: 'row',
    justifyContent: 'space-between',

  },
  distance: {
    fontFamily: 'Gilroy-Medium',
    fontSize: y(16, true),
    top: y(4)
  },
  cost: {
    fontFamily: 'Gilroy-ExtraBold',
    fontSize: y(20, true),
    color: '#4DB748'
  },
  description: {
    fontFamily: 'Gilroy-SemiBold',
    fontSize: y(17, true),
  },
  date: {
    fontFamily: 'Gilroy-Regular',
    fontSize: y(15, true),
    color: '#ACB1C0'
  },
});