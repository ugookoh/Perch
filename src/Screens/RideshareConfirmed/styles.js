import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';
import { x, y, height, width, dimensionAssert } from '../../Functions/Functions';
const MAX_HEADER_HEIGHT = y(156);
const MIN_HEADER_HEIGHT = y(96.5);

export default StyleSheet.create({
    container: {
        flex: 1,
        //backgroundColor:'green',
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
        elevation: 1,
        zIndex: 1
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
    tab: {
        top: y(16.3),
        height: x(4),
        width: x(44),
        backgroundColor: '#E4E9F2',
        borderRadius: 2,
    },
    maps: {
        height: y(393),
        width: width,
    },
    icon: {
        height: y(40),
        width: y(40),
    },
    lowerSection: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -5,
        },
        shadowOpacity: 0.30,
        shadowRadius: 8,

        elevation: 2,
        zIndex: 2,

        width: width,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        alignItems: 'center',
    },
    driverCentralize: {
        marginTop: x(30),
        width: x(343),

    },
    profileFrame: {
        position: 'absolute',
        left: x(17),
        top: 0,
        height: y(102.72),
        width: y(102.72),
        borderRadius: 1000,
        borderWidth: 2
    },
    driverName: {
        position: 'absolute',
        top: dimensionAssert() ? y(30) : y(StatusBar.currentHeight ? 30 : 36),
        left: x(133),
        fontFamily: 'Gilroy-Bold',
        fontSize: y(20, true)
    },
    driverTripNumber: {
        position: 'absolute',
        top: dimensionAssert() ? y(75) : y(71),
        left: x(133),
        fontFamily: 'Gilroy-Regular',
        fontSize: y(15, true),
        color: '#ACB1C0'
    },
    star: {
        width: x(80),
        position: 'absolute',
        left: x(133),
        top: y(56),
    },
    rideConfirmed: {
        backgroundColor: '#4DB748',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
        height: y(22),
        width: x(120),
        position: 'absolute',
        bottom: 0,
        right: 0,
    },
    rideConfirmedText: {
        fontSize: y(13, true),
        fontFamily: 'Gilroy-ExtraBold',
        color: '#FFFFFF',
    },
    car: {
        //position: 'absolute',
        //left: x(17),
        fontFamily: 'Gilroy-Regular',
        fontSize: y(17, true),
        width: x(240),
    },
    bubble: {
        borderRadius: 10,
        backgroundColor: '#4DB748',
        justifyContent: 'center',
        alignItems: 'center',
        height: x(StatusBar.currentHeight ? 56 : 62),
        width: x(StatusBar.currentHeight ? 56 : 62),
    },
    time: {
        color: '#FFFFFF',
        fontFamily: 'Gilroy-ExtraBold'
    },
    contact: {
        width: x(313),
        justifyContent: 'space-between',
        flexDirection: 'row',
    },
    carDescription: {
        flexDirection: 'row',
        width: x(313),
        justifyContent: 'space-between',
        marginTop: y(13),
    },
    block: {
        backgroundColor: '#4DB748',
        height: y(45),
        width: x(134),
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
    },
    address: {
        width: x(313),
        //height: y(45),       
        flexDirection: 'row',
        alignItems: 'center',

    },
    addressText: {
        fontFamily: 'Gilroy-Regular',
    },

    payments: {
        width: x(313),
    },
    paymentInfoNumbers: {
        flexDirection: 'row',
        marginLeft: x(6),
        width: x(283),
        justifyContent: 'space-between',
    },
    cardNumber: {
        fontFamily: 'Gilroy-Regular',
        fontSize: y(15, true),
        //bottom:-x(15)
    },
    visa: {
        height: y(27),
        width: x(32.2),
        bottom: -x(8),
        left: -x(5),
    },
    cancel: {
        color: '#FF001D',
        fontFamily: 'Gilroy-SemiBold',
        fontSize: y(15, true),

    },
    selection: {
        width: '100%',
        flexDirection: 'row',
        marginVertical: x(5),
        height: x(20),
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
    ratingContainer: {
        height: height,
        width: width,
        backgroundColor: '#FFFFFF',
        position: 'absolute',
        //justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        zIndex: 3,
    },
    ratingCancel: {
        width: x(313),
        flexDirection: 'row-reverse',
        marginTop: y(50),
    },
    ratingPhoto: {
        //borderColor:`#4DB748`,
        borderWidth: 3,
        width: x(200),
        height: x(200),
        borderRadius: x(200)
    },
    ratingName: {
        fontFamily: 'Gilroy-SemiBold',
        fontSize: y(23, true),
        textAlign: 'center',
        marginTop: y(18),
    },
    ratingQuestion: {
        fontFamily: 'Gilroy-Regular',
        fontSize: y(16, true),
        textAlign: 'center',
    },
    star: {
        width: y(250),
        marginTop: y(20),
    },
    button: {
        height: y(48),
        width: x(313),
        marginTop: y(50),
        zIndex: 1,
    },
    carInCity: {
        position: 'absolute',
        bottom: -x(100),
        width: x(340),
        height: y(400),
    },
});
