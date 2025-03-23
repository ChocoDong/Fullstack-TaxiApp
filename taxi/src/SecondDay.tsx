import React, {useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

type RootStackParamList = {
  Main_Setting: undefined;
  NicknameSetting: {
    currentNickname: string;
    onSave: (nickname: string) => void;
  };
};

function Main_Setting(): React.JSX.Element {
  console.log('Main_Setting()');

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [nickname, setNickname] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text style={styles.nicknameText}>닉네임: {nickname}</Text>

        <TouchableOpacity
          style={[styles.button, {marginTop: 20}]}
          onPress={() =>
            navigation.navigate('NicknameSetting', {
              currentNickname: nickname,
              onSave: setNickname,
            })
          }>
          <Text style={styles.buttonText}>닉네임 설정</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  button: {
    width: '70%',
    backgroundColor: 'beige',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 9,
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
    textAlign: 'center',
  },
  nicknameText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default Main_Setting;
