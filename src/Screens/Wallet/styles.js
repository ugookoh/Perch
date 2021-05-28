import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';
import { x, y, height, width, dimensionAssert } from '../../Functions/Functions';
const [GREEN, WHITE, GREY] = ['#4DB748', '#FFFFFF', '#918686'];

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        alignItems: 'center'
    },
    mainContainer: {
        width: x(343),
        alignItems: 'center',
        marginTop: y(30),

        backgroundColor: '#FFFFFF',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,

        elevation: 6,
        borderRadius: 10,
    },
    subContainer: {
        alignItems: 'center',
        width: x(343),
        backgroundColor: '#FFFFFF',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,

        elevation: 6,
        borderRadius: 10,
    },
    innerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: x(313),
        marginVertical: y(20),
    },
    walletImage: {
        width: x(132),
        height: x(150),
    },
    titleText: {
        fontFamily: 'Gilroy-SemiBold',
        fontSize: y(18),
        marginTop: y(25),
    },
    balanceText: {
        fontFamily: 'Gilroy-SemiBold',
        fontSize: y(30),
        color: '#4DB748',
    },
    button: {
        marginTop: y(15),
        marginBottom: y(10),
        width: x(322),
        height: y(48),
    },
    scroll: {
        width: width,
        alignItems: 'center',
    },
    text: {
        fontFamily: 'Gilroy-SemiBold',
        fontSize: y(15),
    },
    visa: {
        width: x(35),
        height: y(30),
        position: 'absolute',
        top: -x(dimensionAssert() ? 4 : 7)
    },
    logo: {
        width: x(35),
        height: y(30),
        position: 'absolute',
        top: -x(dimensionAssert() ? 4 : 7)
    },
    googlePayLogo: {
        width: x(55),
        height: y(40),
        position: 'absolute',
        top: -x(dimensionAssert() ? 9 : 12),
        left:-7,
    },
    optionsContainer: {

        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: x(60),
        flexDirection: 'row',
        marginTop: y(10),
        marginBottom: y(20),
    },
    options: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: x(15),
        paddingVertical: x(10),

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,

        elevation: 6,
        borderRadius: 5,
    },

});
