import React, {Component} from 'react';
import {ScrollView,FlatList,RefreshControl,Easing,Animated,StyleSheet,Image, Text, View ,TouchableOpacity} from 'react-native';
import {Dimensions} from 'react-native';
import UserDataModel from './viewModel/UserDataModel'
import GoodsService from './service/GoodsService'
import UserService from './service/UserService'
import apiHelper from './common/apiHelper'
import LoadingPage from './common/component/LoadingPage'
import GoodsDataModel from './viewModel/GoodsDataModel';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
global.deviceWidth = Dimensions.get('window').width
global.deviceHeight = Dimensions.get('window').height
global.commentItemAmount = 8//商品页中可见的评论数
global.basic = (deviceHeight)/1.6 + (deviceHeight)/2 + 2 + (deviceHeight)/50 - (deviceHeight)/10  //页面从顶部到商品详情的高度
global.cartPicTop = 0       //底部购物车图标的离屏幕顶部的距离
global.cartPicLeft = 0      //底部购物车图标的离屏幕左边的距离
export default class ShowGoodPage extends Component{
    constructor(props){
        super(props);
        this.state = {
            Is_LoadingFinsh:false,  //页面是否已经加载完数据
            Is_Refresh : false,  //下拉刷新的状态
            Is_AddCartAnimatedFinish : true, //加入购物车动画是否结束
            userInfo : [], //用户信息
            goodId:-1,  //商品Id
            cartAmount : -1,   //购物车商品数量
            titleOpacity : 0, //标题部分的透明度
            titleHeight : 0, //标题部分的高度
            titleFlatlistContainerHeight : 0 , //flatlist部分标题的高度
            g_url_Top:0,  //商品图片的顶部距离屏幕的距离
            goodName : "",      //商品名
            goodInfo : -1,//商品信息    
            shopInfo : -1,//商品所属商店的信息 
            goodsCommentItemHeight : 0,     //首页的评论区域的高度
            goodsCommentItemVisibleAmount : 0,  //首页的评论区可见的内容的数量
            goodsCommentItemPageRight : new Animated.Value(-(deviceWidth)),   //商品评论的遮罩层的位置，默认不显示
            goodsTitleBottomIndex : 0,   //顶部title的flatlist部分的下标，默认第一个底部有横线
            littleGoodsPicWidthAndHeight : new Animated.Value(0),    //动画中小的商品图的高和宽的值
            littleGoodsPicPositionLeft : new Animated.Value(0),   //动画中小的商品图离屏幕左边的距离
            littleGoodsPicPositionTopInterpolate : new Animated.Value(0).interpolate({   //动画中小的商品图离屏幕顶部的距离的映射值
                inputRange:[0,0],
                outputRange:[0,0]
            })
        }
    }

    //初始化方法
    componentWillMount(){
        const {navigation} = this.props
        this.setState({
            userInfo : navigation.getParam('userInfo'),
            goodId : navigation.getParam('goodId')
        }) 
    }
    //进入商品页面要做的所有方法全部放在里面
    async freshPageFunction(){   
        this.setState({              //刚开始loading
            Is_LoadingFinsh:false
        })   
        await this.fetchGoodInfo(this.state.goodId)
        if(this.state.goodInfo != -1){                    
            await this.fetchShopInfo(this.state.goodInfo.s_name)
            await this.fetchCartAmountByUsername(this.state.userInfo.u_name)
            if(this.state.shopInfo != -1 || this.state.cartAmount != -1){         //如果商品及商店信息请求成功,则做页面加载的工作，否则卡在loading页面
                this._createGoodsCommentItemHeightAndAmount()        //根据商品数据给出的评论信息加载商品页面中商品评价部分的内容设置样式的高度和可见条数的数量
                this.setState({
                    Is_LoadingFinsh:true     //加载完成
                })
                this.timer = setTimeout(()=>{
                    this.refs['cartPic'].measure((x,y,widht,height,left,top) => {
                        cartPicTop = top                                //定位底部购物车图标的位置
                        cartPicLeft = left + (deviceWidth)/16
                    })
                })
            }
        }
    }

    componentDidMount(){ 
        this.Is_GoodsRefreshed = [this.props.navigation.addListener('didFocus', () => this.freshPageFunction())]; //路由改变时增加读取数据的监听事件
        // this.Is_GoodsLeave = [this.props.navigation.addListener('didBlur',()=>this.cleanFunction()),]  //路由离开这个页面时增加的监听事件
    }

    //离开页面进前一页的操作(堆栈往回的页面)
    componentWillUnmount(){
        this.setState({
            goodInfo : -1,  //重置内容
            shopInfo : -1,
            goodId:-1,
            cartAmount:-1
        })
        clearTimeout(this.timer)
    }
    static navigationOptions =  ({ navigation, state })=>({
        title: null,
        header: null,
    });
    
    //根据商品Id向API请求商品信息
    async fetchGoodInfo(goodId){
        let goodID = {
            'g_id':goodId
        }
        await GoodsService.loadGoodByGoodId(goodID)
        let API = apiHelper.getAPI()
        if(API.status == 200){  
            this.setState({
                goodInfo: GoodsDataModel.addGoods(API.reuslt.goods)[0]
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
    //scrollview的滚动监听事件
    _scrollViewListener =(event)=>{
        this._scrollViewOpacityAndPicTopListener(event)
        this._scrollViewTitleBottomIndexListener(event)
    }
    //根据商店名向API请求商店卖的东西的小类和对应的图片
    async fetchShopInfo(shopName){
        let shopNameContent = {
           's_name':shopName 
        }
        await GoodsService.loadSmallKindAndSmallKindUrlByShopName(shopNameContent)
        let API = apiHelper.getAPI()
        if(API.status == 200){  
            this.setState({
                shopInfo: GoodsDataModel.addGoods(API.reuslt.goods)
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
    //根据用户名向API请求用户的购物车商品数量并赋值给this.state.cartAmount
    async fetchCartAmountByUsername(Username){
        let userData = {
            'u_name':Username
        }
        await UserService.loadCartGoodsAmountByUsername(userData)
        let API = apiHelper.getAPI()
        if(API.status == 200){  
            this.setState({
                cartAmount:API.reuslt.msg
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
     //下拉刷新的功能
    reFreshFunction(){
        this.setState({
            Is_Refresh:true
        })
        setTimeout(()=>{
            this.freshPageFunction()   
            this.setState({
                Is_Refresh:false
            })
        },1000)
    }
    //根据scrollview滚动的位置，以此让标题内item底部的标识根据滑动的距离进行改变
    _scrollViewTitleBottomIndexListener(event){
        if(event.nativeEvent.contentOffset.y<basic){
            this.setState({
                goodsTitleBottomIndex : 0
            })
        }
        if(event.nativeEvent.contentOffset.y>=basic&&event.nativeEvent.contentOffset.y<basic + (deviceHeight)*1.5 + (deviceHeight)/50){
            this.setState({
                goodsTitleBottomIndex : 1
            })
        }
        if(event.nativeEvent.contentOffset.y>=basic + (deviceHeight)*1.5 + (deviceHeight)/50){
            this.setState({
                goodsTitleBottomIndex : 2
            })
        }
    }
    //根据scrollview滚动的位置，以此让标题根据滑动的距离进行透明度的改变和顶部图片的位置的改变
    _scrollViewOpacityAndPicTopListener(event){
        if (event.nativeEvent.contentOffset.y > 0){
            this.setState({
                titleFlatlistContainerHeight:35
            })
            if((event.nativeEvent.contentOffset.y)/2.5 < (deviceHeight)/1.6){
                this.setState({
                    titleHeight:deviceHeight/10,
                    titleOpacity:(event.nativeEvent.contentOffset.y)/((deviceHeight)/2.2),
                    g_url_Top:(event.nativeEvent.contentOffset.y)/2.5,
                })
            }
            else{
                this.setState({
                    // titleHeight:deviceHeight/10,
                    titleOpacity:(event.nativeEvent.contentOffset.y)/200,
                    g_url_Top:(deviceHeight)/1.6,
                })
            }
        }
        if (event.nativeEvent.contentOffset.y <= 0){
            this.setState({
                titleHeight:0,
                titleOpacity:0,
                g_url_Top:0,
                titleFlatlistContainerHeight:0
            })
        }
    }
    //根据购物车商品数量渲染红圈提示
    _createCircleCartAmount(){
        return(
            <View style = {styles.redCircleContainer}>
                <Text style = {styles.redCircleText}>{this.state.cartAmount > 9 ? "9+": this.state.cartAmount}</Text>
            </View>
        )
    }
    //根据商品数据给出的评论信息加载商品页面中商品评价部分的内容设置样式的高度和可见条数的数量
    _createGoodsCommentItemHeightAndAmount(){
        let LENGTH = 0
        if(this.state.goodInfo.g_comments.length <= commentItemAmount){  
            LENGTH = this.state.goodInfo.g_comments.length
        }
        else{
            LENGTH = commentItemAmount
        }
        this.setState({
            goodsCommentItemVisibleAmount : LENGTH,
            goodsCommentItemHeight:LENGTH*(deviceHeight)/6 + 2
        })  
    }
    //顶部title部分的flatList渲染
    _titleFlatListRenderItem = (Info) =>{
        return (
            <View key={Info.item.key+Info.item.Index} style = {styles.titleFlatListItemContainer}>
                <TouchableOpacity 
                activeOpacity = {0.2}
                onPress = {()=>this._onTitleFlatListBtnPress(Info)}>
                    <View style = {[styles.titleFlatListBtn,{borderBottomColor:Info.item.Index === this.state.goodsTitleBottomIndex?"white":"transparent"},{borderBottomWidth:2}]}>
                        <Text style = {{fontSize:16,color:"white"}}>{Info.item.key}</Text> 
                    </View>  
                </TouchableOpacity>
            </View>
        )
    }
    //商店详情的flatList渲染
    _goodsDetailShopKindFlatListRenderItem = (Info) =>{
        return (
            <TouchableOpacity 
                activeOpacity = {0.2}
                onPress = {()=>this._onGoodsDetailShopKindBtnPress(Info)}>
                    <View style = {styles.ShopKindFlatItemContainer}>
                        <Image  style = {{height:((deviceHeight)/8.5-10)/5*3,width:70,borderRadius:10}} source = {{uri:Info.item.key.g_smallkind_url}}></Image>
                        <View style = {{height:((deviceHeight)/8.5-10)/5*2,justifyContent:'center'}}>
                            <Text style = {{fontSize:16,color:"black"}}>{Info.item.key.g_smallkind}</Text>   
                        </View>        
                    </View>  
            </TouchableOpacity>
        )
    }
    //根据商品数据给出的评论信息加载商品页面中商品评价部分的内容(可展示的内容最多为count条)
    _createGoodsCommentItem(goodInfo,count){
        let commentItem = []
        for (let i = 0;i < count;i++){
            if(goodInfo.g_comments[i]){
                commentItem.push(
                    <View key={i} style = {{height:(deviceHeight)/6}}>
                        <View style={{flex:1,justifyContent:"center",paddingLeft:(deviceWidth)/18+5}}>
                            <Text style = {{fontSize:18,color:"black"}}>用户名 : {goodInfo.g_comments[i].Username}</Text>
                        </View>
                        <View style={{flex:2,paddingLeft:(deviceWidth)/18+5,paddingRight:(deviceWidth)/18+5,alignContent:"center"}}>
                            <Text style = {{fontSize:18,color:"black"}}>用户评论 : {goodInfo.g_comments[i].u_comment}</Text>
                        </View>
                        <View style = {styles.cutLine}></View>
                    </View> 
                )
            }
        }
        return commentItem
    }
    //遮罩层的flatlist的内容渲染
    _createCommentFlatListRenderItem = (Info) =>{
        return (
            <View style = {{height:(deviceHeight)/6}}>
                <View style={{flex:1,justifyContent:"center",paddingLeft:(deviceWidth)/18+5}}>
                    <Text style = {{fontSize:18,color:"black"}}>用户名 : {Info.item.key.Username}</Text>
                </View>
                <View style={{flex:2,paddingLeft:(deviceWidth)/18+5,paddingRight:(deviceWidth)/18+5,alignContent:"center"}}>
                    <Text style = {{fontSize:18,color:"black"}}>用户评论 : {Info.item.key.u_comment}</Text>
                </View>
                <View style = {styles.cutLine}></View>
            </View>
        )
    }
    _onTitleFlatListBtnPress(Info){
        // //点击顶部flatlist三个介绍按钮时触发的功能
        if(JSON.stringify(this.state.goodsCommentItemPageRight === JSON.stringify(0))){   //若在点击flatlist按钮时，展示所有comments的页面未关闭，则将其关闭
          this._closeGoodsCommentShowMorePress()  
        } 
        if(Info.item.Index == 0){
            this.refs['ScrollView'].scrollTo({y:0,animated: true})
        }
        if(Info.item.Index == 1){
            this.refs['ScrollView'].scrollTo({y:basic + 1,animated: true})
            
        }
        if(Info.item.Index == 2){
            this.refs['ScrollView'].scrollTo({y:basic + 1 + (deviceHeight)*1.5 + (deviceHeight)/50,animated: true})
        }
    }
    _onGoodsDetailShopPress(){
        //点击商店部分“进店逛逛”按钮触发的功能
        const {navigation} = this.props
        navigation.navigate('ShopPage',{
            userInfo:this.state.userInfo,
            shopName:this.state.goodInfo.s_name
        })
    }
    _onGoodsDetailShopKindBtnPress(Info){
        //点击商店部分滚动flatlist部分按钮触发的按钮
        const {navigation} = this.props
        navigation.navigate('ShopPage',{
            userInfo:this.state.userInfo,
            shopName:this.state.goodInfo.s_name,
            g_smallkind_index: Info.item.Index
        })
    }
    _OpenGoodsCommentMorePress(){
        //点击商品评论部分"显示更多“按钮触发的功能
        Animated.timing(                  // 随时间变化而执行动画
            this.state.goodsCommentItemPageRight,            // 动画中的变量值
            {
              toValue: 0,                  
              duration: 300,              // 让动画持续一段时间
            }
        ).start();                        // 开始执行动画
    }
    _closeGoodsCommentShowMorePress(){
        //点击关闭商品评论按钮触发的功能
        Animated.timing(                  
            this.state.goodsCommentItemPageRight,            
            {
              toValue: -(deviceWidth),                   
              duration: 300,              
            }
        ).start();
    }
    async _addToCartPressAnimated(Username){
        //点击"加入购物车"按钮触发的动画
        await this.setState({
            Is_AddCartAnimatedFinish:false
        })
        this.setState({
            littleGoodsPicPositionTopInterpolate:this.state.littleGoodsPicPositionLeft.interpolate({
                inputRange:[0,cartPicLeft/1.7,cartPicLeft],
                outputRange:[(deviceHeight)/2,(deviceHeight)/1.5,cartPicTop]
            })
        })
        alert
        Animated.sequence([
            Animated.timing(this.state.littleGoodsPicWidthAndHeight,
                {
                    toValue:60,
                    duration:300
                }),
            Animated.parallel([
                Animated.timing(this.state.littleGoodsPicWidthAndHeight,
                    {
                        toValue:0,
                        duration:1500
                    }),
                Animated.timing(this.state.littleGoodsPicPositionLeft,{
                        toValue:cartPicLeft,
                        duration:1500
                    }), 
            ]),
            Animated.timing(this.state.littleGoodsPicPositionLeft,          //还原动画值
                {
                    toValue:0,
                    duration:0
                }),   
        ]).start(async ()=>{
            await this.fetchCartAmountByUsername(Username)
            this.setState({
                Is_AddCartAnimatedFinish : true
            })
        })      //重新赋值this.state.cartAmount和动画状态
    }
    async _addToCartPress(Username){
        //点击"加入购物车"按钮触发的功能
        if (this.state.Is_AddCartAnimatedFinish == true){       //如果动画已完成
            let cartData = {
                'u_name':Username,
                'g_id': this.state.goodId
            }
            await UserService.addGoodIntoCart(cartData)
            let API = apiHelper.getAPI()
            if(API.status == 200){  
                if(API.result_kind == 'SUCCESS'){
                    this._addToCartPressAnimated(Username)     
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
    }
    _onPurchasePress(){
        //点击"立即购买"按钮触发的功能
        const {navigation} = this.props
        let gooditem = this.state.goodInfo
        if(gooditem.g_stock == 0){
            alert("库存不足，无法购买!")
        }
        else{
           gooditem.g_cartAmount ++
            let cartListData =                      //生成DataModel已经处理的格式
            [
                {
                    'shopName':this.state.goodInfo.s_name,
                    'goodsList':[gooditem]
                }
            ]
            let totalPrice = gooditem.g_price
            navigation.navigate("OrderPage",{
                userInfo:this.state.userInfo,
                cartList:cartListData,
                totalPrice:totalPrice,
                isFromGoodPage : true
            }) 
        } 
    }
    _goToCartPress(){
        //点击"购物车"按钮触发的功能
        const {navigation} = this.props
        navigation.navigate('StackCartPage',{
            userInfo:this.state.userInfo
        })
    } 
    render(){
        if(!this.state.Is_LoadingFinsh){
            return (
                <LoadingPage></LoadingPage>
            )
        }
        else{
            const {navigation} = this.props
            goodsDetailShopKindFlatListData = this.state.shopInfo.map((item,index)=>{
                let tempdata = {}
                tempdata.Index = index,
                tempdata.key = item
                return tempdata
            })
            commentItemFlatlistData = this.state.goodInfo.g_comments.map((item,index)=>{
                let tempdata = {}
                tempdata.Index = index
                tempdata.key = item
                return tempdata
            })
            return(        
            <View style={styles.ShowGoodPageContainer}>
                <Animated.View style = {{zIndex:30}}>
                     <Animated.View style = {{height:this.state.littleGoodsPicWidthAndHeight,width:this.state.littleGoodsPicWidthAndHeight,position:'absolute',top:this.state.littleGoodsPicPositionTopInterpolate,left:this.state.littleGoodsPicPositionLeft}}>
                        <Animated.Image style = {{height:this.state.littleGoodsPicWidthAndHeight,width:this.state.littleGoodsPicWidthAndHeight}} source = {{uri:this.state.goodInfo.g_url}}></Animated.Image>
                     </Animated.View>
                </Animated.View>
                <View style = {[styles.titleContainer,{zIndex:2,paddingLeft:(deviceWidth)/30,height : deviceHeight/10, opacity : 1 - (this.state.titleOpacity)*2,backgroundColor:"transparent"}]}>
                    <TouchableOpacity 
                        style = {[{zIndex:5,backgroundColor:"#cccccc"},styles.titleNavigateBtn]}
                        onPress = {()=>{
                            navigation.goBack()
                        }}>
                        <AntDesign
                            name = 'left'
                            size = {26}
                            color = 'white'
                        />
                    </TouchableOpacity> 
                </View>
                <View style = {[styles.titleContainer,{paddingLeft:(deviceWidth)/30,height : this.state.titleHeight , opacity : this.state.titleOpacity}]}>
                    <View style={{flex:1}}>
                        <TouchableOpacity 
                            // activeOpacity = {0.2}
                            style = {styles.titleNavigateBtn}
                            onPress = {()=>{
                                navigation.goBack()
                            }}>
                                <AntDesign
                                    name={'left'}
                                    size={26}
                                    color="white"
                                />
                        </TouchableOpacity> 
                    </View>
                    <View style = {[styles.titleFlatlistContainer,{height: this.state.titleFlatlistContainerHeight}]}>
                        <FlatList
                            horizontal = {true}
                            showsHorizontalScrollIndicator = {false}
                            data={[
                                {Index:0,key: '展示'},
                                {Index:1,key: '详情'},
                                {Index:2,key: '评价'},]}
                            renderItem = {this._titleFlatListRenderItem}
                        >
                        </FlatList>
                    </View>
                    <View style = {{flex:1}}></View>
                </View>
                <View style = {[styles.goodInfoContainer,{bottom:0}]}>
                    <ScrollView
                        ref = "ScrollView"
                        showsVerticalScrollIndicator = {false}
                        onScroll = {this._scrollViewListener}
                        scrollEventThrottle = {1}
                        refreshControl = {
                            <RefreshControl
                                ref = "RefreshControl"
                                refreshing = {this.state.Is_Refresh}  
                                onRefresh = {this.reFreshFunction.bind(this)}
                                title = {this.state.Is_Refresh?'刷新中.....':'下拉刷新'}
                            />
                        }
                    >
                        <Image style={{zIndex:2,height:(deviceHeight)/1.6,position:"relative",top:this.state.g_url_Top}} source={{uri:this.state.goodInfo.g_url}}></Image>
                        <View style={{zIndex:3}}>
                            <View style={styles.goodsDetailContianer}>
                                <View style = {{paddingLeft:10,flex:1,flexDirection:"row",alignItems:"center"}}>
                                    <Text style={{fontSize:32,color:"red",fontWeight:"bold"}}>¥{this.state.goodInfo.g_price}</Text>  
                                </View>
                                <View style = {{paddingLeft:10,flex:2,flexDirection:"row",alignItems:"center"}}>
                                    <Text style={{flex:1,fontSize:22,color:"black",fontWeight:"900"}}>{this.state.goodInfo.g_name}</Text>
                                </View>
                                <View style = {{paddingLeft:10,flex:1,flexDirection:"row",alignItems:"center"}}>
                                    <Text style={{flex:2.2,fontSize:16,color:"#8B7B8B",fontWeight:"100"}}>种类:{this.state.goodInfo.g_mainkind}</Text>
                                    <Text style={{flex:2.5,fontSize:12,color:"#8B7B8B",fontWeight:"100"}}>所属分类:{this.state.goodInfo.g_smallkind}</Text>
                                    <Text style={{flex:2,fontSize:18,color:"#8B7B8B",fontWeight:"bold"}}>库存:{this.state.goodInfo.g_stock}</Text>
                                </View>
                                <View style = {styles.cutArea}></View>
                                <View style = {styles.goodsDetailShopContainer}>       
                                    <View style = {{flex:1,flexDirection:"row"}}>
                                        <View style={{width:5,backgroundColor:"red"}}></View>
                                        <View style={styles.goodsDetailShopTitleContainer}>
                                            <View style = {styles.goodsDetailShopTitleTextContainer}>
                                                <Text style={{fontSize:19}}>{this.state.goodInfo.s_name}</Text>
                                            </View>
                                            <View style = {styles.goodsDetailShopTitleBtnContainer}>
                                                <TouchableOpacity 
                                                    // activeOpacity = {0.2}
                                                    onPress = {()=>this._onGoodsDetailShopPress()}>
                                                    <View style = {styles.goodsDetailShopTitleBtn}>
                                                        <Text style={{fontSize:16,color:"#FF8C00"}}>进店逛逛</Text>
                                                    </View>    
                                                </TouchableOpacity> 
                                            </View>
                                        </View>
                                    </View>
                                    <View style={{flex:5,flexDirection:"column",padding:15}}>
                                        <View style={styles.cutLine}></View>
                                        <View style={{flex:1,justifyContent:"center"}}>
                                            <Text style={{fontSize:16,marginLeft:(deviceWidth)/18 - 15 + 5}}>店铺产品分类</Text>
                                        </View>
                                        <View style={{flex:2.5}}>
                                            <FlatList
                                                horizontal = {true}
                                                data = {goodsDetailShopKindFlatListData}
                                                renderItem = {this._goodsDetailShopKindFlatListRenderItem}
                                                keyExtractor = {(item) => item.key+item.Index}
                                            >
                                            </FlatList>
                                        </View>
                                    </View>
                                </View>
                            </View>
                            <View style = {styles.cutArea}></View>
                            <View style={styles.goodsShowContianer}>
                                <View style = {{flex:1,flexDirection:"row"}}>
                                    <View style={{width:5,backgroundColor:"red"}}></View>
                                    <View style={{paddingLeft:(deviceWidth)/18,flex:1,flexDirection:"row",alignItems:"center"}}>
                                        <Text style={{fontSize:22,color:"black"}}>商品详情</Text>
                                    </View>
                                </View>
                                <View style = {{flex:0.5}}></View>
                                <Image style={styles.goodsShowPic} source={{uri:this.state.goodInfo.g_url_2}}></Image>
                                <Image style={styles.goodsShowPic} source={{uri:this.state.goodInfo.g_url_3}}></Image>
                                <Image style={styles.goodsShowPic} source={{uri:this.state.goodInfo.g_url_4}}></Image>
                            </View>
                            <View style = {styles.cutArea}></View>
                            <View style={styles.goodsCommentContainer}>
                                <View style = {{height:(deviceHeight)/30,flexDirection:"row"}}>
                                    <View style={{width:5,backgroundColor:"red"}}></View>
                                    <View style={{paddingLeft:(deviceWidth)/18,paddingRight:(deviceWidth)/18,flex:1,flexDirection:"row",alignItems:"center",justifyContent:"space-between"}}>
                                        <Text style={{fontSize:18,color:"black"}}>商品评论（共{this.state.goodInfo.g_comments.length}条)</Text>
                                        <TouchableOpacity 
                                            // activeOpacity = {0.2}
                                            onPress = {()=>this._OpenGoodsCommentMorePress()}>
                                            <View>
                                                <Text style={{fontSize:12,color:"#707070"}}>>>显示全部</Text>
                                            </View>    
                                        </TouchableOpacity> 
                                    </View>
                                </View>
                                <View style = {[styles.goodsCommentItem,{height:this.state.goodsCommentItemHeight}]}>  
                                    <View style = {styles.cutLine}></View> 
                                    {this._createGoodsCommentItem(this.state.goodInfo,this.state.goodsCommentItemVisibleAmount)}
                                </View>
                            </View>
                            <View style = {{height:(deviceHeight)/10}}>
                                
                            </View>
                        </View>
                    </ScrollView>
                    <View style = {styles.bottomCartBtnContianer}>
                        <TouchableOpacity 
                            // activeOpacity = {0.2}
                            onPress = {()=>this._goToCartPress()}>
                            <View 
                                style = {{flex:1,width:59,alignContent:'center',justifyContent:"center",flexDirection:'column'}}>
                                <Feather
                                    name = 'shopping-cart'
                                    size = {30}
                                    color = 'black'
                                ></Feather>
                                <View  
                                       style = {{height:5}}>
                                </View>
                                {this.state.cartAmount != 0 ? this._createCircleCartAmount():<View></View>}
                                <View ref = "cartPic" onLayout={(e) => this._onLayout}>
                                    <Text>购物车</Text>  
                                </View> 
                            </View>  
                        </TouchableOpacity>
                        <TouchableOpacity 
                            // activeOpacity = {0.2}
                            onPress = {this._addToCartPress.bind(this,this.state.userInfo.u_name)}>
                            <View style = {{flex:1,width:((deviceWidth)-(deviceWidth)/3.5-59)/2,backgroundColor:"#EEC591",justifyContent:'center',alignItems:'center'}}>
                                <Text style={{fontSize:18}}>加入购物车</Text>
                            </View>  
                        </TouchableOpacity>
                        <TouchableOpacity 
                            // activeOpacity = {0.2}
                            onPress = {()=>this._onPurchasePress()}>
                            <View style = {{flex:1,width:((deviceWidth)-(deviceWidth)/3.5-59)/2,backgroundColor:"#FF8C00",justifyContent:'center',alignItems:'center'}}>
                                <Text style={{fontSize:18}}>立即购买</Text>
                            </View>  
                        </TouchableOpacity>
                    </View>
                </View>
                <Animated.View  style = {[styles.animatedViewContainer,{right:this.state.goodsCommentItemPageRight}]}>
                    <View style = {styles.cutLine}></View>
                    <View style={{paddingRight:(deviceWidth)/18,flex:1,flexDirection:"row"}}>
                        <View style = {{flex:1}}></View>
                        <View style = {{flex:1,justifyContent:'center',alignItems:'center'}}>
                            <Text style={{fontSize:20,color:"black"}}>所有评论</Text>
                        </View>
                        <View style = {{flex:1,justifyContent:'center',alignItems:'flex-end'}}>
                            <TouchableOpacity 
                                // activeOpacity = {0.2}
                                onPress = {()=>this._closeGoodsCommentShowMorePress()}>
                                <AntDesign
                                    name={'close'}
                                    size={26}
                                    color="#707070"
                                />    
                            </TouchableOpacity>  
                        </View>  
                    </View> 
                    <View style = {styles.cutLine}></View>
                    <View style = {{flex:12}}>
                        <FlatList
                            data = {commentItemFlatlistData}
                            renderItem = {this._createCommentFlatListRenderItem}
                            keyExtractor = {(item) => item.key+item.Index}
                        >  
                        </FlatList>
                    </View>      
                </Animated.View >
            </View>
            ) 
        }  
    }
}

const styles = StyleSheet.create({
    ShowGoodPageContainer:{
        flex:1
    },
    redCircleContainer:{
        position:'absolute',
        top:3,
        right:8,
        zIndex:2,
        width:18,
        height:18,
        borderRadius:18,
        borderColor:'red',
        borderWidth:1,
        justifyContent:'center',
        alignItems:'center'
    },
    redCircleText:{
        fontSize:9,
        color:'red'
    },
    titleContainer:{
        zIndex:2,
        flexDirection:"row",
        alignItems : 'center',
        height:deviceHeight/10,
        backgroundColor:"#FF8C00",
        paddingTop:deviceHeight/40,
        position:"absolute",
        top:0,
        bottom:0,
        right:0,
        left:0,
    },
    cutArea:{
        height:(deviceHeight)/50,
        backgroundColor:"#F4F4F4" 
    },
    cutLine:{
        height:2,
        backgroundColor:"#F4F4F4"
    },
    titleFlatlistContainer:{
        flexDirection:'row',
        position:"relative",
        flex:6,
    },
    titleFlatListItemContainer:{
        justifyContent:"center",
        width:(deviceWidth)/8*6/3,
        alignItems:'center',
    },
    titleFlatListBtn:{
        alignItems:'center',
        justifyContent:"center",
        height:35,
    },
    titleNavigateBtn:{
        alignItems:"center",
        justifyContent:"center",
        height:deviceHeight/20,
        width:deviceHeight/20,
        borderRadius:deviceHeight/20
    },
    goodInfoContainer:{
        zIndex:1,
        position:"absolute",
        top:0,
        right:0,
        left:0
    },
    goodsDetailContianer:{
        flexDirection:"column",
        height:(deviceHeight)/2,
        backgroundColor:"white",
        paddingTop:15,
        borderTopWidth : 2,
        borderTopColor : '#F4F4F4',
    },
    goodsDetailShopContainer:{
        flex:5,
        flexDirection:"column",
        justifyContent:"center",
        paddingTop:(deviceHeight)/80
    },
    goodsDetailShopTitleContainer:{
        paddingLeft:(deviceWidth)/18,
        flex:1,
        flexDirection:"row",
        alignItems:"center",
        paddingRight:20,
    },
    goodsDetailShopTitleTextContainer:{
        flex:1,
        alignItems:'flex-start',
    },
    goodsDetailShopTitleBtnContainer:{
        flex:1,
        alignItems:'flex-end',
    },
    goodsDetailShopTitleBtn:{
        flex:1,
        width:(deviceWidth)/4,
        justifyContent:"center",
        alignItems:"center",
        borderColor:"#FF8C00",
        borderWidth:1,
        borderRadius:20,
    },
    ShopKindFlatItemContainer:{
        height:(deviceHeight)/8.5,
        width:(deviceWidth - 15 - 15)/4,
        flexDirection:'column',
        justifyContent:'center',
        borderColor: '#F2F2F2',
        borderWidth: 1,
        alignItems:'center',
        paddingBottom:10,
        paddingTop:20
    },
    goodsShowContianer:{
        height:(deviceHeight)*1.5,
        flexDirection:"column",
        paddingTop:(deviceHeight)/80
    },
    goodsShowPic:{
        flex:12
    },
    goodsCommentContainer:{
        flexDirection:"column",
        paddingTop:(deviceHeight)/80
    },
    goodsCommentItem:{
        paddingTop:15
    },
    bottomCartBtnContianer:{
        borderTopWidth : 2,
        borderTopColor : '#848484',
        height:59,
        paddingLeft:(deviceWidth)/3.5,
        flexDirection:"row",
    },
    animatedViewContainer:{
        zIndex:15,
        height:(deviceHeight)-(deviceHeight)/10 - (deviceHeight)/9.3,
        flexDirection:"column",
        width:(deviceWidth),
        backgroundColor:"white",
        position:"absolute",
        top:(deviceHeight)/10,
        bottom:(deviceHeight)/9.3,
    }
})
