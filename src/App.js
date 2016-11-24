import React, { Component } from 'react';
import './App.css';
import 'bulma/css/bulma.css'
import 'font-awesome/css/font-awesome.min.css'
import ReactMapboxGl, { ZoomControl, Layer, Popup, Feature } from "react-mapbox-gl";
import config from "./config.json";

const { accessToken, style } = config;

const geojsonURL = "https://s3.amazonaws.com/audiomap/iniciativas.geojson"
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
console.log("Geojson", geojson)

function getPlaces() {
  return geojson
  // return fetch(geojsonURL)
  //   .then(res => res.json())
  //   .then(data => {
  //     return new Promise((resolve, reject) => {
  //       // let geojson = JSON.stringify(data)
  //       console.log(data);
  //       resolve(data);
  //       // parseString(data, (err, res) => {
  //       //   if(!err) {
  //       //     resolve(res.stations.station);
  //       //   } else {
  //       //     reject(err);
  //       //   }
  //       // });
  //     });
  //   })
}


class LayerWithFeatures extends Component {
  _onToggleHover(cursor, { map }) {
    map.getCanvas().style.cursor = cursor;
  }
  _markerClick = (station, { feature }) => {
    console.log("in _markerClick", station, feature)
    this.setState({
      center: feature.geometry.coordinates,
      zoom: [14],
      station
    });
  };


  render() {
    let {features} = this.props
    console.log("FEATURES", features)
    let comp = this
    if (features) {
      return (<Layer
        type="symbol"
        id="marker"
        layout={{ "icon-image": "marker-15" }}>
        {
          features.map((station, index) => (
            <Feature
                key={station.properties['cartodb_id']}
                onHover={comp._onToggleHover.bind(comp, "pointer")}
                onEndHover={comp._onToggleHover.bind(comp, "")}
                onClick={comp._markerClick.bind(comp, station)}
                coordinates={station.geometry.coordinates}/>
          ))
        }
      </Layer>)
    } else {
      return (<div/>)
    }
    
  }
}


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

    // getPlaces().then(res => {
    //   this.setState({features: res.features})
    // });
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


  render() {
    const { features, station, end, popupShowLabel } = this.state;
    if (station) {
      console.log(<Popup key={station.properties['cartodb_id']} coordinates={station.geometry.coordinates} closeButton={true}>
        <div>
          <span style={{
            ...styles.popup,
            display: popupShowLabel ? "block" : "none"
          }}>
            {station.properties['ini_topic']}
          </span>
          <div onClick={this._popupChange.bind(this, !popupShowLabel)}>
            {
              popupShowLabel ? "Hide" : "Show"
            }
          </div>
        </div>
      </Popup>)
    }



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
          onDrag={this._onDrag}
          onMoveEnd={this._setMove.bind(this, true)}
          onMove={this._setMove.bind(this, false)}
          containerStyle={containerStyle}>

          <ZoomControl
            zoomDiff={1}
            onControlClick={this._onControlClick}/>


          <LayerWithFeatures features={features} />
          {
            station && (
              <Popup key={station.properties['cartodb_id']} coordinates={station.geometry.coordinates} closeButton={true}>
                <div>
                  <span style={{
                    ...styles.popup,
                    display: popupShowLabel ? "block" : "none"
                  }}>
                    {station.properties['ini_topic']}
                  </span>
                  <div onClick={this._popupChange.bind(this, !popupShowLabel)}>
                    {
                      popupShowLabel ? "Hide" : "Show"
                    }
                  </div>
                </div>
              </Popup>
            )
          }

        </ReactMapboxGl>
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
            <p className="title">La Tabacalera</p>
            <p className="subtitle">Centro Social autogestionado en la antigua fabrica de tabacos de Lavapies</p>
          </article>
        </div>
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

