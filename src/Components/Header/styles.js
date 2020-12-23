import { StyleSheet, Dimensions, StatusBar, Platform } from 'react-native';
import { x, y, height, width, dimensionAssert } from '../../Functions/Functions';

export default styles = StyleSheet.create({
    box: {
        top: 0,
        left: 0,
        position: 'relative',
        width: Dimensions.get('window').width,
        backgroundColor: '#4eb848',
        shadowColor: "#000",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 7,
        zIndex:7,
    },
    icon: {
        position: 'absolute',
        top: y(58.75),
        left: x(21),
    },
    iconBox:{
        width:y(50),
    },
    text: {
        position: 'absolute',
        fontSize: y(34),
        color: 'white',
        fontFamily: 'Gilroy-ExtraBold',
    },
})
