import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';
import { x, y, height, width, dimensionAssert } from '../../Functions/Functions';
const [GREEN, WHITE, GREY] = ['#4DB748', '#FFFFFF', '#918686'];

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        //alignItems: 'center'
    },
    header: {
        zIndex: 1,
    },
    secondaryContainer: {
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        width: width,
        height: dimensionAssert() ? y(510 + ((StatusBar.currentHeight ? StatusBar.currentHeight : 0))) : y(420 + ((StatusBar.currentHeight ? StatusBar.currentHeight : 0))),
        zIndex: 0,
    },
    avatarContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        width: x(113),
        height: x(113),
        position: 'absolute',
        left: x(13),
        top: y(28),
        overflow: 'hidden',
    },
    tag: {
        fontFamily: 'Gilroy-ExtraBold',
        fontSize: y(12, true),
    },
    textInputContainer: {
        width: x(340),
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        flexDirection: 'row',
        //backgroundColor:'red'

    },
    textInput: {
        fontFamily: 'Gilroy-Regular',
        fontSize: y(21, true),
        color: '#000000',
        width: x(290),
    },
    avatar: {
        height: dimensionAssert() ? y(97.5) : y(87.5),
        width: x(79.4),
    },
    option: {
        height: dimensionAssert() ? y(72) : y(62),
        width: x(340),
        paddingVertical: x(5),
        //flexDirection: 'row',
        //alignItems: 'center',
        justifyContent: 'space-between'
    },
    changePassword: {
        marginTop: y((StatusBar.currentHeight ? (dimensionAssert() ? -StatusBar.currentHeight : (0)) : 0)),
        marginLeft: x(12),
        width: x(250),
        height: y(23)
    },
    delete: {
        //marginTop: y(10),
        fontFamily: 'Gilroy-SemiBold',
        fontSize: y(20, true),
        color: '#FF0000',
    },
    button: {
        width: x(343),
        height: y(48),

        zIndex: 2,
    },
    optionContainer: {
        position: 'absolute',
        top: dimensionAssert() ? y(182) : y(152 + (StatusBar.currentHeight ? StatusBar.currentHeight : 0)),
    },
    buttonContainer: {
        position: 'absolute',
        width: width,
        alignItems: 'center',
        bottom: x(dimensionAssert() ? 10 : 100),
    },
    errorMessage: {
        color: '#FF0000',
        fontFamily: y(13),
        fontFamily: 'Gilroy-Medium',
        textAlign: 'center',
    },
});
