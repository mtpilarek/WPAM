import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Image,
  ImageBackground 
} from 'react-native';

import MapView, { Circle, Marker, ProviderPropType, Callout } from 'react-native-maps';

import CustomCallout from './CustomCallout';

import Utils from './Utils';

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE = 17.78825;
const LONGITUDE = -102.4324;
const LATITUDE_DELTA = 0.922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const DEGREE_TO_METER = 111111;
const SCREEN_GAP = 20;
const SPACE = 0.01;

function randomColor(seed) {
  var seedSum = seed ? [0,...seed.split('')].reduce((acc, val) => { return acc + val.charCodeAt() > 122 ? 122 : val.charCodeAt(); }) / (seed.length * 122): null;
  return `#${Math.floor((seedSum != null ? seedSum : Math.random()) * 16777215).toString(16)}`;
}


function calculateLongDelta(meters){
  return (meters + SCREEN_GAP) / DEGREE_TO_METER / Math.cos((meters + SCREEN_GAP) / DEGREE_TO_METER);
}

class MarkerMap extends React.Component {
  constructor(props) {
    super(props);
    this.mapRef = null;
    this.watchID = null;
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

  componentWillMount() {
    this.getMarkers();
  }

  getMarkers(){
    fetch("https://wpam-api.azurewebsites.net/api/Markers?code=tTNIit0urpoRvlkP8gR/rdBNgsK73ZVp0ae4y0d88qLoanrmaDADig==",
    {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({"claim" : this.props.getClaim()})
    })
    .then(res => {return Utils.processResponse(res); })
    .then(res => { console.log(res); this.setState({markers : res.markers}); })
    .catch(res => { console.log(res); alert(res.response)})
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
          this.setState({ initialPosition: initialPosition, lastPosition: initialPosition, region: region
        });
       },
       error =>  {alert(error.message)},
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
      this.setState({ lastPosition: lastPosition});
   });
 };

 enlargePhoto(id){
   var marker = this.state.markers.filter(e => e.id == id)[0];
  this.setState({largePhoto : (<Image
    style={{width: width, height: height - 50}}
    source={{uri: `data:image/png;base64,${marker.photoData}`}}
  />), enlargedMarkerCoords : marker.coordinate})
 }

 returnToMap(){
  this.setState({largePhoto : null});
 }

 moveToYourPosition(){
  if(this.state.lastPosition)
    this.mapRef.animateToCoordinate(this.state.lastPosition.coords, 2);
 }

 moveToMarker(){
  if(this.state.enlargedMarkerCoords)
  {
    var enlargedMarkerCoords = this.state.enlargedMarkerCoords;
    this.mapRef.animateToCoordinate(enlargedMarkerCoords, 0);
    this.setState({enlargedMarkerCoords : null});
  }
 }
 
  render() {
    return (
      <View style={styles.container}>
       {this.state.largePhoto && <View>
        {this.state.largePhoto}
      </View>}
      {!this.state.largePhoto && <MapView
          provider={this.props.provider}
          style={styles.map}
          region={this.state.region}
          ref={map => { this.mapRef = map }}
          onMapReady = {() => this.moveToMarker()}
        >
          {this.state.markers.map(marker => (
            <Marker
              key={marker.id}
              coordinate={marker.coordinate}
              pinColor={marker.category ? randomColor(marker.category) : marker.color}
            >
            <Callout tooltip style={styles.customView} onPress={ () => this.enlargePhoto(marker.id) }>
              <CustomCallout style={{width : width / 2, borderColor: marker.category ? randomColor(marker.category) : marker.color,
                  backgroundColor: marker.category ? randomColor(marker.category) : marker.color}}
                  borderStyle = {{borderTopColor : marker.category ? randomColor(marker.category) : marker.color}}>
              <Text>Użytkownik: {marker.UserName}</Text>
              {marker.desc && <Text>Opis: {marker.desc}</Text>}
              {marker.category && <Text>Kategoria: {marker.category}</Text>}
                <Image 
                 style={{width: width / 2 - 40, height: height / 3 - 24}}
                 source={{uri: `data:image/png;base64,${marker.photoData}`}} 
        />
            </CustomCallout >
              </Callout>
            </Marker>
          ))}
        </MapView>
        }
        <View style={styles.buttonContainer}>
        {!this.state.largePhoto && <TouchableOpacity
            style={styles.bubble}
            onPress = {() => this.moveToYourPosition()}
          >
            <Text>Przejdź do swojej pozycji</Text>
          </TouchableOpacity>
        }
        {this.state.largePhoto && <TouchableOpacity
            style={styles.bubble}
            onPress= {() => this.returnToMap()}
          >
            <Text>Wróć do mapy</Text>
          </TouchableOpacity>
        }
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



export default MarkerMap;
