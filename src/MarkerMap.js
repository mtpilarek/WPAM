import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Image
} from 'react-native';

import MapView, { Circle, Marker, ProviderPropType, Callout } from 'react-native-maps';

import CustomCallout from './CustomCallout';

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE = 17.78825;
const LONGITUDE = -102.4324;
const LATITUDE_DELTA = 0.922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const DEGREE_TO_METER = 111111;
const SCREEN_GAP = 20;
let id = 0;
const SPACE = 0.01;

function randomColor() {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}


function calculateLongDelta(meters){
  return (meters + SCREEN_GAP) / DEGREE_TO_METER / Math.cos((meters + SCREEN_GAP) / DEGREE_TO_METER);
}

class MarkerMap extends React.Component {
  constructor(props) {
    super(props);
    this.mapRef = null;
    this.state = {
      region: {
        latitude: LATITUDE,
        longitude: LONGITUDE,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      },
      markers: [],
      initialPosition: 'unknown'
    };
  }

  componentWillMount = function() {
    var $this = this;
    fetch("https://wpam-api.azurewebsites.net/api/Markers?code=tTNIit0urpoRvlkP8gR/rdBNgsK73ZVp0ae4y0d88qLoanrmaDADig==",
    {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({"claim" : $this.props.getClaim()})
    })
    .then(function(res){return processResponse(res); })
    .then(function(res){ console.log(res); $this.setState({markers : res.markers}); })
    .catch(function(res){ console.log(res); alert(res.response);})
  }




  componentDidMount = function() {
    var $this = this;
    navigator.geolocation.getCurrentPosition(
       function(position) {
          const initialPosition = position;
          const region = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: calculateLongDelta(position.coords.accuracy) /  ASPECT_RATIO,
            longitudeDelta: calculateLongDelta(position.coords.accuracy),
          };
          $this.setState({ initialPosition: initialPosition, lastPosition: initialPosition, region: region
        });
       },
       function(error) {alert(error.message)},
       { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
 };


  render() {
    return (
      <View style={styles.container}>
       
       <MapView
          provider={this.props.provider}
          style={styles.map}
          region={this.state.region}
        >
          {this.state.markers.map(marker => (
            <Marker
              key={marker.id}
              coordinate={marker.coordinate}
              pinColor={marker.color}
            >
              <Callout tooltip style={styles.customView}>
                <CustomCallout style={{width : width / 2}}>
                <Image
          style={{width: width / 2 - 40, height: height / 3 - 24}}
          source={{uri: `data:image/png;base64,${marker.photoData}`}}
        />
                </CustomCallout>
              </Callout>
            </Marker>
          ))}
        </MapView>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.bubble}
          >
            <Text>Przejdź do swojej pozycji</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

MarkerMap.propTypes = {
  provider: ProviderPropType,
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  bubble: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
  },
  latlng: {
    width: 200,
    alignItems: 'stretch',
  },
  button: {
    width: 80,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginVertical: 20,
    backgroundColor: 'transparent',
  },
});

processResponse = function(response) {
  if (response.status === 200) {
    return response.json();
  } else {
    return response.json().then((data) => {
      let error      = new Error(response.status);
      error.response = data.body;
      error.status   = data.status;
      throw error;
    });
  }
};

export default MarkerMap;
