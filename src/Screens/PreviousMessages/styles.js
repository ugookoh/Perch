import { StyleSheet, Dimensions, StatusBar, Platform } from 'react-native';
import { x, y, height, width, dimensionAssert } from '../../Functions/Functions';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        alignItems: 'center'
    },
    block: {
        //height: y(50),
        justifyContent: 'center',
        width: x(343),
    },
    innerblock: {
        width: x(343),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    text: {
        fontFamily: 'Gilroy-Regular',
        fontSize: y(14, true),
        width: x(260),
        //backgroundColor: 'red'
    },
    date: {
        fontFamily: 'Gilroy-Bold',
        fontSize: y(12, true),
    },
    noResults: {
        height: x(250),
        width: x(250),
        marginTop: y(dimensionAssert() ? 15 : 55),
    },
    noResultsText: {
        fontSize: y(17, true),
        fontFamily: 'Gilroy-Regular',
        marginTop: y(10),
    },
});