import { StyleSheet, Dimensions, StatusBar, Platform } from 'react-native';
import { x, y, height, width, dimensionAssert } from '../../Functions/Functions';

export default StyleSheet.create({
    container: {
        marginTop: y(3),
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        width: width,
    },
    firstLayer: {
        width: x(343),
        flexDirection: 'row',
    },
    profileImage: {
        height: x(38),
        width: x(38),
        borderWidth: 1,
        borderColor: '#000000',
        borderRadius: 38,
        overflow: 'hidden',
    },
    textBox: {
        marginLeft: x(10),
        borderRadius: 4,
        maxWidth: x(246.13),
        paddingVertical: x(6),
        minWidth: x(55),

    },
    textBox_: {//for messages below the first one
        marginTop: y(10),
        marginLeft: x(10),
        borderRadius: 4,
        maxWidth: x(246.13),

    },
    _textBox: {////USER MESSAGES
        borderRadius: 4,
        maxWidth: x(286.3),
        paddingVertical: x(6),
        minWidth: x(55),

    },
    _textBox_: {//for messages below the first one
        marginTop: y(10),
        //marginLeft:x(10),
        borderRadius: 4,
        maxWidth: x(286.3),

    },
    time: {
        fontFamily: 'Gilroy-Regular',
        fontSize: y(9, true),
        //color: '#FFFFFF',
        position: 'absolute',
        bottom: x(2),
    },
    text: {
        fontFamily: 'Gilroy-Regular',
        fontSize: y(13, true),
        lineHeight: y(20),
        margin: x(12),
    },
    dateMainContainer: {
        width: width,
        alignItems: 'center',
    },
    dateSecConatiner: {
        padding: x(5),
        borderRadius: 5,
        backgroundColor: '#b3b3b3',
        marginBottom: y(8),
        marginTop: y(20),
    },
    dateText: {
        fontFamily: 'Gilroy-SemiBold',
        fontSize: y(13, true),

    },
});