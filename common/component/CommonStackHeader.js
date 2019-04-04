import React, {Component} from 'react';
import {StyleSheet,View,Text,TouchableOpacity} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
export default class CommonStackHeader extends Component {
    constructor(props){
        super(props)
    }
    render(){
        return (
        <View style = {styles.titleContainer}>
            <View style = {styles.titleStackBtnContainer}>
                <TouchableOpacity 
                    // activeOpacity = {0.2}
                    onPress = {()=>{
                        if(this.props.PopAmount  == undefined){
                            this.props.navigation.goBack()
                        }
                        else{
                            this.props.navigation.pop(this.props.PopAmount)
                        } 
                    }}>
                    <AntDesign
                        name={'left'}
                        size={26}
                        color="white"
                    />
                </TouchableOpacity>
            </View>
            <View style = {styles.titleTextContainer}>
                <Text style = {styles.titleText}>{this.props.Title}</Text>
            </View>
        </View>
        )
    }
}


const styles = StyleSheet.create({
    titleContainer:{
        flexDirection:"row",
        alignItems : 'center',
        height:deviceHeight/10,
        backgroundColor:"#FF8C00",
        paddingTop:deviceHeight/40,
        paddingLeft:deviceWidth/40,
    },
    titleStackBtnContainer:{
        flex:1,
        justifyContent:'center',
    },
    titleTextContainer:{
        flex:10,
        justifyContent:'center',
        alignItems:'center',
        paddingRight:((deviceWidth/40)+((deviceWidth-(deviceWidth/40))/11))
    },
    titleText:{
        fontSize: 20,
        color:'white',
    }
})