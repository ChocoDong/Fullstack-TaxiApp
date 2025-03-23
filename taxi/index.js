/**
 * @format
 */

import 'react-native-get-random-values';
import {AppRegistry} from 'react-native';
import TaxiApp from './src/TaxiApp';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => TaxiApp);
