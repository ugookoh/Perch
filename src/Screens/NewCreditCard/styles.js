import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';
import { x, y, height, width, dimensionAssert } from '../../Functions/Functions';
const [GREEN, WHITE, GREY] = ['#4DB748', '#FFFFFF', '#918686'];

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        alignItems: 'center'
    },
    text: {
        fontFamily: 'Gilroy-Bold',
        fontSize: y(12),
    },
    textInput: {
        fontFamily: 'Gilroy-Regular',
        fontSize: y(15),
        paddingLeft: x(22),
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(64, 61, 61, 0.5)',
        height:y(50),
        padding:0,
        color:'#000000'
    },
    textInputIcon: {
        paddingHorizontal: x(22),
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(64, 61, 61, 0.5)',
        paddingVertical: x(12),
        width: x(343),
        flexDirection:'row',
        alignItems:'center',
        height:y(50),
        justifyContent:'space-between',
    },
    textInput_: {
        fontFamily: 'Gilroy-Regular',
        fontSize: y(15),
        padding:0,
        width:x(270),
        color:'#000000'
    },
    spaceOut:{
        width:x(343),
        flexDirection:'row',
        justifyContent:'space-between',
        marginTop: y(10),
    },
    errorMessage:{
        marginTop:y(15),
        fontSize:y(13),
        color:'#FF0000',
        fontFamily:'Gilroy-SemiBold',
    },
    button: {
        marginTop: y(15),
        marginBottom: y(10),
        width: x(343),
        height: y(48),
    },
});
