import { StyleSheet, Dimensions, StatusBar, Platform } from 'react-native';
import { x, y, height, width, dimensionAssert } from '../../Functions/Functions';

const BLOCKER_HEIGHT = dimensionAssert() ? y(65) : y(72);
const DRIVER_PROFILE_HEIGHT = y(132);
export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        alignItems: 'center'
    },
    driverView: {
        backgroundColor: '#FFFFFF',
        position: 'absolute',
        justifyContent: 'center',
        borderRadius: 10,

        shadowColor: "#000000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 3,
        zIndex: 2,
    },
    x: {
        zIndex: 1,
        position: 'absolute',
        height: y(20),
        width: x(20)
        //backgroundColor:'red'
    },
    driverCentralize: {
        //marginTop: x(30),
        width: x(343),
        height: y(102.72),
        //backgroundColor: 'green'
    },
    profileFrame: {
        position: 'absolute',
        height: y(102.72),
        width: y(102.72),
        borderRadius: 1000,
        borderWidth: 2,
        overflow:'hidden',
    },
    driverName: {
        position: 'absolute',
        fontFamily: 'Gilroy-Bold',
        fontSize: y(20),
        width: x(200),
    },
    driverTripNumber: {
        position: 'absolute',
        top: dimensionAssert() ? y(75) : y(71),
        left: x(133),
        fontFamily: 'Gilroy-Regular',
        fontSize: y(15),
        color: '#ACB1C0'
    },
    camera: {
        opacity: 0.5,
    },
    star: {
        width: x(80),
        position: 'absolute',
        left: x(133),
        top: y(56),
    },
    textInputWrapper: {
        position: 'absolute',
        top: y(718 + (StatusBar.currentHeight ? StatusBar.currentHeight : 0)),
        backgroundColor: 'rgba(255, 255, 255, 0.72)',
        width: width,
        height: y(812 - 718),
        alignItems: 'center',
    },
    textInputView: {
        zIndex: 2,
        height: y(53),
        width: x(343),
        backgroundColor: 'rgba(255, 255, 255, 1)',
        //backgroundColor:'green',
        flexDirection: 'row',
        shadowColor: "#000000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 3,
        alignItems: 'center',
    },
    blocker: {
        zIndex: 1,
        //backgroundColor:'red',
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        height: BLOCKER_HEIGHT,
        width: width,
        //top:-x(30),

    },
    send: {
        position: 'absolute',
        height: y(53),
        //backgroundColor:'green',
        justifyContent: 'center',
        right: x(17.3),
    },
    textInput: {
        fontFamily: 'Gilroy-Regular',
        fontSize: y(12),
        width: x(275),
        top: StatusBar.currentHeight ? x(3) : -x(2),
        zIndex: 0,
        elevation: 0,
        //backgroundColor:'red'
    },
    messageContainer: {
        position: 'absolute',
        width: width,
    },
    // scrollView:{
    //     //width:width,
    //     height:dimensionAssert()?y(548):y(560),
    // },
});
