import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';
import { x, y, height, width, dimensionAssert } from '../../Functions/Functions';
const [GREEN, WHITE, GREY] = ['#4DB748', '#FFFFFF', '#918686'];

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        alignItems: 'center'
    },
    title: {
        fontFamily: 'Gilroy-Bold',
        fontSize: y(17),
        width: x(343),
    },
    subTitle: {
        fontFamily: 'Gilroy-Regular',
        fontSize: y(14),
        width: x(343),
    },
    box: {
        width: x(dimensionAssert() ? 180 : 190),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    textInput: {
        fontFamily: 'Gilroy-Medium',
        borderRadius: 10,
        fontSize: y(20),
        borderWidth: 1,
        borderColor: 'rgba(64, 61, 61, 0.5)',
        paddingVertical: x(7),
        paddingLeft: x(15),
        width: x(80),
        color:'#000000'
    },
    kmText: {
        fontSize: y(20),
        fontFamily: 'Gilroy-Medium',
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
        //marginTop: y(30)
    },
    innerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: x(313),
        marginVertical: y(20),
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
    button: {
        marginTop: y(25),
        marginBottom: y(10),
        width: x(343),
        height: y(54),
    },
    cash: {
        marginTop: y(20),
        color: '#4DB748',
        fontFamily: 'Gilroy-SemiBold',
        fontSize: y(20),
        marginBottom: y(5),
    },
    loading: {
        position: 'absolute',
        backgroundColor: 'rgba(64, 61, 61, 0.9)',
        width: width,
        height: y(656),
        top: y(156),
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        zIndex: 1,
    },
    loadingContainer: {
        alignItems: 'center',

        top: -x(30),
        backgroundColor: '#FFFFFF',
        height: y(150),
        width: x(300),
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,

        elevation: 8,
        paddingHorizontal: x(10),
    },
    conclusion: {
        fontFamily: 'Gilroy-Medium',
        fontSize: y(16),
        marginTop: y(20),
        textAlign: 'center',
    },
});
