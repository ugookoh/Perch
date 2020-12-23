import React from 'react';
import styles from './styles';
import { TouchableOpacity, View, Text, Image, Modal, Dimensions, PanResponder, TextInput, ActivityIndicator, Keyboard, StatusBar, Platform } from 'react-native';
import storage from '@react-native-firebase/storage';
import { x, y, height, width, dimensionAssert } from '../../Functions/Functions';
import ImageViewer from 'react-native-image-zoom-viewer';

const [GREEN, WHITE, GREY] = ['#4DB748', '#FFFFFF', '#F5F5F5'];

export class UserMessage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            imageID: this.props.data.imageID,
            url: null,
            modal: false,
        };

    }

    componentDidMount() {
        if (this.state.imageID)
            storage().ref(`${this.props.imageRef}/${this.state.imageID}`).getDownloadURL()
                .then(result => {
                    this.setState({ url: result })
                }).catch(error => { console.log(error.message) })
    };

    render() {
        let marginTop = this.props.marginTop ? { marginTop: this.props.marginTop } : {};
        let marginBottom = this.props.marginBottom ? { marginBottom: this.props.marginBottom } : {};
        if (this.state.imageID)
            return (
                <TouchableOpacity
                    style={[styles.container, marginTop, marginBottom]}
                    onPress={() => {
                        this.setState({ modal: true })
                    }}>
                    {this.state.modal ? <StatusBar barStyle={'light-content'} backgroundColor={'#000000'} /> : <></>}
                    <View style={[styles.firstLayer, { flexDirection: 'row-reverse' }]}>
                        <View>
                            <View style={[styles._textBox, { backgroundColor: GREEN }]}>
                                {
                                    this.state.url ?
                                        <View style={{ paddingBottom: x(20), paddingTop: y(4) }}>
                                            <Image
                                                source={{ uri: this.state.url }}
                                                resizeMode={'contain'}
                                                style={{
                                                    //alignSelf: 'stretch',
                                                    flex: 1,
                                                    height: y(200),
                                                    width: dimensionAssert() ? x(150) : x(180),
                                                }} />
                                        </View> :
                                        <ActivityIndicator size={"small"} color={WHITE} style={{ paddingBottom: y(13) }} />}
                            </View>
                            <Text style={[styles.time, { left: x(8), color: '#FFFFFF', }]}>{this.props.data.tS}</Text>
                        </View>
                        <Modal visible={this.state.modal} transparent={true}>
                            <ImageViewer imageUrls={[{
                                url: this.state.url,
                                width: width,
                                height: y(700),
                            }]}
                                enableSwipeDown
                                useNativeDriver={true}
                                onSwipeDown={() => { this.setState({ modal: false }) }} />
                        </Modal>
                    </View>
                </TouchableOpacity>
            )
        else
            return (
                <View style={[styles.container, marginTop, marginBottom]}>
                    <View style={[styles.firstLayer, { flexDirection: 'row-reverse' }]}>
                        <View>
                            <View style={[styles._textBox, { backgroundColor: GREEN }]}>
                                <Text style={[styles.text, { color: WHITE }]}>{this.props.data.m}</Text>
                            </View>
                            <Text style={[styles.time, { left: x(8), color: '#FFFFFF', }]}>{this.props.data.tS}</Text>
                        </View>

                    </View>
                </View>
            );
    }
}

export class Message extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            imageID: this.props.data.imageID,
            url: null,
            modal: false,
        }
    }

    componentDidMount() {
        if (this.state.imageID)
            storage().ref(`${this.props.imageRef}/${this.state.imageID}`).getDownloadURL()
                .then(result => {
                    this.setState({ url: result })
                }).catch(error => { console.log(error.message) })
    }
    render() {
        let marginTop = this.props.marginTop ? { marginTop: this.props.marginTop } : {};
        let marginBottom = this.props.marginBottom ? { marginBottom: this.props.marginBottom } : {};
        if (this.state.imageID)
            return (
                <TouchableOpacity
                    style={[styles.container, marginTop, marginBottom]}
                    onPress={() => {
                        this.setState({ modal: true })
                    }}>
                    {this.state.modal ? <StatusBar barStyle={'light-content'} backgroundColor={'#000000'} /> : <></>}
                    <View style={styles.firstLayer}>
                        <View style={[styles.profileImage, this.props.urlRef ? { borderWidth: 0 } : {}]}>
                            {this.props.urlRef ?
                                <Image
                                    source={{ uri: this.props.urlRef }}
                                    resizeMode={'contain'}
                                    style={{
                                        //alignSelf: 'stretch',
                                        flex: 1,
                                        height: x(38),
                                        width: x(38),
                                    }} /> :
                                <></>}
                        </View>
                        <View>
                            <View style={[styles.textBox, { backgroundColor: GREY }]}>
                                {
                                    this.state.url ?
                                        <View style={{ paddingBottom: x(20), paddingTop: y(4) }}>
                                            <Image
                                                source={{ uri: this.state.url }}
                                                resizeMode={'contain'}
                                                style={{
                                                    alignSelf: 'stretch',
                                                    flex: 1,
                                                    height: y(200),
                                                    width: dimensionAssert() ? x(150) : x(180),
                                                }} />
                                        </View> :
                                        <ActivityIndicator size={"small"} color={GREEN} style={{ paddingBottom: y(13) }} />}
                            </View>
                            <Text style={[styles.time, { right: x(8), color: '#8B8B8B', }]}>{this.props.data.tS}</Text>
                        </View>
                    </View>
                    <Modal visible={this.state.modal} transparent={true}>
                        <ImageViewer imageUrls={[{
                            url: this.state.url,
                            width: width,
                            height: y(700),
                        }]}
                            enableSwipeDown
                            useNativeDriver={true}
                            onSwipeDown={() => { this.setState({ modal: false }) }} />
                    </Modal>
                </TouchableOpacity>
            )
        else
            return (
                <View style={[styles.container, marginTop, marginBottom]}>
                    <View style={styles.firstLayer}>
                        <View style={[styles.profileImage, this.props.urlRef ? { borderWidth: 0 } : {}]}>
                            {this.props.urlRef ?
                                <Image
                                    source={{ uri: this.props.urlRef }}
                                    resizeMode={'contain'}
                                    style={{
                                        alignSelf: 'stretch',
                                        flex: 1,
                                        height: x(38),
                                        width: x(38),
                                    }} /> :
                                <></>}
                        </View>
                        <View>
                            <View style={[styles.textBox, { backgroundColor: GREY }]}>
                                <Text style={styles.text}>{this.props.data.m}</Text>
                            </View>
                            <Text style={[styles.time, { right: x(8), color: '#8B8B8B', }]}>{this.props.data.tS}</Text>
                        </View>
                    </View>
                </View>
            );
    }
};

export class DayMonthYear extends React.Component {
    render() {
        return (
            <View style={styles.dateMainContainer}>
                <View style={styles.dateSecConatiner}>
                    <Text style={styles.dateText}>{this.props.text}</Text>
                </View>
            </View>
        )
    }
};