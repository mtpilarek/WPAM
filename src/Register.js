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
  Button,
} from 'react-native';


import sha512 from 'crypto-js/sha512';

import Login from './Login';

import t from 'tcomb-form-native';

import Utils from './Utils';


var Form = t.form.Form;

var register = t.struct({
  login: t.String,              // a required string
  hasło: t.String,  // an optional string
});

var options = {fields: {
  hasło: {
    password: true,
    secureTextEntry: true,
  }
}}; // optional rendering options (see documentation)

class Register extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formSent : false
    };
  }
  
  render() {
    return (
      <View style={styles.container}>
            <Text style={{ fontWeight: 'bold', fontSize: 30, paddingBottom : 30 }}>Rejestracja</Text>
          <Form
          ref= "form"
          type={register}
          options={options}
        />
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={this.handleRegister.bind(this)}
          style={styles.bubble}
        >
          <Text>Zarejestruj</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => this.props.returnMethod(Login)}
          style={styles.bubble}
        >
          <Text>Przejdź do logowania</Text>
        </TouchableOpacity>
      </View>
    </View>
    );
  }

  handleRegister() {
    const form = this.refs.form.getValue();
    if(form && !this.state.formSent){
    const creds = { userName:form.login, password: sha512(form.password).toString() }
    this.setState({formSent : true});
    this.createUser(creds);
    }
  };

  createUser(creds){
    fetch("https://wpam-api.azurewebsites.net/api/Register?code=tTNIit0urpoRvlkP8gR/rdBNgsK73ZVp0ae4y0d88qLoanrmaDADig==",
    {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify(creds)
    })
    .then(res => {return Utils.processResponse(res); })
    .then(res => { console.log(res); alert("Pomyślnie utworzono użytkownika, można się zalogować"); this.props.returnMethod(null) })
    .catch(res => { console.log(res); this.setState({formSent : false}); alert(res.response)})
  }
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

export default Register;
