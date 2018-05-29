import React from 'react';
import PropTypes from 'prop-types';

import {
  StyleSheet,
  View,
  Image
} from 'react-native';

const propTypes = {
  children: PropTypes.node.isRequired,
  style: PropTypes.object,
  borderStyle: PropTypes.object,
};

class CustomCallout extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <View style={[styles.bubble, this.props.style]}>
        <View style={styles.amount}>
            {this.props.children}
         </View>
        </View>
        <View style={[styles.arrowBorder, this.props.borderStyle ]} />
        <View style={[styles.arrow, this.props.borderStyle]} />
      </View>
    );
  }
}

CustomCallout.propTypes = propTypes;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignSelf: 'flex-start',
  },
  bubble: {
    width: 320,
    flexDirection: 'row',
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 6,
    borderWidth: 0.5,
    zIndex: 1
  },
  amount: {
    flex: 1,
    zIndex: 2,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  arrow: {
    backgroundColor: 'transparent',
    borderWidth: 16,
    borderColor: 'transparent',
    alignSelf: 'center',
    marginTop: -32,
  },
  arrowBorder: {
    backgroundColor: 'transparent',
    borderWidth: 16,
    borderColor: 'transparent',
    alignSelf: 'center',
    marginTop: -0.5,
  },
});

export default CustomCallout;
