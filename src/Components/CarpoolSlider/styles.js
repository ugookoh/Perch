import { StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';
import { x, y, height, width, dimensionAssert } from '../../Functions/Functions';

export default StyleSheet.create({
    container: {
        width:x(313),
        //height:y(110),
        borderRadius:15,
        backgroundColor:'#FFFFFF',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,

        elevation: 5,
        alignItems:'center',
    },
    topText:{
        fontFamily:'Gilroy-SemiBold',
        fontSize:y(15),
        width:x(290),
       
    },
    barContainer:{
        width:x(290),
        height:y(43),
        justifyContent:'center',
    },
    cursor:{
        height:y(20),
        width:x(3),
        backgroundColor:'#000000',
        borderRadius:10,
        position:'absolute',
        zIndex:1,
    },
    cursorPath:{
        width:x(290),
        height:y(7),
        borderRadius:10,
        flexDirection:'row',
    },
    internalFlex:{
        height:y(7),
    },
});

