import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity,TextInput,ScrollView, Alert } from 'react-native';
import { theme } from './color';
import { useState,useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { EvilIcons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';

const STORAGE_KEY = "@toDos";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  const [endTab,setEndTab] = useState("");
  const [render,setRender] = useState(false);
  const [changeText,setChangeText] = useState("");

  const travel = ()=>{
    setWorking(false);
    rememberTab("travel")
  }
  const work = ()=>{
    setWorking(true);
    rememberTab("work");
  };
  
  const onCorChangeText = (payload)=>setChangeText(payload);
  const onChangeText = (payload)=>setText(payload);
  const addTodo = async()=>{
    if(text === ""){
      return
    }
    //Todo 저장
    const newToDos = {
      ...toDos,
      [Date.now()]:{text, work:working, done:"no", corState:false},
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  }
  const rememberTab = async(tab)=>{
    try{
      await AsyncStorage.setItem("tab",tab);
    }catch(e){
      console.log(e);
    }
  }
  const getTab = async() =>{
    const t = await AsyncStorage.getItem("tab");
    setEndTab(t);
  }

  const saveToDos = async(toSave)=>{
    try{
      const jsonValue = JSON.stringify(toSave);
      await AsyncStorage.setItem(STORAGE_KEY,jsonValue);
    }catch(e){
      console.log(e);
    }
  }

  const loadToDos = async()=>{
    const s = await AsyncStorage.getItem(STORAGE_KEY);
    if(s){
      setToDos(JSON.parse(s));
    }
  }

  const deleteToDo = async (key)=>{
    Alert.alert("Delete To Do?", "Are you sure?",[
      {text:"Cancel"},
      {text:"Okay", onPress : async()=>{
        const newToDos = {...toDos};
        delete newToDos[key];
        setToDos(newToDos);
        await saveToDos(newToDos);
      }}
    ]);
    
  };

  const checkToDos = async(key)=>{
    const newToDos = {...toDos};
    
    if(newToDos[key].done === "yes"){
      newToDos[key].done = "no";
    }else{
      newToDos[key].done = "yes";
    }
    setToDos(newToDos);
    await saveToDos(newToDos);
  }

  const clickPen = async(key)=>{
    const newToDos = {...toDos};
    newToDos[key].corState = true;
    setRender(!render);
  }
  const clickCk = async(key)=>{
    const newToDos = {...toDos};
    newToDos[key].corState = false;
    setRender(!render);
  }
  const changeTodo = async(key)=>{
    const newToDos = {...toDos};
    newToDos[key].text = changeText;
    newToDos[key].corState = false;

    setToDos(newToDos);
    await saveToDos(newToDos);
  }

  useEffect(()=>{
    loadToDos();
    getTab();
  },[])

  useEffect(()=>{
    if(endTab === "travel"){
      travel();
    }else{
      work();
    }
  },[endTab])

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity>
          <Text style={{...styles.btnText, color:working ? "white" : theme.grey}} onPress={work}>Work</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={{...styles.btnText, color:working ? theme.grey : "white"}} onPress={travel}>Travel</Text>
          </TouchableOpacity>
      </View>
      <TextInput 
      placeholder={working ? "Add a To Do" : "Where do you want a go?"} 
      style={styles.input} 
      onChangeText={onChangeText} 
      value={text}
      onSubmitEditing={addTodo}
      />

      <ScrollView>
        {Object.keys(toDos).map(key=> (
          toDos[key].work===working ? 
          <View key={key} style={styles.toDo}>
            {
              toDos[key].corState ? 
              <TextInput
              style={{backgroundColor:"white",
              paddingHorizontal:70,
              borderRadius:10}}
              onChangeText={onCorChangeText}
              onSubmitEditing={()=>changeTodo(key)}
              />
              : 
              <Text style={{...styles.toDoText, textDecorationLine:toDos[key].done === "yes" ? "line-through" : "none" , color:toDos[key].done === "yes" ? theme.ckBox:"white"}}>{toDos[key].text}</Text>
            }
            <View style={{flexDirection:"row"}}>
              {
                toDos[key].corState ?
                <TouchableOpacity onPress={()=>clickCk(key)}>
                  <AntDesign name="back" size={24} color="white" />
                </TouchableOpacity>
                 :
                <TouchableOpacity onPress={()=>clickPen(key)}>
                  <EvilIcons name="pencil" size={24} color={toDos[key].done === "yes" ? theme.ckBox:"white"} />
                </TouchableOpacity>
              }
              {toDos[key].done === "no" ? 
              <TouchableOpacity onPress={()=>checkToDos(key)}>
                <Ionicons name="checkbox-outline" size={24} color="white" style={{marginHorizontal:10}}/>
              </TouchableOpacity>:
              <TouchableOpacity onPress={()=>checkToDos(key)}>
                <Ionicons name="checkbox-outline" size={24} color={theme.ckBox} style={{marginHorizontal:10}}/>
              </TouchableOpacity>
              }
              <TouchableOpacity onPress={()=> deleteToDo(key)} >
                <Text><FontAwesome name="trash-o" size={24} color="white" /></Text>
              </TouchableOpacity>
            </View>
          </View> : null
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal:20
  },
  header:{
    flexDirection:"row",
    marginTop:100,
    justifyContent:"space-between"
  },
  btnText:{
    color:"white",
    fontSize:38,
    fontWeight:"600",
  },
  input:{
    backgroundColor:"white",
    paddingVertical:15,
    paddingHorizontal:20,
    borderRadius:30,
    marginVertical:20,
    fontSize:18,
  },
  toDo:{
    backgroundColor:theme.grey,
    marginBottom:20,
    paddingVertical:20,
    paddingHorizontal:20,
    borderRadius:15,
    flexDirection:'row',
    alignItems:'center',
    justifyContent:"space-between",
  },
  toDoText:{
    color:"white",
    fontSize:16,
    fontWeight:"500",
  }
});
