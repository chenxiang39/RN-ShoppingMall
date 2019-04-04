import React, {Component} from 'react';
import {StyleSheet,View,Text} from 'react-native';
export default class CommonHeader extends Component {
    constructor(props){
        super(props)
    }
    render(){
        return (
        <View style = {styles.titleContainer}>
            <Text style = {styles.titleText}>{this.props.Title}</Text>
        </View>
        )
    }
}


const styles = StyleSheet.create({
    titleContainer:{
        alignItems:'center',
        justifyContent:'center',
        height:deviceHeight/10,
        backgroundColor:"#FF8C00",
        paddingTop:24,
        paddingLeft : 26,
        paddingRight : 26,
    },
    titleText:{
        fontSize: 20,
        color:'white', 
    }
})

