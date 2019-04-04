import React, {Component} from 'react';
import {FlatList,ScrollView,Animated,SectionList,StyleSheet,Image, Text, View ,TextInput , Button,TouchableOpacity} from 'react-native';
import UserDataModel from './viewModel/UserDataModel'
import UserService from './service/UserService'
import apiHelper from './common/apiHelper'
import CommonStackHeader from './common/component/CommonStackHeader'
import AntDesign from 'react-native-vector-icons/AntDesign';
import LoadingPage from './common/component/LoadingPage'
import {Dimensions} from 'react-native';
global.deviceWidth = Dimensions.get('window').width
global.deviceHeight = Dimensions.get('window').height
global.needEditAddress = ""         //存放需要编辑的地址
export default class AddressPage extends Component{
    constructor(props){
        super(props);
        this.state = {
            userInfo:[],  //用户信息
            Is_LoadingFinsh:false,  //页面是否已经加载完数据
            addressList:-1, //用户地址信息
            enablePress:'true', //地址块按钮是否生效
            editAddressPageRight : new Animated.Value(-(deviceWidth)),   //编辑地址的遮罩层，默认不显示
            editCommand: "" , //编辑的指令（是加地址还是编辑地址）(默认选择编辑地址)
            editAddress : "",   //编辑的地址
            editTelephone: ""   //编辑的电话号码
        }
    }

    static navigationOptions =  ({ navigation, state })=>({
        title: null,
        header: null,
    });
    
    async componentWillMount(){
        const {navigation} = this.props
        await this.setState({
            userInfo : navigation.getParam('userInfo'),
            enablePress : navigation.getParam('enablePress')
        })  
        Username = this.state.userInfo.u_name
    }
    
    //进入页面要做的所有方法全部放在里面
    async freshPageFunction(){
        this.setState({                    //刚开始loading
            Is_LoadingFinsh:false
        })
        await this.fetchAddressListByUsername(this.state.userInfo.u_name)
        if(this.state.addressList != -1){
            this.setState({
                Is_LoadingFinsh:true    //加载完成
            }) 
        }
    } 

    //离开页面要做的事全部放这里
    cleanFunction(){
        this.setState({
            enablePress : 'false',  
            addressList : []
        })
    }

    componentDidMount(){
        this.freshPageFunction()
    }
    componentWillUnmount(){
        this.cleanFunction()
    }
    //根据输入的用户名向API请求用户的收货地址信息并赋值给this.state.addressList
    async fetchAddressListByUsername(Username){
        let UsernameData = {
            'u_name':Username
        }
        await UserService.loadUserAddressListByUsername(UsernameData)
        let API = apiHelper.getAPI()
        if(API.status == 200){
            this.setState({
                addressList: UserDataModel.addUser(API.reuslt.User).addressList
            })
        }
        else if(API.status == 404){
            //跳转错误页面
            alert(API.reuslt.msg)
        }
        else if(API.status == 500){
            //跳转错误页面
            alert(API.reuslt.msg)
        } 
    }

    //flatList的渲染
    _addressFlatListRenderItem = (Info) => {
        return(
            <View style={styles.addressFlatListItemContainer}>
                <TouchableOpacity 
                    activeOpacity = {1}
                    style = {{flex:5,flexDirection:'column'}}
                    onPress = {this.state.enablePress == 'true'?this._useAddressButton.bind(this,this.state.addressList[Info.item.Index].a_name):()=>{}}>
                    <View style = {styles.flatListItemTitleContainer}>
                        <View style = {styles.flatListItemTitleUsernameContainer}>
                            <Text style = {styles.flatListItemTitleUsername}>{this.state.userInfo.u_name}</Text>
                        </View>
                        <View style = {styles.flatListItemTitlePhoneContainer}>
                            <Text style = {styles.flatListItemTitlePhone}>{this.state.addressList[Info.item.Index].a_tel}</Text>
                        </View>
                    </View>
                    <View style = {styles.flatListItemAddressContainer}>
                        <Text style = {styles.flatListItemAddress}>{this.state.addressList[Info.item.Index].a_name}{this.state.addressList[Info.item.Index].a_IsDefault == true?"  ( 默认地址 )":""}</Text>
                    </View>
                </TouchableOpacity> 
                <TouchableOpacity 
                    activeOpacity = {1}
                    style = {styles.addressFlatListItemEditBtnContainer}
                    onPress = {()=>this._editAddress(Info.item.key.a_name)}>
                        <View style = {{width:0.5,height:40,backgroundColor:'#cccccc'}}></View>
                        <View style = {{flex:1,justifyContent:'center',alignItems:'center'}}>
                            <Text style = {styles.addressFlatListItemEditBtn}>编辑</Text>
                        </View>
                </TouchableOpacity>       
            </View>
        )
    }

    //遮罩层的渲染
    _editPageRender(command){
        let title = ''
        let btnText = ''
        btnFunction = ()=>{}
        if(command == 'add'){
            title = '添加地址'
            btnText = '确认添加'
            btnFunction = this._addNewAddressButton.bind(this)
        }
        if(command == 'edit'){
            title = '变更地址'
            btnText = '确认变更'
            btnFunction = this._changeAddressButton.bind(this)
        }
        return(
            <Animated.View style = {[styles.animatedViewContainer,{right:this.state.editAddressPageRight}]}>
                <View style = {styles.cutLine}></View>
                <View style={{paddingRight:(deviceWidth)/18,flex:1,flexDirection:"row"}}>
                    <View style = {{flex:1}}></View>
                    <View style = {{flex:1,justifyContent:'center',alignItems:'center'}}>
                        <Text style={{fontSize:20,color:"black"}}>{title}</Text>
                    </View>
                    <View style = {{flex:1,justifyContent:'center',alignItems:'flex-end'}}>
                        <TouchableOpacity 
                            // activeOpacity = {0.2}
                            onPress = {()=>this._closeEditPagePress()}>
                            <AntDesign
                                name={'close'}
                                size={26}
                                color="#707070"
                            />    
                        </TouchableOpacity>  
                    </View>  
                </View>
                <View style = {styles.cutLine}></View>
                <View style = {styles.editPageContainer}>
                    <View style = {styles.editPageItemContainer}>
                        <View style = {styles.editPageItem}>
                            <TextInput ref="AddressInput" style = {styles.Input} 
                                placeholder="请输入新地址"
                                clearButtonMode = "while-editing"
                                onChangeText={(text) => {
                                this.setState({
                                    editAddress:text
                                })
                            }}
                            />
                        </View>
                        <View style = {styles.editPageItem}>
                            <TextInput ref="PhoneInput" style = {styles.Input} 
                                placeholder="请输入电话号码"
                                clearButtonMode = "while-editing"
                                onChangeText={(text) => {
                                this.setState({
                                    editTelephone:text
                                })
                            }}
                            />
                        </View>
                        <TouchableOpacity 
                            opacity = {0.2} 
                            onPress={
                                btnFunction
                            }
                        >
                            <View style = {[styles.TransparentEditBtnContainer,this.HandleBtnStyle()]}>
                                <Text style = {{fontSize:16,color:'white'}}>{btnText}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View> 
            </Animated.View>
        )
    }
    
    //根据输入的内容处理按钮样式
    HandleBtnStyle(){
        if(this.state.editAddress != ""&&this.state.editTelephone != ""){
          this.btnStyleFlag = true
        }else{
          this.btnStyleFlag = false
        }
        return this.btnStyleFlag ? styles.EditBtnContainer : ''
    }
    async _editAddress(address){
        //按编辑触发的按钮
        await this.setState({
            editCommand:'edit'
        })
        needEditAddress = address
        Animated.timing(                  // 随时间变化而执行动画
            this.state.editAddressPageRight,            // 动画中的变量值
            {
              toValue: 0,                  
              duration: 300,              // 让动画持续一段时间
            }
        ).start();  
    }
    
    async _addNewAddressPress(){
        //点击添加地址按钮(最底部)触发的功能
        await this.setState({
            editCommand:'add'
        })
        Animated.timing(                  // 随时间变化而执行动画
            this.state.editAddressPageRight,            // 动画中的变量值
            {
              toValue: 0,                  
              duration: 300,              // 让动画持续一段时间
            }
        ).start(); 
    }
    _closeEditPagePress(){
        //关闭遮罩层的按钮
        this.refs["AddressInput"].clear()
        this.refs["PhoneInput"].clear()
        Animated.timing(                  
            this.state.editAddressPageRight,            
            {
              toValue: -(deviceWidth),                   
              duration: 300,              
            }
        ).start();
    }
    async _changeAddressButton(){
        //按下变更地址按钮(遮罩层中)触发的功能
        if(this.state.editAddress != ""&&this.state.editTelephone != ""){
            let addressData = {
                'u_name':this.state.userInfo.u_name,
                'a_name':needEditAddress,
                'a_exchange':this.state.editAddress,
                't_exchange':this.state.editTelephone
            }
            await UserService.changeAddress(addressData)
            let API = apiHelper.getAPI()       //获得API的返回值（包含status,msg,result）
            if(API.status == 200){
                if (API.result_kind == "SUCCESS"){        
                    await this.freshPageFunction()      //刷新页面
                    this._closeEditPagePress()
                } 
                if (API.result_kind == "WARNING"){        //数据库中已有重复的地址
                  alert(API.reuslt.msg)
                } 
            }else if(API.status == 404){
               alert(API.reuslt.msg)
               //跳转错误页面
            }else if(API.status == 500){
              alert(API.reuslt.msg)
               //跳转错误页面
            }
        }
        else{
            alert('请填写完整的信息！')
        }
    }
    
    async _addNewAddressButton(){
        //按下添加地址按钮(遮罩层中)触发的功能
        if(this.state.editAddress != ""&&this.state.editTelephone != ""){
            let addressData = {
                'u_name':this.state.userInfo.u_name,
                'a_name':this.state.editAddress,
                'tellphone':this.state.editTelephone
            }
            await UserService.addNewAddress(addressData)
            let API = apiHelper.getAPI()       //获得API的返回值（包含status,msg,result）
            if(API.status == 200){
                if (API.result_kind == "SUCCESS"){        
                    this.setState({                     //成功添加地址
                        editAddress : "",
                        editTelephone : ""
                    })
                    await this.freshPageFunction()      //刷新页面
                    this._closeEditPagePress()
                } 
                if (API.result_kind == "WARNING"){        //数据库中已有重复的地址
                  alert(API.reuslt.msg)
                } 
            }else if(API.status == 404){
               alert(API.reuslt.msg)
               //跳转错误页面
            }else if(API.status == 500){
              alert(API.reuslt.msg)
               //跳转错误页面
            }
        }
        else{
            alert('请填写完整的信息！')
        }
    }
    async _useAddressButton(address){
        //点击地址按钮触发的事件（只有从订单页面跳转过来才能点击）
        let addressData = {
            'u_name':this.state.userInfo.u_name,
            'a_name':address
        }
        await UserService.changeDefaultAddress(addressData)
        let API = apiHelper.getAPI()       //获得API的返回值（包含status,msg,result）
        if(API.status == 200){
            if (API.result_kind == "SUCCESS"){        
               const {navigation} = this.props
               navigation.goBack()
            } 
        }else if(API.status == 404){
           alert(API.reuslt.msg)
           //跳转错误页面
        }else if(API.status == 500){
          alert(API.reuslt.msg)
           //跳转错误页面
        }
        
    }
    render(){ 
        if(!this.state.Is_LoadingFinsh){
            return (
                <LoadingPage></LoadingPage>
            )
        }
        else{
            const {navigation} = this.props
            let addressListData = this.state.addressList.map((item,index)=>{
                let newAddress = {}
                newAddress.key = item
                newAddress.Index = index
                return newAddress
            })
            return(
                <View style = {styles.AddressPageContainer}>
                    <CommonStackHeader Title = '我的收货地址' navigation = {navigation}></CommonStackHeader> 
                    <View style = {styles.addressListContainer}>
                        <FlatList
                            data = {addressListData}
                            renderItem = {this._addressFlatListRenderItem}
                            keyExtractor = {(item) => item.key + item.Index}
                        ></FlatList>
                    </View>
                    <View style = {styles.bottomAddNewAddressContianer}>
                        <TouchableOpacity 
                            // activeOpacity = {1}
                            style = {styles.bottomAddNewAddressBtn}
                            onPress = {()=>this._addNewAddressPress()}>
                            <AntDesign
                                name={'plus'}
                                size={16}
                                color="white"
                            />
                            <Text style = {{fontSize:16,color:'white'}}> 新建收货地址</Text>
                        </TouchableOpacity>   
                    </View>
                    {this._editPageRender(this.state.editCommand)} 
                </View>
            )   
        }
    }
}

const styles = StyleSheet.create({
    AddressPageContainer:{
        flex:1,
        flexDirection:'column',
    },
    cutLine:{
        height:1,
        backgroundColor:"#F4F4F4"
    },
    cutArea:{
        height:(deviceHeight)/50,
        backgroundColor:"#F4F4F4" 
    },
    // addNewAddressBtnContainer:{
    //     position:'absolute',
    //     top:-(deviceHeight)/21,
    //     right:0,
    //     width:90,
    //     alignItems:'center',
    // },
    // addNewAddressBtn:{
    //     fontSize:16,
    //     color:'white'
    // },
    addressListContainer:{
        flex:1,      
    },  
    addressFlatListItemContainer:{
        height:80,
        flexDirection:'row',
        paddingLeft:20,
        borderBottomColor:'#F4F4F4',
        borderBottomWidth:1
    },
    flatListItemTitleContainer:{
        flex:1,
        flexDirection:'row',
        alignItems:'center',
    },
    flatListItemTitleUsernameContainer:{
        // justifyContent:'center',
        // alignItems:'flex-start',
    },
    flatListItemTitleUsername:{
        fontSize:18,
        color:'black'
    },
    flatListItemTitlePhoneContainer:{
        // justifyContent:'center',
        // alignItems:'flex-start',
        marginLeft:30,
    },
    flatListItemTitlePhone:{
        fontSize:12,
        color:'#cccccc'
    },
    flatListItemAddressContainer:{
        flex:1,
        justifyContent:'center',
        alignItems:'flex-start',
    },
    flatListItemAddress:{
        fontSize:13,
        color:'black'
    },
    addressFlatListItemEditBtnContainer:{
        flex:1,
        flexDirection:'row',
        justifyContent:'flex-start',
        alignItems:'center',
        paddingTop:10,
        paddingBottom:10,
    },
    addressFlatListItemEditBtn:{
        fontSize:14,
        color:'#cccccc'
    },
    bottomAddNewAddressContianer:{
        height:60,
        justifyContent:'center',
        alignItems:'center',
    },
    bottomAddNewAddressBtn:{
        width:260,
        backgroundColor:"#FF8C00",
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        height:36,
        borderRadius:25,
        opacity:0.8,
        shadowColor : '#FF8C00',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.8, 
        shadowRadius: 6, 
        elevation: 10
    },
    animatedViewContainer : {
        zIndex:15,
        height:(deviceHeight)-(deviceHeight)/10,
        flexDirection:"column",
        width:(deviceWidth),
        backgroundColor:"white",
        position:"absolute",
        top:(deviceHeight)/10,
    },
    editPageContainer:{
        flex:12
    },
    editPageItemContainer:{
        marginTop:30,
        height:150,
        flexDirection:'column',
        paddingLeft:25,
        paddingRight:25
    },
    editPageItem:{
        height:60
    },
    Input:{
        height : 40,
        borderBottomColor: '#666666',
        borderBottomWidth: 1,
        fontSize: 18,
        padding: 0,
      },
    TransparentEditBtnContainer:{
        marginTop: 32,
        backgroundColor:"#FF8C00",
        flexDirection:'column',
        justifyContent:'center',
        alignItems:'center',
        height:45,
        borderRadius:25,
        overflow: 'hidden',
        opacity:0.4
      },
      EditBtnContainer:{
        opacity:1,
        // shadowColor : '#FF8C00',
        // shadowOffset: { width: 0, height: 0 },
        // shadowOpacity: 0, 
        // shadowRadius: 0, 
        // elevation: 0
      },
})
