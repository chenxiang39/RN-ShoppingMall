import React, {Component} from 'react';
import {FlatList,ScrollView,SectionList,StyleSheet,Image, Text, View ,TextInput , Button,TouchableOpacity} from 'react-native';
import UserDataModel from './viewModel/UserDataModel'
import CartListDataModel from './viewModel/CartListDataModel'
import UserService from './service/UserService'
import apiHelper from './common/apiHelper'
import CommonStackHeader from './common/component/CommonStackHeader'
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LoadingPage from './common/component/LoadingPage'
import {Dimensions} from 'react-native';
global.deviceWidth = Dimensions.get('window').width
global.deviceHeight = Dimensions.get('window').height
export default class StackCartPage extends Component{
    constructor(props){
        super(props);
        this.state = {
            Is_LoadingFinsh:false,  //页面是否已经加载完数据
            userInfo:[],  //用户信息
            totalPrice:-1,    //购物车商品总价
            cartList: -1  //购物车商品列表
        }
    }
    //导航栏样式的配置
    static navigationOptions = {
        header:null,
        title:null
    };
    componentWillMount(){
        const {navigation} = this.props
        this.setState({
            userInfo : navigation.getParam('userInfo')
        })  
    }
    //进入页面要做的所有方法全部放在里面
    async freshPageFunction(){
        this.setState({              //刚开始loading
            Is_LoadingFinsh:false
        }) 
        await this.fetchCartListByUsername(this.state.userInfo.u_name)
        if(this.state.cartList != -1&&this.state.totalPrice != -1){                    
            this.setState({
                Is_LoadingFinsh:true     //加载完成
            })
        }
    } 

    //离开页面要做的事全部放这里
    cleanFunction(){
        this.setState({
            cartList : -1,  
            totalPrice : -1 
        })
    }

    componentDidMount(){
        this.Is_GoodsRefreshed = [this.props.navigation.addListener('willFocus', () => this.freshPageFunction()),]; //BottomTab路由改变时增加读取数据的监听事件
        // this.Is_GoodsLeave = [this.props.navigation.addListener('didBlur',()=>this.cleanFunction()),]  //BottomTab路由离开这个页面时增加读取数据的监听事件
    }


    //离开页面进前一页的操作(堆栈往回的页面)
    componentWillUnmount(){
        this.cleanFunction()
    }


    //根据用户名向API请求购物车商品信息和总价然后加载到state.cartList和state.totalPrice中
    async fetchCartListByUsername(Username){
        let userData = {
            'u_name':Username
        }
        await UserService.loadCartListByUsername(userData)
        let API = apiHelper.getAPI()
        if (API.status == 200){
            this.setState({
                cartList:CartListDataModel.addCartList(API.reuslt.User).cartList,
                totalPrice : CartListDataModel.addCartList(API.reuslt.User).TotalPrice
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
                        <TouchableOpacity 
                            style = {styles.cartListGoodsShopTitleBtn}
                            activeOpacity = {0.2}
                            onPress = {this._onShopTitlePress.bind(this,this.state.cartList[i].shopName)}>
                            <Text style = {styles.shopTitleText}>{this.state.cartList[i].shopName}</Text>
                            <MaterialIcons
                                name = 'keyboard-arrow-right'
                                size = {25}
                                color = 'black'
                            ></MaterialIcons>
                        </TouchableOpacity>
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
                <TouchableOpacity 
                    key = {i + goodsListdata[i]}
                    style = {styles.cartListGoodsItemContainer}
                    activeOpacity = {0.2}
                    onPress = {this._onGoodsPress.bind(this,goodsListdata[i].g_id)}>
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
                            <View style = {styles.cancelGoodsBtnContainer}>
                                <TouchableOpacity 
                                    // activeOpacity = {0.2}
                                    onPress = {this._onDeleteGoodsPress.bind(this,goodsListdata[i].g_id)}
                                    style = {styles.cancelGoodsBtn}>
                                    <Text style={styles.cancelGoodsBtnText}>删除商品</Text>   
                                </TouchableOpacity> 
                            </View>
                            <View style = {styles.cartListGoodsItemContentBtnContainer}>
                                <TouchableOpacity 
                                    style = {styles.BtnLeftAndRightContainer}
                                    activeOpacity = {0.2}
                                    onPress = {this._onChangeGoodsPress.bind(this,goodsListdata[i].g_id,0)}>
                                    <AntDesign
                                        name = 'minus'
                                        size = {18}
                                        color = 'black'
                                    ></AntDesign>
                                </TouchableOpacity>
                                <View style = {styles.cartListGoodsItemAmountContainer}>
                                    <Text style ={styles.cartListGoodsItemAmount}>{goodsListdata[i].g_cartAmount}</Text>
                                </View>
                                <TouchableOpacity 
                                    style = {styles.BtnLeftAndRightContainer}
                                    activeOpacity = {0.2}
                                    onPress = {this._onChangeGoodsPress.bind(this,goodsListdata[i].g_id,1)}>
                                    <AntDesign
                                        name = 'plus'
                                        size = {18}
                                        color = 'black'
                                    ></AntDesign>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
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
    _onShopTitlePress(shopName){
        //点击购物车顶部商店按钮触发的功能
        const {navigation} = this.props
        navigation.push('ShopPage',{
            userInfo : this.state.userInfo,
            shopName : shopName
        })
    }  
    _onGoodsPress(g_id){
        //点击商品图片触发的功能
        const {navigation} = this.props
        navigation.push('ShowGoodPage',{
            userInfo : this.state.userInfo,
            goodId : g_id
        })
    }
    async _onDeleteGoodsPress(g_id){
        //点击删除商品按钮
        let commandData = {
           'u_name':this.state.userInfo.u_name,
           'g_id' :g_id
        }
        await UserService.deleteGoodInCart(commandData)
        let API = apiHelper.getAPI()
        if(API.status == 200){  
            if(API.result_kind == 'SUCCESS'){
                this.freshPageFunction()
            }
            if(API.result_kind == 'WARNING'){
                alert(API.reuslt.msg)
            }   
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
    async _onChangeGoodsPress(g_id,command){
        //点击增减商品数量按钮触发的功能  
        let commandData = {
            'u_name':this.state.userInfo.u_name,
            'g_id':g_id,
            'scode':command
        }
        await UserService.changeGoodAmountInCart(commandData)
        let API = apiHelper.getAPI()
        if(API.status == 200){  
            if(API.result_kind == 'SUCCESS'){
                this.freshPageFunction()
            }
            if(API.result_kind == 'WARNING'){
                alert(API.reuslt.msg)
            }   
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
    _onGoToPayPress(){
        //点击去结算按钮触发的功能
        const {navigation} = this.props
        navigation.navigate("OrderPage",{
            userInfo:this.state.userInfo,
            cartList:this.state.cartList,
            totalPrice:this.state.totalPrice
        })
    }
    async _onCleanCartPress(){
        //点击清空购物车按钮触发的功能
        let commandData = {
            'u_name':this.state.userInfo.u_name,
        }
        await UserService.deleteAllGoodsInCart(commandData)
        let API = apiHelper.getAPI()
        if(API.status == 200){  
            if(API.result_kind == 'SUCCESS'){
                this.freshPageFunction()
            }
            if(API.result_kind == 'WARNING'){
                alert(API.reuslt.msg)
            }   
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
    render(){ 
        if(!this.state.Is_LoadingFinsh){
            return (
                <LoadingPage></LoadingPage>
            )
        }
        else{
            const {navigation} = this.props
            return(
                <View style={styles.CartPageContainer}>
                    <CommonStackHeader Title = "购物车" navigation = {navigation}></CommonStackHeader>
                    <ScrollView>
                        <View style = {styles.cartListGoodsContainer}>
                            {this.createScrollViewItem()}
                        </View>
                    </ScrollView>
                    <View style = {styles.bottomCartBtnContianer}>
                        <View style = {styles.bottomCartPriceContainer}>
                            <Text style={styles.bottomCartText}>合计:¥{this.state.totalPrice}</Text>
                        </View>  
                        <TouchableOpacity 
                            // activeOpacity = {0.2}
                            onPress = {()=>this._onCleanCartPress()}>
                            <View style = {[styles.bottomCartBtn,{backgroundColor:"#EEC591"}]}>
                                <Text style={styles.bottomCartText}>清空购物车</Text>
                            </View>  
                        </TouchableOpacity>
                        <TouchableOpacity 
                            // activeOpacity = {0.2}
                            onPress = {()=>this._onGoToPayPress()}>
                            <View style = {[styles.bottomCartBtn,{backgroundColor:"#FF8C00"}]}>
                                <Text style={styles.bottomCartText}>去结算</Text>
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
        flexDirection:'column'
    },
    cutLine:{
        height:1,
        backgroundColor:"#F4F4F4"
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
        flex:1.5,
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
    BtnLeftAndRightContainer:{
        flex:1,
        justifyContent:'center',
        alignItems:'center',
    },
    cartListGoodsItemAmountContainer:{
        flex:1.5,
        height:35,
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:'#D9D9D9'
    },
    cartListGoodsItemAmount:{
        fontSize:16,
        color:'black',
    },
    bottomCartBtnContianer:{
        borderTopWidth : 1,
        borderTopColor : '#848484',
        height:50,
        flexDirection:"row",
    },
    bottomCartBtn:{
        flex:1,
        width:((deviceWidth)-(deviceWidth)/3.5-59)/2,
        justifyContent:'center',
        alignItems:'center'
    },
    bottomCartText:{
        fontSize:16
    },
    bottomCartPriceContainer:{
        flex:1,
        justifyContent:'center',
        alignItems:'flex-start',
        paddingLeft:15
    }
})
