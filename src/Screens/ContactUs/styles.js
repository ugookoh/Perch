import { StyleSheet, Dimensions, StatusBar, Platform } from 'react-native';
import { x, y, height, width, dimensionAssert } from '../../Functions/Functions';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        alignItems: 'center'
    },
    issueChoice: {
        fontFamily: 'Gilroy-SemiBold',
        fontSize: y(15),
        marginLeft: x(6),
    },
    formContainer: {
        alignItems: 'center',
        width: x(343),
        height: dimensionAssert() ? y(378) : y(343),
        borderRadius: 10,
        top: y(29),
        backgroundColor: '#FFFFFF',

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation:9,
        zIndex: 2,
        //borderColor:'#000000',
    },
    feedbackTitle: {
        fontFamily: 'Gilroy-Bold',
        fontSize: y(20),
        marginVertical: y(13),
        width:x(320)
    },
    picker: {
        height: y(35),
        width: x(320),
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: 3,
        marginBottom: y(15),
        alignItems: 'center',
        flexDirection: 'row',
    },
    textInput: {
        fontFamily: 'Gilroy-Regular',
        fontSize: y(15),
    },
    dropDown: {
        position: 'absolute',
        right: x(15),
    },
    textInputView: {
        width: x(320),
        height: y(217),
        borderRadius: 10,
        borderWidth: 0.5,
        padding: x(8),
        // borderColor:''
    },
    button: {
        width: x(343),
        height: y(48),
        top: y(45),
        zIndex: 2,
    },
    image: {
        width: width,
        height: dimensionAssert() ? y(150) : y(200),
        position: 'absolute',
        bottom: 0,
        zIndex: -1,
    },
    pickerView: {
        position: 'absolute',
        zIndex: 2,
        backgroundColor: '#DBD4D4'
    },
    pickerChoice: {
        borderTopWidth: 0.5,
        borderBottomWidth: 0.5,
        flexDirection: 'row-reverse',
        borderColor: '#B2ACAC'
    },
    picker_: {
        width: width,
        height: y(250),
    },
    pM:{
        width:x(343),
        fontFamily:'Gilroy-Bold',
        fontSize:y(17),
        marginTop:y(70)
    },
    pMView:{
        backgroundColor:'rgba(145, 134, 134, 0.5)',
        width:width,
        padding:y(10),
        alignItems:'center',
    },
    pM_:{
        width:x(343),
        fontFamily:'Gilroy-Regular',
        fontSize:y(13),
    },
});