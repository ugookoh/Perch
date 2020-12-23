import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';
import { x, y, height, width, dimensionAssert } from '../../Functions/Functions';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  pickerContainer: {
    flex: 1,
    alignItems: 'center',

  },
  picker: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    top: y(56),
    height: y(25.5),
    width: x(350.6),
    borderBottomWidth: 1,
    borderColor: '#D3D3D3',
    zIndex: 3,
  },
  pickerAnimated: {
    top: y(dimensionAssert() ? 84 : 80),
    width: x(350.6),
    position: 'absolute',
    zIndex: 2,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#D3D3D3',
    overflow: 'hidden',

  },
  choice: {
    position: 'absolute',
    flexDirection: 'row',
  },
  choiceLetter: {
    fontFamily: 'Gilroy-SemiBold',
    fontSize: y(15),

  },
  choiceSecond: {
    flex: 1,
    justifyContent: 'center',
  },
  date: {
    fontFamily: 'Gilroy-Regular',
    fontSize: y(15),
    color: '#4DB748',
    marginRight: x(17),
  },
  downArrow: {
    position: 'absolute',
    top: (dimensionAssert() ? -y(StatusBar.currentHeight ? 2 : 4) : -y(8)),
    left: x(80),
    width: x(21),
    height: y(30),
  },
  results: {
    zIndex: 1,
    width: width,
    alignItems: 'center',
    height: y(dimensionAssert() ? 526 : 542),
    //backgroundColor: 'red',
    position: 'absolute',
    top: (dimensionAssert() ? y(118) : y(114))
  },
  results_: {
    width: width,
    alignItems: 'center',
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
    width: width / 2,
    height: y(250),
  },
  noResultsConatiner: {
    alignItems: 'center',
    paddingHorizontal: x(20),
  },
  noResults: {
    height: x(250),
    width: x(250),
    marginTop: y(dimensionAssert() ? 15 : 55),
  },
  noResultsText: {
    textAlign: 'center',
    fontFamily: 'Gilroy-Regular',
    fontSize: y(16),
    marginTop: y(5),
  },
});
