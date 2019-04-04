import React, {Component} from 'react';
import {FlatList,ScrollView,Animated,SectionList,StyleSheet,Image, Text, View ,TextInput , Button,TouchableOpacity} from 'react-native';
import UserDataModel from './viewModel/UserDataModel'
import UserService from './service/UserService'
import CommonStackHeader from './common/component/CommonStackHeader'
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import apiHelper from './common/apiHelper'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LoadingPage from './common/component/LoadingPage'
import {Dimensions} from 'react-native';
global.deviceWidth = Dimensions.get('window').width
global.deviceHeight = Dimensions.get('window').height
export default class OrderPage extends Component{
    constructor(props){
        super(props);
        this.state = {
            userInfo:[],  //用户信息
            Is_PayAnimatedFinish : true, //支付动画是否结束
            Is_LoadingFinsh:false,  //页面是否已经加载完数据
            totalPrice:"",    //购物车商品总价
            defaultDeliveryInfo:-1, //用户默认地址及电话信息
            cartList: [],  //购物车商品列表
            isFromGoodPage : false,  //是否是从GoodPage直接立即购买跳转到此页面的
            pot_1_size:  new Animated.Value(18),     //支付动画弹窗容器中第一个点的大小
            pot_2_size: new Animated.Value(18),     //支付动画弹窗容器中第二个点的大小
            pot_3_size: new Animated.Value(18),     //支付动画弹窗容器中第三个点的大小
            AnimatedViewContainerTop : (deviceHeight),        //支付动画容器离屏幕顶端的距离
            AnimatedViewItemContainerHeight : 0,       //支付动画弹窗容器的高度
            CartPageContainerOpacity : 1 ,       // 主页面容器的透明度
            CartPageContainerBackgroundColor : "white" ,  //主页面容器的背景色
            AnimatedDisabled : false,       //支付动画是否执行
            FetchDataInAnimted : false      //支付动画过程中的购买请求Flag
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
            cartList : navigation.getParam('cartList'),
            totalPrice : navigation.getParam('totalPrice')
        })  
        if(navigation.getParam('isFromGoodPage') == true){
            this.setState({
                isFromGoodPage:true
            })
        }
    }
    
    //进入页面要做的所有方法全部放在里面
    async freshPageFunction(){
        this.setState({                    //刚开始loading
            Is_LoadingFinsh:false
        })
        await this.fetchDefaultAddressByUsername(this.state.userInfo.u_name)
        if(this.state.defaultDeliveryInfo != -1){
            this.setState({
                Is_LoadingFinsh:true    //加载完成
            }) 
        }
    } 

    
    cleanFunction(){
       
    }

    componentDidMount(){
        this.Is_GoodsRefreshed = [this.props.navigation.addListener('willFocus', () => this.freshPageFunction()),]; //路由改变时增加读取数据的监听事件
        // this.Is_GoodsLeave = [this.props.navigation.addListener('didBlur',()=>this.cleanFunction()),]  //路由离开这个页面时增加的监听事件
    }
    
    //离开页面后退要做的事全部放这里
    componentWillUnmount(){
        this.setState({
            totalPrice:"",          //重置内容
            defaultDeliveryInfo:-1, 
            cartList: [],  
            isFromGoodPage : false  
        })
    }
    async fetchDefaultAddressByUsername(Username){
        let UsernameData = {
            'u_name':Username
        }
        await UserService.loadDefaultAddressByUsername(UsernameData)
        
        let API = apiHelper.getAPI()
        if(API.status == 200){  
            this.setState({
                defaultDeliveryInfo: UserDataModel.addUser(API.reuslt.User).addressList[0]
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
    //通过cartList的数据渲染Scrollview
    createScrollViewItem(){
        let cartList = []
        for(let i = 0 ;i< this.state.cartList.length;i++){
            cartList.push(
                <View key = {i + this.state.cartList[i]}>
                    <View style = {styles.cartListGoodsShopTitle}>
                        <View style = {styles.cartListGoodsShopTitleBtn}>
                            <Text style = {styles.shopTitleText}>{this.state.cartList[i].shopName}</Text>
                        </View>
                        <View style = {{flex:1.5}}></View>
                    </View>
                    <View style={styles.cutLine}></View>
                    {this.createScrollViewGoodsList(this.state.cartList[i].goodsList)}
                </View>
            )    
        }
        return cartList
    }
    //根据给的goodsList加载cartList中的商品列表
    createScrollViewGoodsList(goodsListdata){
        let goodsList = []
        for(let i = 0 ; i < goodsListdata.length ; i++){
            goodsList.push(
                <View 
                    key = {i + goodsListdata[i]}
                    style = {styles.cartListGoodsItemContainer}>
                    <View style = {styles.cartListGoodsItemPicContainer}>
                        <Image style = {styles.cartListGoodsItemPic} source = {{uri:goodsListdata[i].g_url}}></Image>
                    </View>
                    <View style = {styles.cartListGoodsItemContentContainer}>
                        <View style = {styles.cartListGoodsItemContentShopNameContainer}>
                            <Text style = {styles.cartListGoodsItemContentShopName}>{goodsListdata[i].g_name}</Text>
                        </View>
                        <View style = {styles.cartListGoodsItemContentPriceAndBtnContainer}>
                            <View style = {styles.cartListGoodsItemContentPriceContainer}>
                                <Text style = {styles.cartListGoodsItemContentPrice}>¥{goodsListdata[i].g_price}</Text> 
                            </View>
                            <View style = {styles.cartListGoodsItemContentBtnContainer}>
                                <View style = {styles.cartListGoodsItemAmountContainer}>
                                    <AntDesign
                                        name = 'close'
                                        size = {14}
                                        color = 'black'
                                    >
                                    </AntDesign>
                                    <Text style ={styles.cartListGoodsItemAmount}>{goodsListdata[i].g_cartAmount}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            )
        }
        return goodsList
    }
    
    //将cartlist的格式转换成API能接收的格式
    createAPICartListForm(cartList){
        let cartListArr = []
        for(let i = 0 ; i < cartList.length ; i++){
            for(let a = 0 ; a < cartList[i].goodsList.length;a++){
                cartListArr.push(cartList[i].goodsList[a])
            }
        }
        return cartListArr
    }
    _onAddressAnduserInfoPress(){
        //点击顶部大块（包括收件和收件人）按钮触发的功能
        const {navigation} = this.props
        navigation.navigate('AddressPage',{
            userInfo:this.state.userInfo,
            enablePress:'true'
        })
    }
    async _onPay(commandData,cleanCartData){
        //点击订单支付做的事情
        await this.setState({
            CartPageContainerOpacity : 0.4,
            CartPageContainerBackgroundColor : "#F4F4F4",
            AnimatedViewContainerTop : 0 ,
            AnimatedViewItemContainerHeight : 100
        }) 
        this._onPayAnimated()
        await UserService.createOrderList(commandData)
        let createOrderListAPI = apiHelper.getAPI()
        if(createOrderListAPI.status == 200){  
            if(createOrderListAPI.result_kind == 'SUCCESS'){
                if(this.state.isFromGoodPage != true){
                    await UserService.deleteAllGoodsInCart(cleanCartData) 
                    let deleteAllGoodsInCartAPI = apiHelper.getAPI() 
                    this.setState({
                        AnimatedDisabled : true
                    })
                    if(deleteAllGoodsInCartAPI.status == 200){      
                        this.setState({
                            FetchDataInAnimted : true
                        })
                    }
                    else if(deleteAllGoodsInCartAPI.status == 404){
                        //跳转错误页面               
                        alert(deleteAllGoodsInCartAPI.reuslt.msg) 

                    }
                    else if(deleteAllGoodsInCartAPI.status == 500){
                        //跳转错误页面 
                        alert(deleteAllGoodsInCartAPI.reuslt.msg)
                    } 
                }
                else{
                    this.setState({
                        AnimatedDisabled : true
                    })
                    this.setState({
                        FetchDataInAnimted : true
                    })
                }
            }
            if(createOrderListAPI.result_kind == 'WARNING'){
                this.setState({
                    AnimatedDisabled : true
                })
                alert(createOrderListAPI.reuslt.msg)
            }   
        }
        else if(createOrderListAPI.status == 404){
            //跳转错误页面            
            this.setState({
                AnimatedDisabled : true
            })     
            alert(createOrderListAPI.reuslt.msg)  
        }
        else if(createOrderListAPI.status == 500){
            //跳转错误页面 
            this.setState({
                AnimatedDisabled : true
            })
            alert(createOrderListAPI.reuslt.msg)
        } 
    }
    _onPayAnimated(){
        //"提交订单"的动画
        const {navigation} = this.props
        let potduration = 200   //单个点的动画持续时间
        Animated.sequence([
            Animated.timing(this.state.pot_1_size,{
                toValue:0,
                duration:potduration
            }),
            Animated.timing(this.state.pot_2_size,{
                toValue:0,
                duration:potduration
            }),
            Animated.timing(this.state.pot_3_size,{
                toValue:0,
                duration:potduration
            }),
            Animated.timing(this.state.pot_1_size,{
                toValue:18,
                duration:potduration
            }),
            Animated.timing(this.state.pot_2_size,{
                toValue:18,
                duration:potduration
            }),
            Animated.timing(this.state.pot_3_size,{
                toValue:18,
                duration:potduration
            }),
        ]).start(async ()=>{     
                if(this.state.AnimatedDisabled == false){        //不加载完数据则持续播放动画
                    this._onPayAnimated()
                }
                else{
                    if(this.state.FetchDataInAnimted == true){      //如果数据购买成功，则跳转到新页面
                        navigation.navigate('SuccessPayPage',{
                            userInfo:this.state.userInfo
                        }) 
                    }
                    else{
                        this.setState({                             //数据购买失败就还原页面
                            CartPageContainerOpacity : 1,
                            CartPageContainerBackgroundColor : "white",
                            AnimatedViewContainerTop : deviceHeight ,
                            AnimatedViewItemContainerHeight : 0
                        }) 
                    }
                }
            }   
        )
    }

    _onPayPress(){
        //点击提交订单按钮触发的功能
        const {navigation} = this.props
        let commandData = {
            'u_name':this.state.userInfo.u_name,
            'a_name':this.state.defaultDeliveryInfo.a_name,
            'cartList':this.createAPICartListForm(this.state.cartList)
        }
        let cleanCartData = {
            'u_name':this.state.userInfo.u_name
        }
        if(this.state.defaultDeliveryInfo.a_name != ""){
            if(commandData.cartList.length != 0){
                this._onPay(commandData,cleanCartData)
            }
            else{
                alert("您并未添加任何商品！")
            }
        }
        else{
            alert("请添加收货地址！")
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
            return(
                <View style={[styles.CartPageContainer,]}>
                    <Animated.View style = {[styles.AnimatedViewContainer,{top:this.state.AnimatedViewContainerTop}]}>
                        <Animated.View style = {[styles.AnimatedViewItemContainer,{height:this.state.AnimatedViewItemContainerHeight},{opacity:1}]}>
                            <Animated.View style = {[styles.AnimatedViewTextContainer,{flex:5}]}>
                                <Animated.Text style = {styles.AnimatedViewItemText}>支付处理中</Animated.Text>
                            </Animated.View>
                            <Animated.View style = {styles.AnimatedViewTextContainer}>
                                <Animated.Text style = {[styles.AnimatedViewItemText,{fontSize:this.state.pot_1_size}]}>.</Animated.Text>   
                            </Animated.View>
                            <Animated.View style = {styles.AnimatedViewTextContainer}>
                                <Animated.Text style = {[styles.AnimatedViewItemText,{fontSize:this.state.pot_2_size}]}>.</Animated.Text>   
                            </Animated.View>
                            <Animated.View style = {styles.AnimatedViewTextContainer}>
                                <Animated.Text style = {[styles.AnimatedViewItemText,{fontSize:this.state.pot_3_size}]}>.</Animated.Text>   
                            </Animated.View>
                        </Animated.View>
                    </Animated.View>
                    <View style = {{opacity:this.state.CartPageContainerOpacity,backgroundColor:this.state.CartPageContainerBackgroundColor}}>
                        <CommonStackHeader Title = '确认订单' navigation = {navigation}></CommonStackHeader>   
                    </View>
                    <ScrollView style = {{opacity:this.state.CartPageContainerOpacity,backgroundColor:this.state.CartPageContainerBackgroundColor}}>
                        <TouchableOpacity 
                            activeOpacity = {0.2}
                            onPress = {()=>this._onAddressAnduserInfoPress()}>
                            <View style = {styles.addressAnduserInfoContainer}>
                                <View style = {styles.InfoContainer}>
                                    <Text style = {styles.Info}>收货人 : {this.state.userInfo.u_name}</Text>
                                </View>
                                <View style = {styles.arrowContainer}>
                                    <Ionicons
                                        name = 'ios-arrow-forward'
                                        size = {22}
                                        color = 'black'
                                    >
                                    </Ionicons>
                                </View>
                                <View style = {styles.InfoContainer}>
                                    <Text style = {styles.Info}>收货地址 : {this.state.defaultDeliveryInfo.a_name}</Text>
                                </View>
                            </View>    
                        </TouchableOpacity>
                        <View style = {styles.cutArea}></View>
                        <View style = {styles.cartListGoodsContainer}>
                            {this.createScrollViewItem()}
                        </View>
                    </ScrollView>
                    <View style = {[styles.bottomPayBtnContianer,{opacity:this.state.CartPageContainerOpacity,backgroundColor:this.state.CartPageContainerBackgroundColor}]}>
                        <View style = {styles.bottomPayPriceContainer}>
                            <Text style={styles.bottomPayText}>合计:¥{this.state.totalPrice}</Text>
                        </View>  
                        <TouchableOpacity 
                            // activeOpacity = {0.2}
                            onPress = {()=>this._onPayPress()}>
                            <View style = {[styles.bottomPayBtn,{backgroundColor:"#FF8C00"}]}>
                                <Text style={styles.bottomPayText}>提交订单</Text>
                            </View>  
                        </TouchableOpacity>
                    </View>
                </View>
            )
        }   
    }
}

const styles = StyleSheet.create({
    CartPageContainer:{
        flex:1,
        flexDirection:'column',
    },
    AnimatedViewContainer:{
        zIndex:10,
        position:'absolute',
        bottom:0,
        right:0,
        left:0,
        backgroundColor:'transparent',
        justifyContent:'center',
        alignItems:'center',
    },
    AnimatedViewItemContainer:{
        width:190,
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:'#FF7F50',
        borderRadius:10,
    },
    AnimatedViewTextContainer:{
        flex : 1,
        justifyContent:'center',
        alignItems:'center'
    },
    AnimatedViewItemText:{
        fontSize:18,
        color:'white',
        fontWeight:'bold'
    },
    cutLine:{
        height:1,
        backgroundColor:"#F4F4F4"
    },
    cutArea:{
        height:(deviceHeight)/50,
        backgroundColor:"#F4F4F4" 
    },
    addressAnduserInfoContainer:{
        height:120,
        flexDirection:'column',
        paddingTop:10,
        paddingBottom:10
    },  
    InfoContainer:{
        flex:2,
        paddingLeft:15,
        justifyContent:'center',
        alignItems:'flex-start',
    },
    Info:{
        fontSize:18,
        color:'black'
    },
    arrowContainer:{
        flex:1,
        paddingRight:35,
        justifyContent:'center',
        alignItems:'flex-end'
    },
    cartListGoodsContainer:{
        flexDirection:'column',
        paddingLeft:15,
        paddingRight:15,
    },
    cartListGoodsShopTitle:{
        height:40,
        flexDirection:'row',
    },
    cartListGoodsShopTitleBtnContainer:{
        flex:1
    },
    cancelGoodsBtnContainer:{
        flex:3,
        paddingTop:10,
        paddingBottom:10,
        paddingRight:5,
        justifyContent:'center',
        alignItems:'flex-end',
    },
    cancelGoodsBtn:{
        flex:1,
        width:(deviceWidth-50)/4,
        justifyContent:"center",
        alignItems:"center",
        marginLeft:(deviceWidth)/3,
        borderColor:"#FF8C00",
        borderWidth:1,
        borderRadius:20
    },
    cancelGoodsBtnText:{
        fontSize:12,
        color:'#FF8C00'
    },
    cartListGoodsShopTitleBtn:{
        flexDirection:"row",
        alignItems:'center',
        flex:1,
    },
    shopTitleText:{
        fontSize:16,
        color:'black',
        fontWeight:'bold'
    },
    cartListGoodsItemContainer:{
        flexDirection:'row',
        height:110,
    },
    cartListGoodsItemPicContainer:{
        flex:1,
        justifyContent:'center',
        alignItems:'center',
        paddingLeft:5,
    },
    cartListGoodsItemPic:{
        height:90,
        width:90,
    },
    cartListGoodsItemContentContainer:{
        flex:2.5,
        flexDirection:'column',
        paddingTop:10
    },
    cartListGoodsItemContentShopNameContainer:{
        flex:1,
    },
    cartListGoodsItemContentShopName:{
        fontSize:14,
        color:'black',
    },
    cartListGoodsItemContentPriceAndBtnContainer:{
        flex:1,
        flexDirection:'row',
    },
    cartListGoodsItemContentPriceContainer:{
        flex:1,
        justifyContent:'center',
    },
    cartListGoodsItemContentPrice:{
        fontSize:14,
        color:'red'
    },
    cartListGoodsItemContentBtnContainer:{
        flex:2,
        flexDirection:'row',
        alignItems:'center',
    },
    cartListGoodsItemAmountContainer:{
        flex:1,
        height:35,
        flexDirection:'row',
        justifyContent:'flex-end',
        alignItems:'center',
    },
    cartListGoodsItemAmount:{
        fontSize:16,
        color:'black',
    },
    bottomPayBtnContianer:{
        borderTopWidth : 1,
        borderTopColor : '#848484',
        height:60,
        flexDirection:"row",
    },
    bottomPayBtn:{
        flex:1,
        width:((deviceWidth)-(deviceWidth)/3.5-59)/2,
        justifyContent:'center',
        alignItems:'center'
    },
    bottomPayText:{
        fontSize:16
    },
    bottomPayPriceContainer:{
        flex:1,
        justifyContent:'center',
        alignItems:'flex-start',
        paddingLeft:15
    }
})
