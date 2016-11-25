import config from "./config.json";
const { accessToken, style } = config;
import React, { Component } from 'react';
import './App.css';
import 'bulma/css/bulma.css'
import 'font-awesome/css/font-awesome.min.css'
import ReactMapboxGl, { ZoomControl, Layer, Popup, Feature } from "react-mapbox-gl";
import {GeolocateControl} from 'mapbox-gl/dist/mapbox-gl.js'
import {observable, toJS} from 'mobx';
import {observer} from 'mobx-react';

var appState = observable({
    station: null,
    popupShowLabel: true
});

const containerStyle = {
  height: "50vh",
  width: "100vw"
};

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


class LayerWithFeatures extends Component {
  _onToggleHover(cursor, { map }) {
    map.getCanvas().style.cursor = cursor;
  }
  _markerClick = (station, { feature }) => {
    // console.log("in _markerClick", station, feature)
    appState.station = station
    appState.center = feature.geometry.coordinates
    appState.zoom = [14]
  };


  render() {
    let {features} = this.props
    let comp = this
    if (features) {
      return (<Layer
        type="symbol"
        layout={{ "icon-image": "{icon}-15" }}
        >
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

const Bottom = () => {
  if (appState.station) {
    let station = appState.station.properties
    return (
      <div className="tile is-parent is-vertical">
        <article className="tile is-child notification is-primary">
          <p>
            <span className="icon">
              <i className="fa fa-play"></i>
            </span>&nbsp;
            <span className="title">Play story audio</span>
          </p>
        </article>
        <article className="tile is-child notification is-warning">
          <p className="title">{station.ini_topic}</p>
          <p className="subtitle">{station.ini_space}</p>
        </article>
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
    // defer till people click on geolocation button
    // let comp = this
    // navigator.geolocation.getCurrentPosition(
    //   function(position) {
    //     var locationMarker = null;
    //     if (locationMarker){
    //       // return if there is a locationMarker bug
    //       return;
    //     }

    //     // sets default position to your position
    //     let selfLat = position.coords["latitude"];
    //     let selfLng = position.coords["longitude"];
    //     comp.setState({center: [selfLng, selfLat], zoom: [10]})
    //   },
    //   function(error) {
    //     console.log("Error: ", error);
    //   },
    //   {
    //     enableHighAccuracy: true
    //   }
    // );
    this.setState({features: geojson.features})
  };

  componentDidMount() {
  }

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
    console.log('in _onControlClick', zoomDiff)
    const zoom = map.getZoom() + zoomDiff;
    this.setState({ zoom: [zoom] });
  };

  _popupChange(popupShowLabel) {
    this.setState({ popupShowLabel });
  }

  _handleStyleLoad(map, arg) {
    console.log(arg, map)
    var nav = new GeolocateControl();
    map.addControl(nav, 'top-left');
  }

  render() {
    let { features } = this.state;
    const { station, popupShowLabel } = appState;

    features = features.map(function (feature, index) {
      // console.log(feature)
      if (index % 2 === 0) {
        feature.properties['marker-color'] = '#3ca0d3'
        feature.properties['marker-size'] = 'large'
        feature.properties['icon'] = 'marker'
      }
      return feature
    })
    console.log('FEATURES', features)
    // console.log('NEWFEATURES', newfeatures)

    return (
      <div className="app">
        <ReactMapboxGl
          className="map"
          style={style}
          center={this.state.center}
          zoom={this.state.zoom}
          minZoom={8}
          maxZoom={25}
          accessToken={accessToken}
          onStyleLoad={this._handleStyleLoad.bind(this)}
          onDrag={this._onDrag}
          onMoveEnd={this._setMove.bind(this, true)}
          onMove={this._setMove.bind(this, false)}
          containerStyle={containerStyle}>

          <ZoomControl
            zoomDiff={2}
            onControlClick={this._onControlClick}/>
          <LayerWithFeatures features={features} />

        </ReactMapboxGl>
        <Bottom />
      </div>
    );
  }
}

export default App;


          // <GeoJSONLayer
          //   data={geojson}
          //   symbolLayout={{
          //     "text-field": "{ini_topic}",
          //     "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
          //     "text-offset": [0, 0.6],
          //     "text-anchor": "top"
          //   }}/>

          // <LayerWithFeatures features={features} />
          // {
          //   station && (
          //     <Popup key={station.properties['cartodb_id']} coordinates={station.geometry.coordinates.slice()} closeButton={true}>
          //       <div>
          //         <span style={{
          //           ...styles.popup,
          //           display: popupShowLabel ? "block" : "none"
          //         }}>
          //           {station.properties['ini_topic']}
          //         </span>
          //         <div onClick={this._popupChange.bind(this, !popupShowLabel)}>
          //           {
          //             popupShowLabel ? "Hide" : "Show"
          //           }
          //         </div>
          //       </div>
          //     </Popup>
          //   )
          // }