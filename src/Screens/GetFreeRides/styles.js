import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';
import { x, y, height, width, dimensionAssert } from '../../Functions/Functions';
const [GREEN, WHITE, GREY] = ['#4DB748', '#FFFFFF', '#918686'];

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        alignItems: 'center'
    },
    sharing: {
        marginTop: -x(dimensionAssert() ? 50 : 0),
        height: x(400),
        width: x(400),
    },
    lowerContainer: {
        width: width,
        paddingHorizontal: x(12.5),
        alignItems: 'center',
        top: x(dimensionAssert() ? -30 : 0)
    },
    mainText: {
        fontFamily: 'Gilroy-SemiBold',
        fontSize: y(22),
        textAlign: 'center',
        marginBottom: y(7),
    },
    subText: {
        fontFamily: 'Gilroy-Regular',
        fontSize: y(dimensionAssert() ? 13 : 15),
        textAlign: 'center',
        marginBottom: x(15),
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
        fontSize: y(15),
    },
    send: {
        backgroundColor: '#4DB748',
        borderRadius: 5,
        height: y(48),
        width: y(48),
        justifyContent: 'center',
        alignItems: 'center'
    },

});
