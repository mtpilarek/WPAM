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

import Register from './Register';

import Utils from './Utils';

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
  constructor(props) {
    super(props);
    this.state = {
      formSent : false
    };
  }
  
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

  handleLogin() {
    const form = this.refs.form.getValue();
    if(form && !this.state.formSent){
    const creds = { userName:form.login, password: form.hasło }
    this.setState({formSent : true});
    this.checkCreds(creds);
  }
  };

  checkCreds(creds){
    fetch("https://wpam-api.azurewebsites.net/api/Login?code=pF7cTxsgmnUgitrEAML7aX74F/ILsaxAx5iguaDse1EmOtiO50rmvw==",
    {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify(creds)
    })
    .then(res => { return  Utils.processResponse(res); })
    .then(res => { console.log(res); alert("Pomyślnie zalogowano użytkownika"); this.props.setClaim(res.Claim); this.props.returnMethod(null) })
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



export default Login;
