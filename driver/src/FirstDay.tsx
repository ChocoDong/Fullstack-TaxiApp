import React, {useState} from 'react';
import {SafeAreaView, StyleSheet, Text, Button, FlatList} from 'react-native';

function First(): React.JSX.Element {
  const [items, setItems] = useState<string[]>([]);

  const addItem = () => {
    const newItem = `아이템 ${items.length + 1}`;
    setItems([...items, newItem]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Button title={'데이터 추가'} onPress={addItem} />

      <FlatList
        data={items}
        renderItem={({item}) => <Text style={styles.item}>{item}</Text>}
        keyExtractor={(item, index) => index.toString()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  item: {
    fontSize: 18,
    color: 'black',
    backgroundColor: 'beige',
    padding: 10,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'lightblue',
    marginVertical: 4,
  },
});

export default First;
