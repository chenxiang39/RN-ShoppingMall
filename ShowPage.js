import React, {Component} from 'react';
import {ScrollView,RefreshControl,DeviceEventEmitter,SectionList,StyleSheet,Image, Text, View ,TextInput , Button,TouchableOpacity} from 'react-native';
import Swiper from 'react-native-swiper';
import {Dimensions} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import UserDataModel from './viewModel/UserDataModel'
import SearchHeader from './common/component/SearchHeader'
import GoodsService from './service/GoodsService'
import apiHelper from './common/apiHelper'
import LoadingPage from './common/component/LoadingPage'
import GoodsDataModel from './viewModel/GoodsDataModel';
global.deviceWidth = Dimensions.get('window').width
global.deviceHeight = Dimensions.get('window').height
export default class ShowPage extends Component{
    constructor(props){
        super(props);
        this.state = {
            Is_LoadingFinsh:false,  //页面是否已经加载完数据
            userInfo : [], //用户信息
            goodsList : [],//商品信息
            advList: [], //广告轮播图图片资源以及对应商品的数据             
            goodsKindList:[],//滚轮图中的商品种类及对应的图片及介绍
            hotGoodsList:[],//热门商品的图片与介绍（默认4个）
            Is_Refresh : false,  //下拉刷新的状态
            swiperLoop:true  //轮播图的loop属性,下拉刷新时需禁用,使其在下拉刷新时的第一页不会自动向前滑一页
        }
    }
    //导航栏样式的配置（此处只配置底部导航栏）
    static navigationOptions = {
        tabBarLabel: '首页',
        tabBarIcon: ({focused}) => {
            if(focused){
                return (
                    <AntDesign
                        name = 'home'
                        size = {26}
                        color = '#FF8C00'
                    >
                    </AntDesign>
                );
            }
            else{
                return (
                    <AntDesign
                        name = 'home'
                        size = {26}
                        color = 'black'
                    >
                    </AntDesign>
                );
            }      
        },
    };
    //进入页面要做的所有方法全部放在里面
    async freshPageFunction(){
        this.setState({              //刚开始loading
            Is_LoadingFinsh:false
        })
        await this.fetchAllGoodsList()  //向api请求所有商品信息并赋值给state
        if (this.state.goodsList.length !== 0){        //如果商品信息请求成功,则做页面加载的工作，否则卡在loading页面
            this._createAdvList(4)      //根据商品信息创建轮播图用的advList(传入count,即随机抽count个商品展示,count需要大于0) 
            this._createGoodsKindList() //根据商品信息创建滚轮图用的用的goodsKindList
            this._createHotGoodsList()  //根据商品信息创建热门商品图片按钮用的hotGoodsList(默认展示4个商品)
            this.setState({              
                Is_LoadingFinsh:true     //加载完成
            }) 
        }
    } 
    //离开页面要做的事全部放这里
    cleanFunction(){
        this.setState({
            goodsList:[]  
        })
    }

    //下拉刷新的功能
    reFreshFunction(){
        this.setState({
            Is_Refresh:true
        })
        this.setState({
            swiperLoop:false        //在下拉刷新时禁用轮播图滑动回转功能（loop属性）
        })
        setTimeout(()=>{
            this.freshPageFunction()   
            this.setState({
                Is_Refresh:false
            }),
            this.setState({
                swiperLoop:true        //在下拉刷新时禁用轮播图滑动回转功能（loop属性）
            })
        },1000)
    }
    componentWillMount(){      //根据登录页面传来的值获取用户信息
        const {navigation} = this.props
        this.setState({
            userInfo : navigation.getParam('userInfo')
        })
    }
    componentDidMount(){
        this.Is_GoodsRefreshed = [this.props.navigation.addListener('willFocus', () => this.freshPageFunction()),]; //BottomTab路由改变时增加读取数据的监听事件
        this.Is_GoodsLeave = [this.props.navigation.addListener('didBlur',()=>this.cleanFunction()),]  //BottomTab路由离开这个页面时增加的监听事件
    }


    //向api请求所有商品信息 
    async fetchAllGoodsList(){
        await GoodsService.loadAllGood()
        let API = apiHelper.getAPI()
        if(API.status == 200){  
            this.setState({
                goodsList: GoodsDataModel.addGoods(API.reuslt.goods)
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
  

    //根据商品信息创建轮播图用的advList(随机抽count个商品展示,count需要大于0)
    _createAdvList(count){
        let tempArr = []
        let advArr = []
        let advList = []
        let LENGTH
        for(let i = 0;i<this.state.goodsList.length;i++){
            tempArr[i] = i 
        }
        if(count <= this.state.goodsList.length){       //判断数据库中的商品数是否大于count
            LENGTH = count
        }
        else{
            LENGTH = this.state.goodsList.length 
        }
        for (let i = 0;i<LENGTH;i++){  
            let tempIndex = Math.floor(Math.random()*this.state.goodsList.length)
            while(advArr[i] == null){
                if (tempArr[tempIndex] != null){
                    advArr[i] = tempArr[tempIndex]
                    tempArr[tempIndex] = null
                }
                else{
                    tempIndex = Math.floor(Math.random()*this.state.goodsList.length)
                }
            }
        }
        for (let i = 0 ;i < LENGTH;i++){
             let newAdv = {
                 'g_url':this.state.goodsList[advArr[i]].g_url,
                 'g_id':this.state.goodsList[advArr[i]].g_id
             }
            advList.push(newAdv)
        }
        this.setState({
            advList:advList
        })
    }
    //根据商品信息创建滚轮图用的用的goodsKindList
    _createGoodsKindList(){
        let goodsKindListMap = new Map()
        let goodsKindList = []
        for(let i = 0;i<this.state.goodsList.length;i++){
            goodsKindListMap.set(this.state.goodsList[i].g_mainkind,this.state.goodsList[i].g_mainkind_url)
        }
        for (let [key, value] of goodsKindListMap) {
            let newGoodsKind = {
                'g_mainkind':key,
                'g_mainkind_url':value
            }
            goodsKindList.push(newGoodsKind)
        }
        this.setState({
            goodsKindList:goodsKindList
        })
    }
    //根据商品信息创建热门商品图片按钮用的hotGoodsList(默认展示4个商品)
    _createHotGoodsList(){
        let hotGoodsList = []
        let tempGoodsList = []
        for(let i = 0;i<this.state.goodsList.length;i++){
            let newGood = {
                'g_id':this.state.goodsList[i].g_id,
                'g_url':this.state.goodsList[i].g_url,
                'g_salesamount':this.state.goodsList[i].g_salesamount,
            }
            tempGoodsList.push(newGood)
        }
        
        for(let i = 0;i<4;i++){
            let tempMAXGoods = tempGoodsList[0]
            for(let q = 0 ; q < tempGoodsList.length;q++){
                if(tempGoodsList[q].g_salesamount > tempMAXGoods.g_salesamount){
                    tempMAXGoods = tempGoodsList[q]
                }
            }
            hotGoodsList.push(tempMAXGoods)
            tempGoodsList.splice(tempGoodsList.indexOf(tempMAXGoods),1)
        }
        this.setState({
            hotGoodsList:hotGoodsList
        })
    }
    //通过数据渲染广告轮播图的内容（需要在swiper组件里加载）
    _renderAdvSwiper(){    
        let advArr = []
        for (let i = 0;i<this.state.advList.length;i++){
            advArr.push(
                <TouchableOpacity key={i}
                    activeOpacity = {1}
                    onPress = {()=>this._onShowAdvPress(i)}>
                <Image key={i} style={styles.advImg} source={{uri:this.state.advList[i].g_url}}></Image>
                </TouchableOpacity>
            );
        }
        return advArr
    }
    //滚轮图渲染一行的方法(与_renderShowKindScrollView()配合)
    _renderShowKindScrollViewRow(rowIndex){
        let showRowArr=[]
        for (let i = rowIndex;i<rowIndex+1;i++){
            if(this.state.goodsKindList[i]!==undefined){
                showRowArr.push(
                    <TouchableOpacity key={i}
                        activeOpacity = {1}
                        onPress = {()=>this._onShowKindPress(i)}>
                        <View style = {[styles.showItem]}>
                            <Image
                                style={styles.showImg}
                                source={{uri:this.state.goodsKindList[i].g_mainkind_url}}
                            />
                            <Text style={styles.showText}>
                                {this.state.goodsKindList[i].g_mainkind}
                            </Text>
                        </View>   
                        <View style = {{width:1,backgroundColor:'#F2F2F2'}}>
                        </View>                         
                    </TouchableOpacity> 
                )
            }  
        }
        return showRowArr
    }
    //通过数据渲染展示种类的滚轮图的内容（scollview组件中加载）
    _renderShowKindScrollView(){
        let showKindArr = []
        for (let i = 0;i<(this.state.goodsKindList.length)/2;i++){
            let rowIndex = 2*i
            showKindArr.push(
                <View style={[styles.show]} key={i}>
                    {this._renderShowKindScrollViewRow(rowIndex)} 
                    {this._renderShowKindScrollViewRow(rowIndex+1)} 
                </View>    
            )
        }
        return showKindArr
    }
    //渲染热门商品图片按钮一行的方法(_renderHotGoodsList()配合)
    _renderHotGoodsListRow(rowIndex){
        let HotGoodsListRow = []
        for(let i = rowIndex;i<rowIndex+2;i++){
            HotGoodsListRow.push(
                <View key={i} style={styles.hotGoodsListRow}>
                    <TouchableOpacity key={i} onPress={()=>this._onHotItemBtnPress(i)}>
                        <Image style={styles.hotGoodsListRowPic} source={{uri:this.state.hotGoodsList[i].g_url}}></Image>
                    </TouchableOpacity> 
                </View> 
            )
        }
        return HotGoodsListRow
    }
    //通过数据渲染热门商品图片按钮的内容(默认一行两个，一共四个商品)
    _renderHotGoodsList(){
        let hotGoodsList = []
        for(let i = 0;i<2;i++){
            hotGoodsList.push(
                <View style={{flexDirection:"row"}} key={i}>
                    {this._renderHotGoodsListRow(2*i)}
                </View>
            )
        }
        return hotGoodsList
    }
    _onShowAdvPress(i){
        //点击轮播图图片按钮触发的功能
        const {navigation} = this.props
        navigation.navigate("ShowGoodPage",{
            goodId:this.state.advList[i].g_id,
            userInfo: this.state.userInfo
        })
     }
 
     _onShowKindPress(i){
         //按下选择种类按钮触发的功能
        const {navigation} = this.props
        navigation.navigate('ShowKindsPage',{
            pressIndex:i
        }) 
     }
 
     _onMoreHotListBtnPress(){
         //按下热门商品中的（更多商品）触发的功能
        const {navigation} = this.props
        navigation.navigate("ShowGoodsListPage",{
             showCommand:'searchHotGoods',
             userInfo:this.state.userInfo
        })
     }
 
     _onHotItemBtnPress(i){
         //按下热门商品中的图片触发的功能
        const {navigation} = this.props
        navigation.navigate("ShowGoodPage",{
            goodId:this.state.hotGoodsList[i].g_id,
            userInfo: this.state.userInfo
        })
     }

    render(){
        if(!this.state.Is_LoadingFinsh){
            return (
                <LoadingPage></LoadingPage>
            )
        }
        else{
           return(
            <View style={styles.showPageContainer}>
                <SearchHeader userInfo = {this.state.userInfo}></SearchHeader>
                <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContainer}
                    refreshControl = {
                        <RefreshControl
                            ref = "RefreshControl"
                            refreshing = {this.state.Is_Refresh}  
                            onRefresh = {this.reFreshFunction.bind(this)}
                            title = {this.state.Is_Refresh?'刷新中.....':'下拉刷新'}
                        />
                    }>
                    <Swiper
                        ref = "Swiper"
                        // style={styles.swiper}          //样式
                        height={(deviceHeight)/3}        //组件高度
                        loop={this.state.swiperLoop}    //如果设置为false，那么滑动到最后一张时，再次滑动将不会滑到第一张图片。
                        autoplay={true}                //自动轮播
                        autoplayTimeout={4}                //每隔x秒切换
                        horizontal={true}              //水平方向，为false可设置为竖直方向
                        paginationStyle={{bottom: 20}} //小圆点的位置：距离底部x px
                        showsButtons={false}           //为false时不显示控制按钮
                        showsPagination={true}       //为false不显示下方圆点
                        dot={<View style={{backgroundColor:'#cccccc', marginLeft:8,width: 12, height: 12,borderRadius: 25}} />} //未选中的圆点样式 
                        activeDot={<View style={{backgroundColor:'#5599FF', marginLeft:8,width: 12, height: 12,borderRadius: 25}}/>} //选中的圆点样式                  
                    >
                    {this._renderAdvSwiper()}
                    </Swiper>
                    <View style = {styles.showItemsContainer}>
                        <ScrollView style = {styles.showItemsKindScrollViewContainer} 
                            showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} horizontal={true}>  
                            {this._renderShowKindScrollView()}         
                        </ScrollView>
                        <View style={styles.hotGoodsListContainer}>
                             <View style={styles.hotGoodsListTitle}>
                                 <Text style={{fontSize:19,textAlign:"center",flex:1}}>热门商品</Text>
                                 <View style={{flex:1,flexDirection:"row",justifyContent:'flex-end',paddingRight:10}}>
                                    <TouchableOpacity 
                                        activeOpacity = {0.2}
                                        onPress = {()=>this._onMoreHotListBtnPress()}>
                                        <Text style={{fontSize:14}}>>>更多商品</Text>
                                    </TouchableOpacity>
                                </View>
                             </View>
                             <View style={styles.hotGoodsListPic}>
                                   {this._renderHotGoodsList()}
                             </View>
                        </View>
                    </View>
                    <View style={{height:50}}>
                    </View>
                </ScrollView> 
            </View>
            ) 
        }  
    }
}

const styles = StyleSheet.create({
    showPageContainer:{
        flex:1,
        zIndex:10
    }, 
    scrollContainer:{
        backgroundColor:"#FF8C00",
    },
    advImg:{
        height:(deviceHeight)/3
    },
    showItemsContainer:{
        paddingTop:20,
        paddingLeft:(deviceWidth)/25,
        paddingRight:(deviceWidth)/25,
        position: 'relative'
    },
    showItemsKindScrollViewContainer:{
        height:deviceHeight/2.8,
        borderRadius:20,
        backgroundColor:"white",
    },
    show:{ 
        zIndex:2,
        flexDirection:'column',
        flex:1,
    },
    showItem:{
        zIndex:1,
        width:(deviceWidth-deviceWidth/12.5)/4,
        height:deviceHeight/5.6,
        paddingTop:(deviceHeight)/40,
        paddingLeft:(deviceWidth)/60,
        paddingRight:(deviceWidth)/60,
        paddingBottom:(deviceHeight)/80,
        // borderColor: '#F2F2F2',
        // borderWidth: 1,
    },
    showImg:{
        flex:5,
        borderRadius:10,
    },
    showText:{
        flex:2,
        fontSize: 14,
        marginTop:10,
        textAlign:'center'
    },
    hotGoodsListContainer:{
        flex:1,
        zIndex:2,
        flexDirection:'column',
        marginTop:20,
        height:deviceHeight/2.5,
        borderRadius:20,
        backgroundColor:"white",
        paddingTop:deviceHeight/90,
    },
    hotGoodsListTitle:{
        flex:1,
    },  
    hotGoodsListPic:{
        flex:5,
        flexDirection:'row',
        flexWrap:'wrap',
    },
    hotGoodsListRow:{
        height:(deviceHeight/2.5-deviceHeight/90)*5/12,
        width:(deviceWidth-deviceWidth/12.5)/2,
        justifyContent: 'center',
        alignItems:'center'
    },
    hotGoodsListRowPic:{
        height:(deviceHeight/2.5-deviceHeight/12)*5/12,
        width:(deviceWidth-deviceWidth/6)/2,
    }
})
