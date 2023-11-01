import * as React from 'react';
import {AppRegistry} from 'react-native';
import {Provider as StoreProvider} from 'react-redux';
import {name as appName} from './app.json';
import App from './src/App';
import {Store} from './store/Store';
import {NavigationContainer} from '@react-navigation/native';
import {light} from './src/style/theme';
import {ThemeProvider} from 'styled-components/native'; // 사용하는 테마 라이브러리에 따라 다를 수 있습니다.

export default function Main() {
  return (
    <StoreProvider store={Store}>
      <ThemeProvider theme={light}>
        <NavigationContainer>
          <App />
        </NavigationContainer>
      </ThemeProvider>
    </StoreProvider>
  );
}

AppRegistry.registerComponent(appName, () => Main);
