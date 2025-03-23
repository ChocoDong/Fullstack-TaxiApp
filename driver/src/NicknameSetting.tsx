import React, {useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

type RootStackParamList = {
  Main_Setting: undefined;
  NicknameSetting: {
    currentNickname: string;
    onSave: (nickname: string) => void;
  };
};

function NicknameSetting(): React.JSX.Element {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const {currentNickname, onSave} = route.params as {
    currentNickname: string;
    onSave: (nickname: string) => void;
  };

  const [nickname, setNicknameLocal] = useState(currentNickname);

  const handleSaveNickname = () => {
    if (nickname.trim() !== '') {
      onSave(nickname);
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <TextInput
          style={styles.input}
          value={nickname}
          onChangeText={setNicknameLocal}
          placeholder="닉네임을 입력하세요"
        />
        <TouchableOpacity style={styles.button} onPress={handleSaveNickname}>
          <Text style={styles.buttonText}>저장</Text>
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
  input: {
    width: '70%',
    height: 40,
    borderWidth: 1,
    borderColor: 'gray',
    marginVertical: 10,
    padding: 10,
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
});

export default NicknameSetting;
