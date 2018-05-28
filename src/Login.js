import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Item,
  Label,
  Input,
  Button
} from 'react-native';

import t from 'tcomb-form-native';

import sha512 from 'crypto-js/sha512';

import Register from './Register';

var Form = t.form.Form;

var login = t.struct({
  login: t.String,
  hasło: t.String,
});

var options = {fields: {
  hasło: {
    password: true,
    secureTextEntry: true,
  }
}}; 

class Login extends React.Component {

  
  render() {
    return (
      <View style={styles.container}>
      <Text style={{ fontWeight: 'bold', fontSize: 30 , paddingBottom : 30}}>Logowanie</Text>
          <Form
          ref= "form"
          type={login}
          options={options}
        />
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={this.handleLogin.bind(this)}
          style={styles.bubble}
        >
          <Text>Zaloguj</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => this.props.returnMethod(Register)}
          style={styles.bubble}
        >
          <Text>Przejdź do rejestracji</Text>
        </TouchableOpacity>
      </View>
    </View>
    );
  }

  handleLogin = function() {
    const form = this.refs.form.getValue()
    const creds = { userName:form.login, password: sha512(form.password).toString() }
    var $this = this;
    fetch("https://wpam-api.azurewebsites.net/api/Login?code=pF7cTxsgmnUgitrEAML7aX74F/ILsaxAx5iguaDse1EmOtiO50rmvw==",
    {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify(creds)
    })
    .then(function(res){ return  processResponse(res); })
    .then(function(res){ console.log(res); alert("Pomyślnie zalogowano użytkownika"); $this.props.setClaim(res.Claim); $this.props.returnMethod(null) })
    .catch(function(res){ console.log(res); alert(res.response);})
  };
}



const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
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
}



export default Login;
