import React from 'react';
import {
  Platform,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Text,
  Switch
} from 'react-native';
import { PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps';
import SetMarker from './src/SetMarker';
import Login from './src/Login';
import Register from './src/Register';
import MarkerMap from './src/MarkerMap';
import t from 'tcomb-form-native';



t.form.Form.stylesheet.textbox.normal.width = 300;
t.form.Form.stylesheet.textbox.error.width = 300;


class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      Component: null,
      Claim: null
    };
  }

  renderComponent([Component, title, AuthRequired]) {
    return (
      (AuthRequired && this.state.Claim || !AuthRequired && !this.state.Claim) && <TouchableOpacity
        key={title}
        style={styles.button}
        onPress={() => this.setState({ Component })}
      >
        <Text>{title}</Text>
      </TouchableOpacity>
    );
  }

  renderBackButton() {
    return (
      <TouchableOpacity
        style={styles.back}
        onPress={() => this.setState({ Component: null })}
      >
        <Text style={{ fontWeight: 'bold', fontSize: 30 }}>&larr;</Text>
      </TouchableOpacity>
    );
  }

  logOut(){
    this.setState({ Claim: null });
  }


  renderComponents(components) {
    const {
      Component,
      Claim
    } = this.state;

    return (
      <View style={styles.container}>
        {Component && <Component  
        returnMethod = {((comp) => this.setState({ Component: comp })).bind(this)} 
        getClaim = {(() => this.state.Claim).bind(this)} 
        setClaim = {((claim) => this.setState({ Claim: claim })).bind(this)} 
        provider={PROVIDER_GOOGLE} />}
        {Component && this.renderBackButton()}
        {!Component &&
          <ScrollView
            style={StyleSheet.absoluteFill}
            contentContainerStyle={styles.scrollview}
            showsVerticalScrollIndicator={false}
          >
            <Text style={{ fontWeight: 'bold', fontSize: 30 , paddingBottom : 30}}>WPAM</Text>
            {components.map(component => this.renderComponent(component))}
          </ScrollView>
        }
        {!Component && this.state.Claim &&
          <TouchableOpacity
          style={styles.back}
          onPress={() => this.logOut()}
          >
            <Text>Wyloguj</Text>
          </TouchableOpacity>
        }
      </View>
    );
  }

  render() {
    return this.renderComponents([
      [Login, 'Logowanie', false],
      [Register, 'Rejestracja', false],
      [MarkerMap, 'Mapa', true],
      [SetMarker, 'Dodaj zdjęcie!', true],
    ]);
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  scrollview: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  button: {
    flex: 1,
    marginTop: 10,
    backgroundColor: 'rgba(220,220,220,0.7)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
  },
  back: {
    position: 'absolute',
    top: 20,
    left: 12,
    backgroundColor: 'rgba(255,255,255,0.4)',
    padding: 12,
    borderRadius: 20,
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;