'use strict';

import React from 'react-native';

let {
  WebView
} = React;

class Main extends React.Component {
  render(){
    return(
      <WebView
        scalesPageToFit={true}
        startInLoadingState={true}
        javaScriptEnabled={true}
        source={{uri:'http://mikuscallion.github.io/fmx-birdcrash/'}}
      />
    );
  }
}

export { Main as default };
