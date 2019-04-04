import React, {Component} from 'react';
import {FlatList,ScrollView,SectionList,StyleSheet,Image, Text, View ,TextInput , Button,TouchableOpacity} from 'react-native';
import UserDataModel from './viewModel/UserDataModel'
import CommonHeader from './common/component/CommonHeader'
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import {Dimensions} from 'react-native';
global.deviceWidth = Dimensions.get('window').width
global.deviceHeight = Dimensions.get('window').height
export default class ShowGoodsPage extends Component{
    constructor(props){
      super(props);
      this.state = {
        userInfo:[],
      }
    }
    //导航栏样式的配置（此处只配置底部导航栏）
    static navigationOptions = {
        tabBarLabel: '我的',
        tabBarIcon: ({focused}) => {
            if(focused){
                return (
                    <Feather
                        name = 'user'
                        size = {26}
                        color = '#FF8C00'
                    >
                    </Feather>
                );
            }
            else{
                return (
                    <Feather
                        name = 'user'
                        size = {26}
                        color = 'black'
                    >
                    </Feather>
                );
            }      
        },
    };
    componentWillMount(){
        const {navigation} = this.props
        this.setState({
            userInfo : navigation.getParam('userInfo')
        })  
    }
    
    _onFucntionMyOrderListBtn(){
        //点击"我的订单"触发的功能
        const {navigation} = this.props
        navigation.navigate(
            "MyOrderListPage",{
                userInfo:this.state.userInfo
            }
        )
    }
    _onFucntionAddressBtn(){
        //点击"收货地址"按钮触发的功能
        const {navigation} = this.props
        navigation.navigate('AddressPage',{
            userInfo : this.state.userInfo,
            enablePress : 'false'
        })
    }
    render(){      
        return(
            <View style={styles.CartPageContainer}>
                <CommonHeader Title = "我的"></CommonHeader>
                <View style={styles.titleContainer}>
                    <View style = {styles.titleShowUserContainer}>
                        <View style = {styles.titleShowUserPicContainer}>
                            <FontAwesome
                                name = 'user'
                                size = {60}
                                color = '#FF8C00'
                            >
                            </FontAwesome>
                        </View>
                        <View style = {styles.titleShowUserTextContainer}>
                            <View style = {styles.titleShowUserNameTextContainer}>
                                <Text style = {styles.titleShowUserNameText}>{this.state.userInfo.u_name}</Text>
                            </View>
                            <View style = {styles.titleShowUserIDTextContainer}>
                                <Text style = {styles.titleShowUserIDText}>ID:{this.state.userInfo.u_id}</Text>
                            </View>
                        </View>
                    </View>
                </View>
                <View style = {styles.functionContainer}>
                    <TouchableOpacity 
                        style = {styles.functionBtnContainer}
                        activeOpacity = {1}
                        onPress = {()=>this._onFucntionMyOrderListBtn()}>
                        <View style = {styles.functionWindowContainer}>
                            <View style = {styles.funWindowPicContainer}>
                                <SimpleLineIcons
                                    name = 'list'
                                    size = {40}
                                    color = '#87CEFA'
                                >
                                </SimpleLineIcons>
                            </View>
                            <View style = {styles.funWindowTextContainer}>
                                <Text style = {styles.funWindowText}>我的订单</Text>
                            </View>
                        </View>                         
                    </TouchableOpacity> 
                    <TouchableOpacity 
                        style = {styles.functionBtnContainer}
                        activeOpacity = {1}
                        onPress = {()=>this._onFucntionAddressBtn()}>
                        <View style = {styles.functionWindowContainer}>
                            <View style = {styles.funWindowPicContainer}>
                                <SimpleLineIcons
                                    name = 'location-pin'
                                    size = {40}
                                    color = '#EE3B3B'
                                >
                                </SimpleLineIcons>
                            </View>
                            <View style = {styles.funWindowTextContainer}>
                                <Text style = {styles.funWindowText}>收货地址</Text>
                            </View>
                        </View>                         
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    CartPageContainer:{
        flex:1,
    },
    titleContainer:{
        height:(deviceHeight)/5,
        flexDirection:'column',
        backgroundColor:"#EDEDED",
        justifyContent:"center",
        borderBottomColor: '#B8B8B8',
        borderBottomWidth: 0.5,
    },
    titleShowUserContainer:{
        height:80,
        paddingLeft:(deviceWidth)/18,  
        flexDirection:'row',
        alignItems:'center',
    },
    titleShowUserPicContainer:{
        height:80,
        width:80,
        borderRadius:80,
        backgroundColor:"white",
        justifyContent:'center',
        alignItems:'center',
    },
    titleShowUserTextContainer:{
        flex:1,
        flexDirection:"column",
        paddingLeft: 10,
    },
    titleShowUserNameTextContainer:{
        flex:1,
        justifyContent:'center'
    },
    titleShowUserNameText:{
        fontSize:28,
        color:'#858585'
    },
    titleShowUserIDTextContainer:{
        flex:1,
        justifyContent:'center'
    },
    titleShowUserIDText:{
        fontSize:16,
        color:'#858585'
    },
    functionContainer:{
        flex:1,
        flexDirection:'row',
        flexWrap:'wrap'
    },
    functionBtnContainer:{
        width:(deviceWidth)/3,
        height:(deviceWidth)/3,
    },
    functionWindowContainer:{
        width:(deviceWidth)/3,
        height:(deviceWidth)/3,
        borderRightColor: '#B8B8B8',
        borderRightWidth: 0.5,
        borderBottomColor: '#B8B8B8',
        borderBottomWidth: 0.5,
        padding:18,
        flexDirection:'column'
    },
    funWindowPicContainer:{
        flex:3,
        justifyContent:'center',
        alignItems:'center'
    },
    funWindowTextContainer:{
        flex:1,
        justifyContent:'center',
        alignItems:'center'
    },
    funWindowText:{
        fontSize:16,
        color:'#8B8682'
    }
})
