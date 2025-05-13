import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import Fontisto from "@expo/vector-icons/Fontisto";
import { theme } from "./colors";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AntDesign from '@expo/vector-icons/AntDesign';

const STORAGE_KEY = "@todos";
const WORKING_KEY = "@working"

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [todos, setTodos] = useState({});
  const [editKey, setEditKey] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    loadTodos();
    loadWorkingState();
  }, []);

  useEffect(()=> {
    saveWorkingState(working);
  },[])

  const travel = () => setWorking(false);
  const work = () => setWorking(true);
  const onChangeText = (payload) => setText(payload);
  const saveTodos = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  };
  const saveWorkingState = async (state) => {
    await AsyncStorage.setItem(WORKING_KEY, JSON.stringify(state));
  }
  const loadWorkingState = async () => {
    const state = await AsyncStorage.getItem(WORKING_KEY);
    if(state !== null){
      setWorking(JSON.parse(state))
    }
  }
  const loadTodos = async () => {
    const s = await AsyncStorage.getItem(STORAGE_KEY);
    if (s) {
      setTodos(JSON.parse(s));
    }
  };

  const addTodo = async () => {
    if (text === "") {
      return;
    }
    const newTodos = { ...todos, [Date.now()]: { text, working } };
    setTodos(newTodos);
    await saveTodos(newTodos);
    setText("");
  };
  const deleteTodo = (key) => {
    Alert.alert("할 일 삭제", "삭제하시겠습니까?", [
      { text: "취소" },
      {
        text: "확인",
        style: "destructive",
        onPress: () => {
          const newTodos = { ...todos };
          delete newTodos[key];
          setTodos(newTodos);
          saveTodos(newTodos);
        },
      },
    ]);
  };
  const toggleComplete = (key) => {  //완료 상태 추가 및 toggle
    const newTodos = {...todos};
    newTodos[key].completed = !newTodos[key].completed;
    setTodos(newTodos);
    saveTodos(newTodos);
  }

  const startEdit = (key, currentText) => {
    setEditKey(key);
    setEditText(currentText);
  }
  const saveEdit = (key) => {
    const newTodos = {...todos};
    newTodos[key].text = editText;
    setTodos(newTodos);
    saveTodos(newTodos);
    setEditKey(null);
  }
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{ ...styles.btnText, color: working ? "white" : theme.grey }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? "white" : theme.grey,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <View>
        <TextInput
          onSubmitEditing={addTodo}
          onChangeText={onChangeText}
          returnKeyType="done"
          value={text}
          placeholder={working ? "할 일 추가" : "어디로 가고싶니 ?"}
          style={styles.input}
        />
      </View>
      <ScrollView>
       {Object.keys(todos).map((key) =>
  todos[key].working === working ? (
    <View style={styles.todo} key={key}>
      {editKey === key ? (
        <TextInput
          style={styles.editInput}
          value={editText}
          onChangeText={setEditText}
          onSubmitEditing={() => saveEdit(key)}
        />
      ) : (
        <TouchableOpacity onPress={() => toggleComplete(key)} style={{ flex: 1 }}>
          <Text
            style={[
              styles.todoText,
              todos[key].completed ? { textDecorationLine: "line-through", color: "#aaa" } : {},
            ]}
          >
            {todos[key].text}
          </Text>
        </TouchableOpacity>
      )}
      <View style={{ flexDirection: "row", gap: 10 }}>
        {editKey !== key && (
          <TouchableOpacity onPress={() => startEdit(key, todos[key].text)}>
            <AntDesign name="edit" size={18} color="blue" />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => deleteTodo(key)}>
          <Fontisto name="trash" size={18} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  ) : null
)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    fontSize: 18,
    marginVertical: 20,
  },
  todo: {
    backgroundColor: theme.grey,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  todoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  editInput: {
  flex: 1,
  backgroundColor: "white",
  paddingHorizontal: 10,
  borderRadius: 10,
  fontSize: 16,
},
});
