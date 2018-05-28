import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
} from 'react-native';

import MapView, { Circle, Marker, ProviderPropType } from 'react-native-maps';

import { RNCamera } from 'react-native-camera';

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE = 37.78825;
const LONGITUDE = -122.4324;
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

function haversineDistance(coords1, coords2) {
  function toRad(x) {
    return x * Math.PI / 180;
  }

  var lon1 = coords1.longitude;
  var lat1 = coords1.latitude;

  var lon2 = coords2.longitude;
  var lat2 = coords2.latitude;

  var R = 6371; // km

  var x1 = lat2 - lat1;
  var dLat = toRad(x1);
  var x2 = lon2 - lon1;
  var dLon = toRad(x2)
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d * 1000;
}

class SetMarker extends React.Component {
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
      circles: [],
      initialPosition: 'unknown',
      lastPosition: 'unknown',
      photoData: null
    };
    watchID: number = null;
    this.onMapPress = this.onMapPress.bind(this);
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
          $this.setState({ initialPosition: initialPosition, lastPosition: initialPosition, region: region,
            circles: [
            {
              center: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              },
              radius: position.coords.accuracy,
            },
          ]
        });
       },
       function(error) {alert(error.message)},
       { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
    this.watchID = navigator.geolocation.watchPosition(function(position){
       const lastPosition = position;
       const region = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        latitudeDelta: calculateLongDelta(position.coords.accuracy) /  ASPECT_RATIO,
        longitudeDelta: calculateLongDelta(position.coords.accuracy),
      };
      if(haversineDistance(position.coords, $this.state.region) > position.coords.accuracy)
        $this.setState({ markers : []});
       $this.setState({ lastPosition: lastPosition, region: region,
        circles: [
        {
          center: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          radius: position.coords.accuracy,
        },
      ] });
    });
 };

 componentWillUnmount =function(){
    navigator.geolocation.clearWatch(this.watchID);
};

  onMapPress(e) {
    if(haversineDistance(this.state.circles[0].center, e.nativeEvent.coordinate) < this.state.circles[0].radius && this.state.markers.length == 0)
      this.setState({
        markers: [
          ...this.state.markers,
          {
            coordinate: e.nativeEvent.coordinate,
            key: `foo${id++}`,
            color: randomColor(),
          },
        ]
      });
  }

  render() {
    return (
      <View style={this.state.photoData ? styles.container : styles.cameraContainer}>
       
       {this.state.photoData && <MapView
          provider={this.props.provider}
          style={styles.map}
          region={this.state.region}
          scrollEnabled={false}
          zoomEnabled={false}
          pitchEnabled={false}
          rotateEnabled={false}
          onPress={(e) => this.onMapPress(e)}
          ref={(ref) => { this.mapRef = ref }}
        >
          {this.state.markers.map(marker => (
            <Marker
              key={marker.key}
              coordinate={marker.coordinate}
              pinColor={marker.color}
            />
          ))}
          {this.state.circles.map(circle => (
            <Circle
            key={"circle"}
            center={circle.center}
            radius={circle.radius}
            strokeColor="rgba(0,0,0,0.5)"
            zIndex={2}
            strokeWidth={2}
          />
          ))}
        </MapView>
        }
        {this.state.photoData && <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => this.setState({ markers: [] })}
            style={styles.bubble}
          >
            <Text>Wciśnij, aby usunąć marker</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => this.setState({ photoData: null, markers: [] })}
            style={styles.bubble}
          >
            <Text>Wciśnij, aby powtórzyć zdjęcie</Text>
          </TouchableOpacity>
          {this.state.markers && this.state.markers.length > 0 && <TouchableOpacity
            onPress={() => this.updateMarker()}
            style={styles.bubble}
          >
            <Text>Wciśnij, aby potwierdzić wybór lokalizacji</Text>
          </TouchableOpacity>
          }
        </View>
        }
       {!this.state.photoData && 
        <RNCamera
            ref={ref => {
              this.camera = ref;
            }}
            style = {styles.preview}
            type={RNCamera.Constants.Type.back}
            flashMode={RNCamera.Constants.FlashMode.on}
            permissionDialogTitle={'Permission to use camera'}
            permissionDialogMessage={'We need your permission to use your camera phone'}
        />
          }
          {!this.state.photoData && 
        <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center' }}>
          <TouchableOpacity
            onPress={this.takePicture.bind(this)}
            style={styles.capture}
          >
            <Text>Wciśnij, aby zrobić zdjęcie</Text>
          </TouchableOpacity>
        </View>
          }
      </View>
    );
  }

  updateMarker = function(){
    var $this = this;
    fetch("https://wpam-api.azurewebsites.net/api/AddMarker?code=tTNIit0urpoRvlkP8gR/rdBNgsK73ZVp0ae4y0d88qLoanrmaDADig==",
    {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({"claim" : $this.props.getClaim(), "marker" : {...$this.state.markers[0], "photoData" : this.state.photoData}})
    })
    .then(function(res){return processResponse(res); })
    .then(function(res){ console.log(res); alert("Pomyślnie dodano zdjęcie!"); $this.props.returnMethod(null); })
    .catch(function(res){ console.log(res); alert(res.response);})
    
  }
  
  takePicture = async function() {
    if (this.camera) {
      const options = { quality: 0.5, base64: true };
      const data = await this.camera.takePictureAsync(options)
      if(data)
        this.setState({photoData : data.base64})
      else
      this.setState({photoData : "iVBORw0KGgoAAAANSUhEUgAAADMAAAAzCAYAAAA6oTAqAAAAEXRFWHRTb2Z0d2FyZQBwbmdjcnVzaEB1SfMAAABQSURBVGje7dSxCQBACARB+2/ab8BEeQNhFi6WSY  zYLYudDQYGBgYGBgYGBgYGBgYGBgZmcvDqYGBgmhivGQYGBgYGBgYGBgYGBgYGBgbmQw+P/eMrC5UTVAAAAABJRU5ErkJggg=="})
      console.log(data.uri);
    }
  };

}

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

SetMarker.propTypes = {
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
  cameraContainer: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  capture: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20,
  },
});

export default SetMarker;
