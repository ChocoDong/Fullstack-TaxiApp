import React, {JSX} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation, ParamListBase} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

function Main_Setting(): JSX.Element {
  const navigation = useNavigation<StackNavigationProp<ParamListBase>>();

  const arrSetMenu = [
    {id: 0, name: '로그아웃'},
    {id: 1, name: '닉네임 설정'},
  ];

  const onLogout = () => {
    AsyncStorage.removeItem('userId').then(() => {
      navigation.popToTop();
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        style={{width: '100%'}}
        data={arrSetMenu}
        renderItem={({item}) => {
          if (item.id === 0) {
            // 로그아웃 항목
            return (
              <TouchableOpacity style={styles.itemContainer} onPress={onLogout}>
                <Text style={styles.textForm}>{item.name}</Text>
              </TouchableOpacity>
            );
          } else if (item.id === 1) {
            // 닉네임 설정 항목
            return (
              <TouchableOpacity
                style={styles.itemContainer}
                onPress={() => navigation.navigate('NicknameSetting')}>
                <Text style={styles.textForm}>{item.name}</Text>
              </TouchableOpacity>
            );
          }
          return null;
        }}
        keyExtractor={item => item.id.toString()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  textForm: {
    borderWidth: 1,
    borderColor: '#3498db',
    padding: 20,
    width: '100%',
    fontSize: 18,
    textAlign: 'center',
    color: '#3498db',
    marginBottom: 2,
  },
});

export default Main_Setting;
