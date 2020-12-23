import { StyleSheet, Dimensions, StatusBar, Platform } from 'react-native';
import { x, y, height, width, dimensionAssert } from '../../Functions/Functions';
const GREEN = `#4DB748`;

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        alignItems: 'center'
    },
    box: {
        maxWidth: width,
        paddingHorizontal: x(20)
    },
    userBox: {
        maxWidth: x(313),
        backgroundColor: GREEN,
        padding: x(10),
        borderRadius: 5
    },
    responseBox:{
        backgroundColor:'rgba(145, 134, 134, 0.5)',
        maxWidth: x(313),
        padding: x(10),
        borderRadius: 5
    },
    userText: {
        fontFamily: 'Gilroy-Regular',
        fontSize: y(14)
    },
    innerblock: {
        width: x(343),
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    text: {
        fontFamily: 'Gilroy-Regular',
        fontSize: y(14),
        width: x(260),
        //backgroundColor: 'red'
    },
    date: {
        marginTop: x(7),
        fontFamily: 'Gilroy-Medium',
        fontSize: y(12),
    },
    noResults: {
        height: x(250),
        width: x(250),
        marginTop: y(dimensionAssert() ? 15 : 55),
    },
    noResultsText: {
        fontSize: y(17),
        fontFamily: 'Gilroy-Regular',
        marginTop: y(10),
    },
});