import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';
import { x, y, height, width, dimensionAssert } from '../../Functions/Functions';
const [GREEN, WHITE, GREY] = ['#4DB748', '#FFFFFF', '#918686'];

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        alignItems: 'center'
    },
    home: {
        width: x(22),
        height: y(20.25),
        marginHorizontal: x(15),
    },
    workChair: {
        height: y(23),
        width: x(14.3),
        marginHorizontal: x(15),
    },
    optionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: width,
        height: y(58.5),
        marginTop: y(23),
        //backgroundColor:'red'
    },
    predictions: {
        width: x(350),
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: 'rgba(211, 211, 211, 0.7)',
    },
    predictionView: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: 'rgba(211, 211, 211, 0.7)',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: y(8),
    },
    predictionText: {
        fontSize: y(15),
        fontFamily: 'Gilroy-Regular',
    },
    predictionView_: {
        width: x(300),
    },
    icon: {
        marginHorizontal: x(12)
    },
    cIC: {
        zIndex: -1,
        position: 'absolute',
        width: dimensionAssert() ? x(270) : width,
        height: y(375),
        top: dimensionAssert() ? y(530) : y(500)
    },
    textInput: {
        fontSize: y(21),
        fontFamily: 'Gilroy-Regular',
        color: '#000000',
        width: x(260),
    },
    edit: {
        fontSize: y(12),
        fontFamily: 'Gilroy-ExtraBold',
        color: GREEN,
    },
    editPosition: {
        position: 'absolute',
        right: x(26),
    },
});