import React, {Component} from 'react';
import {FlatList,ScrollView,RefreshControl,Animated,SectionList,StyleSheet,Image, Text, View ,TextInput , Button,TouchableOpacity} from 'react-native';
import UserDataModel from './viewModel/UserDataModel'
import UserService from './service/UserService'
import apiHelper from './common/apiHelper'
import CommonStackHeader from './common/component/CommonStackHeader'
import AntDesign from 'react-native-vector-icons/AntDesign';
import LoadingPage from './common/component/LoadingPage'
import {Dimensions} from 'react-native';
global.deviceWidth = Dimensions.get('window').width
global.deviceHeight = Dimensions.get('window').height
global.needPostCommentGoodId  = ""  //存放需要发表的评论的商品Id
export default class MyOrderListPage extends Component{
    constructor(props){
        super(props);
        this.state = {
            userInfo : -1,  //用户信息 
            orderListInfo:-1,  //用户订单信息
            Is_Refresh : false,  //下拉刷新的状态
            Is_LoadingFinsh:false,  //页面是否已经加载完数据
            commentPageRight : new Animated.Value(-(deviceWidth)),   //编辑地址的遮罩层，默认不显示
            editComment : ""  //编辑的评论
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
    
    //进入页面要做的所有方法全部放在里面
    async freshPageFunction(){
        this.setState({                    //刚开始loading
            Is_LoadingFinsh:false
        })
        await this.fetchOrderListInfoByUser()
        if(this.state.orderListInfo != -1){
            this.setState({
                Is_LoadingFinsh:true    //加载完成
            }) 
        }
    } 
    //根据用户信息向API请求用户的信息并将订单信息赋值给this.state.orderListInfo
    async fetchOrderListInfoByUser(){
        let user = {
            'u_name':this.state.userInfo.u_name,
        }
        await UserService.loadOrderListByUsername(user)
        let API = apiHelper.getAPI()
        if(API.status == 200){  
            this.setState({
                orderListInfo:UserDataModel.addUser(API.reuslt.User).orderList
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
    //离开页面要做的事全部放这里
    cleanFunction(){
        this.setState({
            orderListInfo:-1,       ////重置内容
            userInfo : -1,
            commentPageRight : new Animated.Value(-(deviceWidth))
        })
    }

    componentDidMount(){
        this.freshPageFunction()
    }
    componentWillUnmount(){
        this.cleanFunction()
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
    //flatList的渲染
    _orderFlatListRenderItem = (Info) => {
        return(
            <TouchableOpacity
                // activeOpacity = {1}
                onPress = {this._onGoodPress.bind(this,Info.item.key.goodInfo.g_id)}
                style = {styles.flatListItemContainer}
            >
                <View style = {styles.flatListGoodItemPicContainer}>
                    <Image style = {styles.flatListGoodItemPic} source = {{uri:Info.item.key.goodInfo.g_url}}></Image>
                </View>
                <View style = {styles.flatListGoodsItemContentContainer}>
                    <View style = {styles.flatListGoodsNameAndCreateTimeContainer}>
                        <Text style = {styles.flatListGoodsName}>{Info.item.key.goodInfo.g_name}</Text>
                    </View>
                    <View style = {styles.flatListGoodsNameAndCreateTimeContainer}>
                        <Text style = {styles.flatListCreateTime}>订单创建时间:{Info.item.key.createDate}</Text>
                    </View>
                    <View style = {styles.flatListGoodsItemPriceAndBtnContainer}>
                        <View style = {styles.commentGoodBtnContainer}>
                            {Info.item.key.commentFlag == 1 ? <TouchableOpacity 
                                // activeOpacity = {0.2}
                                onPress = {this._onCreateCommentBtn.bind(this,Info.item.key.goodInfo.g_id)}
                                style = {styles.commentGoodBtn}>
                                <Text style={styles.commentGoodBtnText}>评论商品</Text>   
                            </TouchableOpacity>:<View></View>}
                        </View>
                        <View style = {styles.flatListGoodsItemAndPriceContainer}>
                            <View style = {styles.flatListGoodsPrice}>
                                <Text style = {styles.flatListGoodsPriceText}>¥{Info.item.key.goodInfo.g_price}</Text>
                            </View>
                            <View style = {styles.flatListAmount}>
                                <AntDesign
                                    name = 'close'
                                    size = {14}
                                    color = 'black'
                                >
                                </AntDesign>
                                <Text style = {styles.flatListAmountText}>{Info.item.key.goodInfo.g_cartAmount}</Text> 
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }
    _commentPageRender(){
        return(
            <Animated.View style = {[styles.animatedViewContainer,{right:this.state.commentPageRight}]}>
                <View style = {styles.cutLine}></View>
                <View style={{paddingRight:(deviceWidth)/18,flex:1,flexDirection:"row"}}>
                    <View style = {{flex:1}}></View>
                    <View style = {{flex:1,justifyContent:'center',alignItems:'center'}}>
                        <Text style={{fontSize:20,color:"black"}}>发表评论</Text>
                    </View>
                    <View style = {{flex:1,justifyContent:'center',alignItems:'flex-end'}}>
                        <TouchableOpacity 
                            // activeOpacity = {0.2}
                            onPress = {this._closeEditPagePress.bind(this)}>
                            <AntDesign
                                name={'close'}
                                size={26}
                                color="#707070"
                            />    
                        </TouchableOpacity>  
                    </View>  
                </View>
                <View style = {styles.cutLine}></View>
                <View style = {styles.commentPageContainer}>
                    <View style = {styles.commentPageItemContainer}>
                        <View style = {styles.commentPageItem}>
                            <TextInput ref="CommentInput" style = {styles.Input} 
                                placeholder="请输入评论内容"
                                clearButtonMode = "while-editing"
                                onChangeText={(text) => {
                                this.setState({
                                    editComment:text
                                })
                            }}
                            />
                        </View>
                        <TouchableOpacity 
                            opacity = {0.2} 
                            onPress={this._postComment.bind(this)}
                        >
                            <View style = {[styles.TransparentEditBtnContainer,this.HandleBtnStyle()]}>
                                <Text style = {{fontSize:16,color:'white'}}>确认发表</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View> 
            </Animated.View>
        )
    }
      
    //根据输入的内容处理按钮样式
    HandleBtnStyle(){
        if(this.state.editComment != ""){
          this.btnStyleFlag = true
        }else{
          this.btnStyleFlag = false
        }
        return this.btnStyleFlag ? styles.EditBtnContainer : ''
    }
    _closeEditPagePress(){
        //关闭遮罩层的按钮
        this.refs["CommentInput"].clear()
        Animated.timing(                  
            this.state.commentPageRight,            
            {
              toValue: -(deviceWidth),                   
              duration: 300,              
            }
        ).start();
    }
    _onCreateCommentBtn(g_id){
        //点击商品栏部分的评论商品按钮触发的功能
        needPostCommentGoodId = g_id
        Animated.timing(                  // 随时间变化而执行动画
            this.state.commentPageRight,            // 动画中的变量值
            {
              toValue: 0,                  
              duration: 300,              // 让动画持续一段时间
            }
        ).start(); 
    }
    async _postComment(){
        //点击遮罩层中确认发表按钮触发的功能
        if(this.state.editComment != ""){
            let commandData = {
                'u_name':this.state.userInfo.u_name,
                'g_id':needPostCommentGoodId,
                'comment':this.state.editComment
            }
            await UserService.postComment(commandData)
            let API = apiHelper.getAPI()
            if(API.status == 200){
                if(API.result_kind == 'SUCCESS'){
                    await this.freshPageFunction()
                    this._closeEditPagePress()
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
        else{
            alert("请输入评论!")
        }
    }
    _onGoodPress(g_id){
        //点击商品栏按钮触发的功能
        const {navigation} = this.props
        navigation.navigate('ShowGoodPage',{
            userInfo:this.state.userInfo,
            goodId:g_id
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
            let orderListData = this.state.orderListInfo.map((item,index)=>{
                let newOrderList = {}
                newOrderList.key = item
                newOrderList.Index = index
                return newOrderList
            })
            return(
                <View style = {styles.MyOrderListPageContainer}>
                    <CommonStackHeader Title = '我的订单' navigation = {navigation}></CommonStackHeader> 
                    <View style = {styles.flatListContainer}>
                        <FlatList
                            data = {orderListData}
                            renderItem = {this._orderFlatListRenderItem}
                            keyExtractor = {(item) => item.key + item.Index}
                            refreshControl = {
                                <RefreshControl
                                    ref = "RefreshControl"
                                    refreshing = {this.state.Is_Refresh}  
                                    onRefresh = {this.reFreshFunction.bind(this)}
                                    title = {this.state.Is_Refresh?'刷新中.....':'下拉刷新'}
                                />
                            }
                        ></FlatList>
                    </View>
                    {this._commentPageRender()}
                </View>
            )   
        }
    }
}

const styles = StyleSheet.create({
    MyOrderListPageContainer:{
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
    flatListContainer:{
        flex:1,      
    },  
    flatListItemContainer:{
        flexDirection:'row',
        height:125,
        paddingBottom:10,
        paddingTop:10,
        paddingRight:10
    },
    flatListItemTitleContainer:{
        flex:1,
        flexDirection:'row',
        alignItems:'center',
    },
    flatListGoodItemPicContainer:{
        flex:1,
        justifyContent:'center',
        alignItems:'center',
        paddingLeft:5,
    },
    flatListGoodItemPic:{
        height:90,
        width:90,
    },
    flatListGoodsItemContentContainer:{
        flex:2.5,
        flexDirection:'column',
        paddingTop:10
    },
    flatListGoodsNameAndCreateTimeContainer:{
        flex:1
    },
    flatListGoodsName:{
        fontSize:14,
        color:'black'
    },
    flatListCreateTime:{
        fontSize:11,
        color:'#8B7B8B'
    },
    flatListGoodsItemPriceAndBtnContainer:{
        flex:1,
        flexDirection:'row'
    },
    commentGoodBtnContainer:{
        flex:2, 
        paddingTop:2,
        paddingBottom:2,
        justifyContent:'center',
        alignItems:'flex-start',
    },
    commentGoodBtn:{
        flex:1,
        width:(deviceWidth-60)/4,
        justifyContent:"center",
        alignItems:"center",
        borderColor:"#FF8C00",
        borderWidth:1,
        borderRadius:20
    },
    commentGoodBtnText:{
        fontSize:12,
        color:'#FF8C00'
    },
    flatListGoodsItemAndPriceContainer:{
        flex:1,
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
    },
    flatListGoodsPrice:{
        justifyContent:'flex-end',
        alignItems:'flex-end',
    },
    flatListGoodsPriceText:{
        fontSize:18,
        color:'red'
    },
    flatListAmount:{
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center'
    },
    flatListAmountText:{
        fontSize:14,
        color:'black'
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
    commentPageContainer:{
        flex:12
    },
    commentPageItemContainer:{
        marginTop:30,
        height:150,
        flexDirection:'column',
        paddingLeft:25,
        paddingRight:25
    },
    commentPageItem:{
        height:60
    },
    Input:{
        height : 40,
        borderBottomColor: '#666666',
        borderBottomWidth: 1,
        fontSize: 18,
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
