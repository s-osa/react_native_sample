/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  Image,
  View,
  FlatList,
  Dimensions,
  ActivityIndicator,
  Animated,
  AsyncStorage,
  Button,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { StackNavigator } from 'react-navigation';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' +
    'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

class Main extends Component {
  static navigationOptions = (({navigation}) => {
    return ({
      title: 'New Articles',
      headerTintColor: 'white',
      headerBackTitleStyle: { color: 'white' },
      headerStyle: { backgroundColor: '#00aced' },
      headerRight: <TouchableOpacity style={{paddingRight: 8}} onPress={() => {navigation.navigate('Archive')}}>
        <Image source={require('./images/menu.png')} style={{width: 25, height: 25}}/>
      </TouchableOpacity>
    });
  });

  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      threads: [],
      opacity: new Animated.Value(0)
    };
  }

  animate() {
    Animated.timing(
      this.state.opacity,
      {
        toValue: 1,
        duration: 1000,
      }
    ).start();
  }

  save(article) {
    let data = article.item.data;
    AsyncStorage.setItem(data['title'], JSON.stringify(data), (error) => {
      if (error) {
        console.error(error);
        return false;
      } else {
        return true;
      }
    });
  }

  componentDidMount() {
    fetch("https://www.reddit.com/r/newsokur/hot.json").then((response) => {
      return response.json();
    }).then((responseJson) => {
      let threads = responseJson.data.children;
      threads = threads.map((thread) => {
        thread.key = thread.data.url;
        return thread;
      });
      this.setState({threads: threads, isLoading: false});
    }).catch((error) => {
      console.error(error);
    })
  }


  render() {
    const { threads, isLoading, opacity } = this.state;
    const { width, height, scale } = Dimensions.get('window');

    if(!isLoading) {
      this.animate();
    }

    return (
      <View style={styles.container}>
        {isLoading
          ? <ActivityIndicator/>
          : <Animated.View style={{opacity: opacity}}>
            <FlatList data={threads} renderItem={(thread) => {
              return (
                <View key={thread.key} style={{flex: 1, flexDirection: 'row', width: '100%', borderBottomWidth: 2, borderColor: '#f5f5f5'}}>
                  <Image style={{width: 50, height: 50}} source={{uri: thread.item.data.thumbnail}}/>
                  <View style={{width: width - 50}}>
                    <View style={{flex: 1, flexDirection: 'column'}}>
                      <Text>{thread.item.data.title}</Text>
                      <Text style={{color: "#ababab", fontSize: 10}}>{thread.item.data.domain}</Text>
                      <Button onPress={() => { this.save(thread) }} title={'Stock'}/>
                    </View>
                  </View>
                </View>
              )
            }}/>
          </Animated.View>
        }
      </View>
    );
  }
}

class Archive extends Component {
  static navigationOptions = {
    title: 'Stocked Articles',
    headerTintColor: 'white',
    headerBacTitleStyle: {color: 'white'},
    headerStyle: {backgroundColor: '#00aced'},
  }

  constructor() {
    super();
    this.state = {
      threads: [],
    }
  }

  componentDidMount() {
    this.getData();
  }

  getData() {
    AsyncStorage.getAllKeys((err, keys) => {
      if (err) {
        console.error(err);
        return false;
      } else {
        AsyncStorage.multiGet(keys, (err, data) => {
          let threads = data.map((thread) => {
            return JSON.parse(thread[1]);
          });
          this.setState({threads});
          return true;
        });
      }
    });
  }

  render() {
    const { threads } = this.state;
    const { width, height } = Dimensions.get('window');

    return (
      <View style={styles.container}>
        <FlatList data={threads} renderItem={(thread) => {
          return (
            <View style={{flex: 1, flexDerection: 'row', width: '100%'}}>
              <Image style={{width: 50, height: 50}} source={{uri: thread.item.thumbnail}}/>
              <View style={{width: width - 50}}>
                <View style={{flex: 1, flexDirection: 'column'}}>
                  <Text>{thread.item.title}</Text>
                  <Text style={{color: "#ababab", fontSize: 10}}>{thread.item.domain}</Text>
                </View>
              </View>
            </View>
          );
        }}/>
      </View>
    );
  }
}

export default class App extends Component<{}> {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <StatusBar barStyle='light-content' />
        <AppNavigation/>
      </View>
    );
  }
}

const AppNavigation = StackNavigator({
  Main: { screen: Main },
  Archive: { screen: Archive },
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
