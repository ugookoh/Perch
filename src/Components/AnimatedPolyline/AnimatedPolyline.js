import React, { Component } from "react";
import MapView from "react-native-maps";

export class AnimatedPolylineSingleLine extends Component {
    constructor(props) {
        super(props);
        this.state = {
            completed: 0,
            coords_: [],
            coords: []
        };
        this.counter1 = 1;
        this.counter2 = 0;
        this.firstStepComplete = false;
        this.pause = true;
        this.switcher = Math.ceil(this.props.coordinates.length / 31); //This dictaes how fast we are going
    }
    componentDidMount() {
        this.watchID1 = setInterval(() => {
            if (this.firstStepComplete == false)
                this._animateFirst(this.props.coordinates);
        }, 40);

        this.watchID2 = setInterval(() => {
            if (this.firstStepComplete && this.pause) {
                if (this.counter2 >= this.props.coordinates.length) {
                    this.setState({ coords: [] })
                    //console.log(this.state.coords)
                    this.pause = false;
                    setTimeout(() => {
                        this.counter2 = 0;
                        this.pause = true;
                    }, 1000)
                }
                else
                    this._animate(this.props.coordinates);
            }
        }, 40)
    }
    componentWillUnmount() {
        clearInterval(this.watchID1);
        clearInterval(this.watchID2);
    }
    _animateFirst(allCoords) {

        if (this.counter1 <= allCoords.length) {
            this.setState({ coords_: allCoords.slice(0, this.counter1) });
            this.counter1 = (this.counter1 + this.switcher) > allCoords.length ? allCoords.length : (this.counter1 + this.switcher);
        }
        if (this.counter1 == allCoords.length) {
            this.setState({ coords_: allCoords });
            this.counter1 == allCoords.length + 1;
            this.firstStepComplete = true;
        }
    }
    _animate(allCoords) {
        if (JSON.stringify(allCoords) === JSON.stringify(this.state.coords_)) {
            const ratio = Math.ceil((allCoords.length * 3) / 31);
            const numberToAdd = ratio < 3 ? 3 : ratio;

            const futureIndex = (this.counter2 + numberToAdd) < allCoords.length ? this.counter2 + numberToAdd : allCoords.length;

            // if (this.counter2 >= allCoords.length) {
            //     this.setState({ coords: [allCoords[0]] },()=>{ this.pause = false;})

            //     console.log(this.state.coords)
            //     setTimeout(() => {
            //         this.pause = true;
            //     }, 1000);
            //     this.counter2 = 0;
            // }
            // else {

            this.setState({ coords: allCoords.slice(this.counter2, futureIndex + 1) });
            this.counter2 = this.counter2 + 1;
            //}
        }
        else//THE COORDS HAVE CHANGED
        {
            this._animateFirst(this.props.coordinates);
            this.counter1 = 0;
            this.firstStepComplete = false;
        }
    }
    render() {
        return (
            <>
                <MapView.Polyline
                    strokeWidth={this.props.strokeWidth}
                    strokeColor={this.props.strokeColor}
                    coordinates={[...this.state.coords_]}
                />
                {this.state.coords.length !== 0 ? <MapView.Polyline
                    strokeWidth={this.props.strokeWidth}
                    strokeColor={this.props.strokeColorMove}
                    coordinates={[...this.state.coords]}
                /> : <></>}
            </>
        );
    }
};

export class AnimatedPolylineMultipleLine extends Component {
    constructor(props) {
        super(props);
        this.state = {
            completed: 0,
            coords_: [],
            coords: []
        };
        this.counter1 = 1;
        this.counter2 = 0;
        this.firstStepComplete = false;
        this.switcher = Math.ceil(this.props.coordinates.length / 31); //This dictaes how fast we are going
    }
    componentDidMount() {
        this.watchID1 = setInterval(() => {
            if (this.firstStepComplete == false && this.props.start1st==true)//IF WE SHOULD START 1ST ANIMATION
                this._animateFirst(this.props.coordinates);
        }, 40);

        this.watchID2 = setInterval(() => {
            if (this.firstStepComplete && this.props.start2nd) {//IF WE SHOULD START 2ND ANIMATION
                if (this.counter2 >= this.props.coordinates.length) {
                    this.setState({ coords: [] })
                    this.props.complete2nd();  //2ND ANIMATION IS COMPLETE
                    this.counter2 = 0;

                }
                else
                    this._animate(this.props.coordinates);
            }
        }, 40)
    }
    componentWillUnmount() {
        clearInterval(this.watchID1);
        clearInterval(this.watchID2);
    }
    _animateFirst(allCoords) {

        if (this.counter1 <= allCoords.length) {
            this.setState({ coords_: allCoords.slice(0, this.counter1) });
            this.counter1 = (this.counter1 + this.switcher) > allCoords.length ? allCoords.length : (this.counter1 + this.switcher);
        }
        if (this.counter1 == allCoords.length) {
            this.setState({ coords_: allCoords });
            this.counter1 == allCoords.length + 1;
            this.firstStepComplete = true;
             //1ST ANIMATION IS COMPLETE
             this.props.complete1st()

        }
    }
    _animate(allCoords) {
        if (JSON.stringify(allCoords) === JSON.stringify(this.state.coords_)) {
            const ratio = Math.ceil((allCoords.length * 3) / 31);
            const numberToAdd = ratio < 3 ? 3 : ratio;

            const futureIndex = (this.counter2 + numberToAdd) < allCoords.length ? this.counter2 + numberToAdd : allCoords.length;

            this.setState({ coords: allCoords.slice(this.counter2, futureIndex + 1) });
            this.counter2 = this.counter2 + 1;
        }
        else//THE COORDS HAVE CHANGED
        {
            this._animateFirst(this.props.coordinates);
            this.counter1 = 0;
            this.firstStepComplete = false;
        }
    }
    render() {
        return (
            <>
                <MapView.Polyline
                    strokeWidth={this.props.strokeWidth}
                    strokeColor={this.props.strokeColor}
                    coordinates={[...this.state.coords_]}
                />
                {this.state.coords.length !== 0 ? <MapView.Polyline
                    strokeWidth={this.props.strokeWidth}
                    strokeColor={this.props.strokeColorMove}
                    coordinates={[...this.state.coords]}
                /> : <></>}
            </>
        );
    }
};