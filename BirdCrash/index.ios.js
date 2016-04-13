'use strict';

import React from 'react-native';
import Main from './myapp/Main';

let {
  AppRegistry
} = React;

class BirdCrash extends React.Component {
  render(){
    return(
      <Main/>
    );
  }
}

AppRegistry.registerComponent('BirdCrash', ()=>BirdCrash);
