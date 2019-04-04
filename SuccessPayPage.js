import React, {Component} from 'react';
import CommonStackHeader from './common/component/CommonStackHeader'
import {FlatList,ScrollView,SectionList,StyleSheet,Image, Text, View ,TextInput , Button,TouchableOpacity} from 'react-native';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons'
import {Dimensions} from 'react-native';
global.deviceWidth = Dimensions.get('window').width
global.deviceHeight = Dimensions.get('window').height
export default class SuccessPayPage extends Component{
    constructor(props){
        super(props)
        this.state = {
            userInfo:-1,  //用户信息   
        }
    }

    static navigationOptions =  ({ navigation, state })=>({
        title: null,
        header: null,
    });

    componentWillMount(){
        const {navigation} = this.props
        this.setState({
            userInfo : navigation.getParam('userInfo'),
        })  
    }

    componentWillUnmount(){
        this.setState({
            userInfo : -1,
        })  
    }
    _onMyOrderListPress(){
        //点击我的信息按钮触发的功能
        const {navigation} = this.props
        navigation.navigate("UserInfoPage",{
            userInfo:this.state.userInfo
        })
    }
    _onBackToShowPagePress(){
        //点击回到首页按钮触发的功能
        const {navigation} = this.props
        navigation.navigate("ShowPage",{
            userInfo:this.state.userInfo
        })
    }
    render(){
        const {navigation} = this.props
        return(
            <View style = {styles.SuccessPayPageContainer}>
                <CommonStackHeader Title = "支付详情" navigation ={navigation} PopAmount = {2}></CommonStackHeader>
                <View style = {styles.SuccessItemContainer}>
                    <View style = {styles.SuccessItemTitleAndIconContainer}>
                        <SimpleLineIcons
                            name = 'check'
                            size = {50}
                            color = '#FF8C00'
                        ></SimpleLineIcons>
                        <View style = {styles.SuccessItemTitleContainer}>
                            <Text style = {styles.SuccessItemTitleText}>支付成功!</Text>  
                        </View>    
                    </View>
                    <View style = {styles.SuccessItemAllBtnContainer}>
                        <View style = {styles.SuccessItemBtnContainer}>
                            <TouchableOpacity
                                // activeOpacity = {1}
                                style = {styles.SuccessItemBtn}
                                onPress = {this._onMyOrderListPress.bind(this)}
                            >
                                <Text style = {styles.SuccessItemBtnText}>我的信息</Text>
                            </TouchableOpacity>
                        </View>   
                        <View style = {styles.SuccessItemBtnContainer}>
                            <TouchableOpacity
                                // activeOpacity = {1}
                                style = {styles.SuccessItemBtn}
                                onPress = {this._onBackToShowPagePress.bind(this)}
                            >
                                <Text style = {styles.SuccessItemBtnText}>回到首页</Text>
                            </TouchableOpacity>
                        </View> 
                    </View>
                </View>
            </View>
        )
    }
    
}

const styles = StyleSheet.create({
    SuccessPayPageContainer:{
        flex:1,
        flexDirection:'column',
    },
    SuccessItemContainer:{
        height:(deviceHeight)-(deviceHeight)/10,
        flexDirection:'column',
        paddingLeft:30,
        paddingRight:30,
    },
    SuccessItemTitleAndIconContainer:{
        flex:1,
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
    },
    SuccessItemTitleContainer:{
        width:120,
        justifyContent:'center',
        alignItems:'center',
        marginLeft:5,
    },
    SuccessItemTitleText:{
        fontSize:25,
        color:'#FF8C00'
    },
    SuccessItemAllBtnContainer:{
        flex:2,
        flexDirection:'row'
    },
    SuccessItemBtnContainer:{
        flex:1,
        justifyContent:'flex-start',
        alignItems:'center'  
    },
    SuccessItemBtn:{
        width:100,
        height:40,
        justifyContent:"center",
        alignItems:"center",
        borderColor:"#FF8C00",
        borderWidth:1,
        borderRadius:20
    },
    SuccessItemBtnText:{
        fontSize:16,
        color:'#FF8C00'
    }
})