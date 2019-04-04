import React, {Component} from 'react';
import {StyleSheet,Text,Image,View ,TextInput,TouchableOpacity} from 'react-native';
import {Dimensions} from 'react-native';
global.deviceWidth = Dimensions.get('window').width
export default class LoadingPage extends Component {
    render(){
        return (
        <View style = {styles.LoadingPageContainer}>
            <Text style = {{fontSize:40}}>loading...</Text>
        </View>
        )
    }
}


const styles = StyleSheet.create({
   LoadingPageContainer:{
       flexDirection:'row',
       justifyContent:'center',
       alignItems:'center',
       flex:1,
   }
})