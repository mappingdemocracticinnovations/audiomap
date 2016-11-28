import config from "./config.json";
const { accessToken, style } = config;
import React, { Component } from 'react';
import './App.css';
import 'bulma/css/bulma.css'
import 'font-awesome/css/font-awesome.min.css'
import ReactMapboxGl, { ZoomControl, Layer, Popup, Feature } from "react-mapbox-gl";
import {GeolocateControl, DoubleClickZoomHandler} from 'mapbox-gl/dist/mapbox-gl.js'
import {observable, toJS} from 'mobx';
import {observer} from 'mobx-react';
import AudioPlayer from 'react-responsive-audio-player'
import './audioplayer.css'

var appState = observable({
    station: null,
    popupShowLabel: true,
    center: [-3.69366,40.41075],
    zoom: [10],
    features: []
});

const styles = {
  button: {
    cursor: "pointer"
  },

  stationDescription: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: "16px 0px",
    textAlign: "center",
    backgroundColor: "white"
  },

  popup: {
    background: "#fff",
    padding: "5px",
    borderRadius: "2px"
  }
}

let geojson = require('../iniciativas.json')

@observer
class LayerWithFeatures extends Component {
  _onToggleHover(cursor, { map }) {
    map.getCanvas().style.cursor = cursor;
  }
  _markerClick = (station, { feature }) => {
    console.log("in _markerClick", station, feature)
    this.props.map.flyTo({
      center: station.geometry.coordinates.slice(),
      zoom: [14]
    })
    appState.station = station
    // TODO: should resize only on have/have not station
    this.props.map.resize();
  };


  render() {
    let {features} = this.props
    let comp = this
    if (features) {
      return (<Layer
          type="symbol"
          layout={{ "icon-image": "marker-15" }}>
        {
          features.map((station, index) => (
            <Feature
                key={station.properties['cartodb_id']}
                onHover={comp._onToggleHover.bind(comp, "pointer")}
                onEndHover={comp._onToggleHover.bind(comp, "")}
                onClick={comp._markerClick.bind(comp, station)}
                coordinates={station.geometry.coordinates.slice()}/>
          ))
        }
      </Layer>)
    } else {
      return (<div/>)
    }
  }
}

const SoundPlayer = (props) => {
  let playlist = [
    { url: 'https://s3.amazonaws.com/audiomap/music/Audiobinger_-_Shot_Me_Down.mp3',
      displayText: 'Interview with Consuelo de Prado' }]
  if (props.station.audio_url) {
    return (
      <article className="tile is-child notification is-primary">
        <p className="title">Audio Recording</p>
        <AudioPlayer playlist={playlist}/>
      </article>
    )
  } else {
    return (<div/>)
  }
}

const Bottom = () => {
  if (appState.station) {
    let station = toJS(appState.station).properties
    station.audio_url = 'https://s3.amazonaws.com/audiomap/music/Audiobinger_-_Shot_Me_Down.mp3'
    return (
      <div className="tile is-parent is-vertical">
        <article className="tile is-child notification is-warning">
          <p className="title">{station.topic}</p>
          <p className="subtitle">{station.space}</p>
        </article>
        <SoundPlayer station={station}/>
      </div>
    )
  } else {
    return (<div></div>)
  }
}

@observer
class App extends Component {

  state = {
    center: [-3.69366,40.41075],
    zoom: [10],
    features: [],
    popupShowLabel: true
  };

  componentWillMount() {
    this.setState({features: geojson.features})
  };

  _onDrag = () => {
    if (this.state.station) {
      this.setState({
        station: null
      });
    }
  };

  _setMove = (end) => {
    if(end !== this.state.end)
      this.setState({ end });
  };

  _onControlClick = (map, zoomDiff) => {
    const zoom = map.getZoom() + zoomDiff;
    this.setState({ zoom: [zoom] });
  };

  _popupChange(popupShowLabel) {
    this.setState({ popupShowLabel });
  }

  _handleStyleLoad(map, arg) {
    var nav = new GeolocateControl();
    this.map = map
    map.addControl(nav, 'top-left');
    // this.doubleClickZoomHandler = new DoubleClickZoomHandler(map)
    map.flyTo({
      center: appState.center.slice(),
      zoom: appState.zoom.slice()
    })
  }

  render() {
    let { features } = this.state;
    const { station, popupShowLabel } = appState;
    let classnames = "map" + (station === null ? " full" : " half");
    let containerStyle;
    if (station) {
      containerStyle = {
          height: "50vh",
          width: "100vw"
      }
    } else {
      containerStyle = {
          height: "100vh",
          width: "100vw"
      }
    } 
    return (
      <div className="app">
        <ReactMapboxGl
          className={classnames}
          style={style}
          minZoom={8}
          maxZoom={25}
          accessToken={accessToken}
          onStyleLoad={this._handleStyleLoad.bind(this)}
          onDrag={this._onDrag}
          onMoveEnd={this._setMove.bind(this, true)}
          onMove={this._setMove.bind(this, false)}
          containerStyle={containerStyle}>

          <ZoomControl zoomDiff={2} />
          <LayerWithFeatures 
            map={this.map}
            features={features} />
        </ReactMapboxGl>
        { station ? <Bottom/> : <div />}
      </div>
    );
  }
}

export default App;

