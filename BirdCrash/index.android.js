'use strict';

import React from 'react-native';
import Main from './myapp/Main';

let {
  AppRegistry,
  Platform,
  BackAndroid,
  ToastAndroid
} = React;

class BirdCrash extends React.Component {
  constructor(props){
    super(props);
    this.lastBackPressed = new Date();
  }
  componentWillMount() {
    if (Platform.OS === 'android') {
      BackAndroid.addEventListener('hardwareBackPress', this.onBackAndroid.bind(this));
    }
  }
  componentWillUnmount() {
    if (Platform.OS === 'android') {
      BackAndroid.removeEventListener('hardwareBackPress', this.onBackAndroid.bind(this));
    }
  }
  onBackAndroid(){
    if (this.lastBackPressed && this.lastBackPressed + 2000 >= Date.now()) {
       //最近2秒内按过back键，可以退出应用。
       return false;
     }
     this.lastBackPressed = Date.now();
     ToastAndroid.show('再按一次退出应用',ToastAndroid.SHORT);
     return true;
  }
  render(){
    return(
      <Main/>
    );
  }
}

AppRegistry.registerComponent('BirdCrash', ()=>BirdCrash);
