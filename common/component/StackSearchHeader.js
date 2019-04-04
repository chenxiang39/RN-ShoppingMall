import React, {Component} from 'react';
import {StyleSheet,Image,View ,TextInput,TouchableOpacity} from 'react-native';
import { withNavigation} from 'react-navigation';
import {Dimensions} from 'react-native';
global.deviceWidth = Dimensions.get('window').width
global.deviceHeight = Dimensions.get('window').height
class StackSearchHeader extends Component {
    constructor(props){
        super(props)
        this.state = {
            searchContent : ""
        }
    }
    _onSearchPress(){
        this.refs["searchInput"].clear()
        this.props.navigation.navigate('ShowGoodsListPage',{
            searchContent:this.state.searchContent,
            showCommand:"searchGoodsByStringFromOtherPage",
        })
    }
    render(){
        return (
            <View style = {styles.searchContainer}>
                <TouchableOpacity 
                    // activeOpacity = {0.2}
                    onPress = {()=>this._onSearchPress()}>
                    <Image
                        style={styles.searchBtnIcon}
                        source={require('../../images/SearchBtn_icon.png')}
                    />
                </TouchableOpacity>
                <TextInput ref="searchInput" style = {styles.searchInput} 
                    placeholder = '请输入要搜索的内容'
                    clearButtonMode = 'while-editing'
                    fontSize = {18}  
                    onChangeText={(text) => {
                        this.setState({
                            searchContent:text
                        })
                    }}               
                />
            </View>
        )
    }
}

export default withNavigation(StackSearchHeader); 

const styles = StyleSheet.create({
    searchContainer:{
        flexDirection:'row',
        alignItems:'center',
        marginLeft:deviceWidth/28,
        height:35,
        backgroundColor:"white",
        borderRadius:25,
        paddingLeft : 20,
    },
    searchBtnIcon:{
        height:26,
        width :26,
    },
    searchInput:{
        marginLeft:6,
        height:(deviceHeight)/11,
        width:deviceWidth - 4*26 -10,
    },
})




