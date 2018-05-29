import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Image,
  Picker,
  TextInput
} from 'react-native';

import MapView, { Circle, Marker, ProviderPropType } from 'react-native-maps';

import { RNCamera } from 'react-native-camera';

import Utils from './Utils';

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE = 37.78825;
const LONGITUDE = -122.4324;
const LATITUDE_DELTA = 0.922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const DEGREE_TO_METER = 111111;
const SCREEN_GAP = 20;
const SPACE = 0.01;

function randomColor(seed) {
  var seedSum = seed ? [0,...seed.split('')].reduce((acc, val) => { return acc + val.charCodeAt() > 122 ? 122 : val.charCodeAt(); }) / (seed.length * 122) : null;
  return `#${Math.floor((seedSum | Math.random()) * 16777215).toString(16)}`;
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

  componentDidMount() {

    navigator.geolocation.getCurrentPosition(
       position => {
          const initialPosition = position;
          const region = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: calculateLongDelta(position.coords.accuracy) /  ASPECT_RATIO,
            longitudeDelta: calculateLongDelta(position.coords.accuracy),
          };
          this.setState({ initialPosition: initialPosition, lastPosition: initialPosition, region: region,
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
       error => {alert(error.message)},
       { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );

    this.watchID = navigator.geolocation.watchPosition(position => {
       const lastPosition = position;
       const region = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        latitudeDelta: calculateLongDelta(position.coords.accuracy) /  ASPECT_RATIO,
        longitudeDelta: calculateLongDelta(position.coords.accuracy),
      };
      
      if(haversineDistance(position.coords, this.state.region) > position.coords.accuracy)
        this.setState({ markers : []});
        
       this.setState({ lastPosition: lastPosition, region: region,
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

 componentWillUnmount(){
    navigator.geolocation.clearWatch(this.watchID);
};

  onMapPress(e) {
    if(haversineDistance(this.state.circles[0].center, e.nativeEvent.coordinate) < this.state.circles[0].radius && this.state.markers.length == 0)
      this.setState({
        markers: [
          ...this.state.markers,
          {
            coordinate: e.nativeEvent.coordinate,
            key: `marker`,
            color: randomColor(),
          },
        ]
      });
  }

  render() {
    return (
      <View style={this.state.photoData ? styles.container : styles.cameraContainer}>
       
       {this.state.photoData && !this.state.finalize && <MapView
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

     {this.state.finalize && !this.state.photoShow && <View>
          <TextInput
        style={{height: 40, width: 200, borderColor: 'gray', borderWidth: 1}}
        onChangeText={(text) => this.setState({desc : text})}
        placeholder={"Podaj krótki opis"}
      />
      <Picker
        selectedValue={this.state.category}
        style={{height: 40, width: 200, borderColor: 'gray', borderWidth: 1}}
        onValueChange={(itemValue, itemIndex) => this.setState({category: itemValue})}>
        <Picker.Item label="Bez kategorii" value="Bez kategorii" />
        <Picker.Item label="Ludzie" value="Ludzie" />
        <Picker.Item label="Zwierzęta" value="Zwierzęta" />
        <Picker.Item label="Krajobrazy" value="Krajobrazy" />
        <Picker.Item label="Dziwne" value="Dziwne" />
        <Picker.Item label="Niesamowite" value="Niesamowite" />
      </Picker>
        </View>}

        {this.state.photoData && !this.state.photoShow && <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => this.setState({ photoShow : true})}
            style={styles.bubble}
          >
            <Text>Wciśnij, aby podejrzeć zdjęcie</Text>
          </TouchableOpacity>

          {this.state.finalize  &&<TouchableOpacity
            onPress={() => this.setState({finalize : false, markers : []})}
            style={styles.bubble}
          >
            <Text>Wciśnij, aby wybrać lokalizację ponownie</Text>
          </TouchableOpacity>
          }

         {this.state.finalize  && <TouchableOpacity
            onPress={() => this.updateMarker()}
            style={styles.bubble}
          >
            <Text>Wciśnij, aby wysłać zdjęcie</Text>
          </TouchableOpacity>
          }

          {this.state.markers && this.state.markers.length > 0 && !this.state.finalize && <TouchableOpacity
            onPress={() => this.setState({ markers: [] })}
            style={styles.bubble}
          >
            <Text>Wciśnij, aby usunąć marker</Text>
          </TouchableOpacity>
        }
          {this.state.markers && this.state.markers.length > 0 && !this.state.finalize && <TouchableOpacity
            onPress={() => this.setState({finalize : true})}
            style={styles.bubble}
          >
            <Text>Wciśnij, aby potwierdzić wybór lokalizacji</Text>
          </TouchableOpacity>
          }
        </View>
        }

        {this.state.photoShow &&  <View>
          <Image
    style={{width: width, height: height - 50}}
    source={{uri: `data:image/png;base64,${this.state.photoData}`}}
  />
  <View style={styles.buttonContainer}>
            <TouchableOpacity
            onPress={() => this.setState({ photoData: null, markers: [] , photoShow: false})}
            style={styles.bubble}
          >
            <Text>Wciśnij, aby powtórzyć zdjęcie</Text>
          </TouchableOpacity>
  <TouchableOpacity
            onPress={() => this.setState({photoShow: false})}
            style={styles.bubble}
          >
            <Text>Wciśnij, aby wrócić</Text>
          </TouchableOpacity>
          </View>
        </View>}


       {!this.state.photoData && 
      <View style={{flex:1, flexDirection:'column', justifyContent:'center'}}>
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

  updateMarker(){
    var marker = this.state.markers[0];
    marker.color = randomColor(this.state.category);
    fetch("https://wpam-api.azurewebsites.net/api/AddMarker?code=tTNIit0urpoRvlkP8gR/rdBNgsK73ZVp0ae4y0d88qLoanrmaDADig==",
    {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({"claim" : this.props.getClaim(), "marker" : {...this.state.markers[0], "photoData" : this.state.photoData, "desc": this.state.desc, "category" : this.state.category}})
    })
    .then(res => {return Utils.processResponse(res); })
    .then(res => { console.log(res); alert("Pomyślnie dodano zdjęcie!"); this.props.returnMethod(null); })
    .catch(res => { console.log(res); alert(res.response)})
    
  }
  
  async takePicture() {
    if (this.camera) {
      const options = { quality: 0.5, base64: true };
      const data = await this.camera.takePictureAsync(options)
      if(data)
        this.setState({photoData : data.base64})
      console.log(data.uri);
    }
  };

}


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
    flexWrap: 'wrap',
    marginVertical: 20,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  cameraContainer: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  preview: {
    flex: 1,
    width: width,
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
