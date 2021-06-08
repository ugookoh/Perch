import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';
import { x, y, height, width, dimensionAssert } from '../../Functions/Functions';
const [GREEN, WHITE, GREY] = ['#4DB748', '#FFFFFF', '#918686'];

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        alignItems: 'center'
    },
    rWP: {
        height: y(132),
        width: x(361),
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        marginVertical: y(29),
        zIndex: -1,
        //flexShrink:1,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.29,
        shadowRadius: 4.65,

        elevation: 7,
    },
    rWP_x: {
        position: 'absolute',
        top: x(0),
        right: x(0),
       
        height:x(40),
        width:x(40),
        
    },
    rWP_Text: {
        fontFamily: 'Gilroy-SemiBold',
        fontSize: y(17, true),
        textAlign: 'center',
        color: GREEN,
    },
    rWP_GM: {
        height: y(80),
        width: x(80.2),
    },
    optionChoice: {
        flexDirection: 'row',
        width: x(340),
        justifyContent: 'space-between',
        marginBottom: y(11.5),
    },
    optionText: {
        fontFamily: 'Gilroy-Regular',
        fontSize: y(20, true),
    },
    signOut: {
        fontFamily: 'Gilroy-SemiBold',
        fontSize: y(20, true),
        color: '#FF0000',
    },
    cIC: {
        zIndex: -1,
        position: 'absolute',
        width: dimensionAssert() ? x(270) : width,
        height: y(375),
        top: dimensionAssert() ? y(530) : y(500)
    },
});
