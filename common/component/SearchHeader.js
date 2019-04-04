import React, {Component} from 'react';
import {StyleSheet,Image,View ,TextInput,TouchableOpacity} from 'react-native';
import {withNavigation} from 'react-navigation';
import {Dimensions} from 'react-native';
global.deviceWidth = Dimensions.get('window').width
global.deviceHeight = Dimensions.get('window').height
class SearchHeader extends Component {
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
            userInfo:this.props.userInfo
        })
    }
    render(){
        return (
        <View style = {styles.titleContainer}>
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
        </View>
        )
    }
}

export default withNavigation(SearchHeader); 

const styles = StyleSheet.create({
    titleContainer:{
        flexDirection:"row",
        justifyContent:"center",
        alignItems : 'center',
        height:deviceHeight/10,
        backgroundColor:"#FF8C00",
        paddingTop:deviceHeight/40,
    },
    searchContainer:{
        flexDirection:'row',
        justifyContent: 'flex-start',
        alignItems:'center',
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




