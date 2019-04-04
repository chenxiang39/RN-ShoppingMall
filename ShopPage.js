import React, {Component} from 'react';
import {FlatList,ScrollView,SectionList,StyleSheet,Image, Text, View ,TextInput , Button,TouchableOpacity} from 'react-native';
import UserDataModel from './viewModel/UserDataModel'
import {Dimensions} from 'react-native';
import CommonStackHeader from './common/component/CommonStackHeader'
import sectionListGetItemLayout from 'react-native-section-list-get-item-layout'
import SmallKindAndGoodsListDataModel from './viewModel/SmallKindAndGoodsListDataModel'
import LoadingPage from './common/component/LoadingPage'
import apiHelper from './common/apiHelper'
import GoodsService from './service/GoodsService'
global.deviceWidth = Dimensions.get('window').width
global.deviceHeight = Dimensions.get('window').height
global.FlatListBtnAmount = 8 //flatlist屏幕放item的个数
global.sectionListHeaderHeight = (deviceHeight) / 20 //sectionList头部的高度
global.FlatListBtnHeight =  (deviceHeight-deviceHeight/13-deviceHeight/38)/FlatListBtnAmount   //flatList一个item的高度
global.sectionListItemRowHeight = (deviceHeight) / 3 -30     //sectionList一个内部的item的高度
global.sectionListItemRowWidth = (deviceWidth) / 8*3     //sectionList一个内部的item的宽度
global.FlatListBottomCount = 2  //flatlist内容光标离底部最小单位值
export default class ShopPage extends Component{
    constructor(props){
      super(props);
      this.state = {
        userInfo:[],
        shopName:"",
        Is_LoadingFinsh:false,  //页面是否已经加载完数据
        GoodsAPIData : -1, //从API拿到的商品种类及对应商品信息的数组
        GoodsInfo : -1 ,  //从商品种类及对应商品信息的数组(用于展示)
        PressIndex : 0 ,//左边滚动栏选中的下标（从0开始）(默认选中第一个)
        ShopPageIndex : -1  //从商品页面进到此页时选中的小类下标
        }
    }
    static navigationOptions =  ({ navigation, state })=>({
        title: null,
        header : null,
        headerTintColor: 'white',
        headerStyle: {
            backgroundColor: '#FF8C00',
            height:deviceHeight/13,
        },
        headerTitle:navigation.getParam('shopName'),
        headerTitleStyle:{
            fontSize:22
        }
    });
    componentWillMount(){
        const {navigation} = this.props
        this.setState({
            userInfo : navigation.getParam('userInfo'),
            shopName : navigation.getParam('shopName')
        })    
    }   
    //此处使用监听事件是为了防止用户从繁复的跳转中重复加载此页，让别的页面跳过来不需要用push的方法加载新的堆栈
    componentDidMount(){
        this.Is_GoodsRefreshed = [this.props.navigation.addListener('willFocus', () => this.freshPageFunction()),]; //路由改变时增加读取数据的监听事件
        // this.Is_GoodsLeave = [this.props.navigation.addListener('didBlur',()=>this.cleanFunction()),]  //路由离开这个页面时增加的监听事件
    }

     //离开页面进前一页的操作(堆栈往回的页面)
    componentWillUnmount(){ 
        this.setState({
            GoodsInfo : -1,  //重置内容
            shopName : "",
            GoodsAPIData : -1,
            ShopPageIndex : -1
        })
    }


    //从其他页面进入此页面做的事情放这里（非后退进这个页面做的事情）
    async freshPageFunction(){
        const {navigation} = this.props
        let g_smallkindIndexTemp = navigation.getParam('g_smallkind_index')
        if( g_smallkindIndexTemp !== undefined){            //检测是否是从ShopPage跳转过来的
            this.setState({
                ShopPageIndex:g_smallkindIndexTemp
            })
        }
        this.setState({                    //刚开始loading
            Is_LoadingFinsh:false
        })
        await this.fetchGoodsAPIData(this.state.shopName)
        if(this.state.GoodsAPIData != -1){
            await this.createGoodsInfoByGoodsAPIData(this.state.GoodsAPIData)
            this.setState({
                Is_LoadingFinsh:true    //加载完成
            })  
        }
    }
    //根据输入的商店名向API请求商店的信息及商店卖的商品的信息并赋值给this.state.GoodsAPIData
    async fetchGoodsAPIData(shopName){
        let shopNameData = {
            's_name':shopName
        }
        await GoodsService.loadShopAllDetailByShopName(shopNameData)
        let API = apiHelper.getAPI()
        if(API.status == 200){
            this.setState({
                GoodsAPIData: SmallKindAndGoodsListDataModel.addScAndGoodsList(API.reuslt.goods.GoodsList)
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
    //根据GoodsAPIData的数据加载GoodsInfo
    createGoodsInfoByGoodsAPIData(GoodsAPIData){
        if(this.state.ShopPageIndex == -1){
            this.setState({
                GoodsInfo:GoodsAPIData
            })
        }
        else{
            let tempGoodsData = this.state.GoodsAPIData
            let tempGoodsDataItem =  tempGoodsData[0]
            tempGoodsData[0] = tempGoodsData[this.state.ShopPageIndex]
            tempGoodsData[this.state.ShopPageIndex] = tempGoodsDataItem
            this.setState({
                GoodsInfo:tempGoodsData
            })
        }
    }
    //加载一行的flatlist(同时根据选中的情况对应加载样式)
    _flatListRenderItem = (Info) =>{
        return  (
            <TouchableOpacity 
                activeOpacity = {1}
                onPress = {()=>this._onflatListBtnPress(Info.item.Index)}>
                <View style = {[styles.FlatListBtn,{backgroundColor: Info.item.Index == this.state.PressIndex ? 'white':'transparent'}]}>
                    <View style={{height:28,width:5,backgroundColor: Info.item.Index == this.state.PressIndex ? 'red' : 'rgba(0,0,0,0)'}}/>
                    <Text style = {[{fontSize:Info.item.Index == this.state.PressIndex ? 20:18},{fontWeight:Info.item.Index == this.state.PressIndex ? 'bold':'normal'}]}>{Info.item.key}</Text>
                    <View style={{width:5}}></View>
                </View>
            </TouchableOpacity>
        )
    }
    //加载sectionList具体内容中的一项
    _sectionListRenderItemRow(item,index){
        return(
            <TouchableOpacity 
                key={index}
                // activeOpacity = {0.2}
                onPress = {()=>this._onsectionListBtnPress(item.g_id)}>
                <View style={styles.sectionListItemRow}>
                    <Image style={{flex:3}} source={{uri:item.g_url}}></Image>
                    <View style={{flex:2,flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                        <Text style={{fontSize:14}}>{item.g_name}</Text>
                    </View>
                    <View style={{flex:1,flexDirection:"row",alignItems:"center"}}>
                        <View style={{flex:3,flexDirection:"column",alignItems:"flex-start"}}>
                            <Text style={{flex:1,fontSize:14}}>¥{item.g_price}</Text>
                            <Text style={{flex:1,fontSize:12}}>库存:{item.g_stock}</Text>
                        </View>
                        {/* <TouchableOpacity style={{flex:1}}>
                            <Image style={{width:30,height:30}} source={require('./images/ShoppingCart_icon.jpeg')}></Image>
                        </TouchableOpacity>  */}
                    </View>
                </View>
            </TouchableOpacity>
        )
    }
    //加载sectionList具体内容（与_sectionListRenderItemRow()配合使用）
    _sectionListRenderItem = (Info) =>{
        return(
            <View style={styles.sectionListItemContainer}>
                {Info.item.map((item,index)=>
                    this._sectionListRenderItemRow(item,index)
                )}
            </View>
        )
    }
    //加载sectionList头部内容
    _sectionListRenderHeader = ({section})=>{
        return (
            <View style={styles.sectionListHeaderContainer}>
                <Text style={{fontSize:20}}>{section.key}</Text>
            </View>
        )
    }
    //为sectionList写预加载
    _getSectionListItemLayout = sectionListGetItemLayout({
        getItemHeight:(data,sectionIndex,rowIndex)=>{
            return(
                Math.ceil((GoodsData[sectionIndex].data[0].length/2))*sectionListItemRowHeight
            )
        },
        getSectionHeaderHeight:()=> sectionListHeaderHeight
    })
    
    //使左边的FlatList能感应到右边的SectionList
    _sectionListLinkToFlatList = (Info) =>{ 
        for (var i = 0;i < GoodsData.length;i++){
            if(Info.viewableItems[0] !== undefined){
                if(Info.viewableItems[1] !== undefined){
                    if (Info.viewableItems[0].item.key == GoodsData[i].key || Info.viewableItems[1].item.key == GoodsData[i].key){   //如果屏幕划动中到sectionListHeader及对应内容时让flatList有标识
                        if(i == 0){
                            this.refs["flatlist"].scrollToIndex({
                                index:i,
                                animated:true
                            }) 
                        }
                        if(FlatListBottomCount>FlatListBtnAmount - i - 1){
                            this.refs["flatlist"].scrollToIndex({
                                index:i - (FlatListBtnAmount-FlatListBottomCount-1),
                                animated:true
                            }) 
                        }　
                        this.setState({
                            PressIndex:i
                        })  
                    }
                }
                else{
                    if (Info.viewableItems[0].item.key == GoodsData[i].key){   //如果屏幕划动中到sectionListHeader时让flatList有标识
                        if(FlatListBottomCount>FlatListBtnAmount - i - 1){
                            this.refs["flatlist"].scrollToIndex({
                                index:i - (FlatListBtnAmount-FlatListBottomCount-1),
                                animated:true
                            }) 
                        }　
                        this.setState({
                            PressIndex:i
                        })   
                    }
                }  
            }   
        }  
    }
    _onflatListBtnPress(Index){
        //点击左边滚动栏种类图标触发的功能
        this.refs["sectionlist"].scrollToLocation({animated:true,itemIndex:0,sectionIndex: Index,viewOffset:sectionListHeaderHeight - 1}) // -1为了防止Flatlist点击按钮响应出错的问题
            // var count = 0
            // for(let i = 0;i<Info.item.Index;i++){
            //     count += GoodsData[i].data.length + 2
            // }
            // this.refs["sectionlist"].scrollToIndex({animated: true, index: count})

            // this.setState({
            //     PressIndex:Info.item.Index
            // })     //加了这段话会让动画执行两次，故注释掉！！！！！！！！！！！！
    }
    _onsectionListBtnPress(ItemId){
        //点击右边sectionList每一块的按钮触发的功能
        const {navigation} = this.props
        navigation.push('ShowGoodPage',{
            userInfo:this.state.userInfo,
            goodId:ItemId
        })
    }
    render(){
        const {navigation} = this.props 
        if(!this.state.Is_LoadingFinsh){
            return (
                <LoadingPage></LoadingPage>
            )
        }
        else{
            //根据GoodsInfo的数据处理flatlist的内容
            let KindData = this.state.GoodsInfo.map((item,index)=>{     
                let tempData = {}
                tempData.key = item.GoodsKind
                tempData.Index = index
                return tempData
            })

            //根据GoodsInfo的数据处理sectionlist的内容
            global.GoodsData = this.state.GoodsInfo.map((item,index)=>{     
                let tempData = {}
                tempData.key = []
                tempData.data = []
                tempData.key.push(item.GoodsKind)
                tempData.data.push(item.GoodsList)
                return tempData
            })
            // const VIEWABILITY_CONFIG = {
            //     viewAreaCoveragePercentThreshold: 1,
            // };
           
            const {navigation} = this.props
            return(
                <View style={styles.ShowGoodsPageContainer}>
                    <CommonStackHeader Title = {navigation.getParam('shopName')} navigation = {navigation}></CommonStackHeader>
                    <View style = {styles.GoodsInfoContainer}>
                        <View style = {styles.FlatListContainer}>
                            <FlatList
                                ref = "flatlist"
                                data = {KindData}
                                showsVerticalScrollIndicator={false}
                                getItemLayout = {(data,index)=>({length:FlatListBtnHeight,offset:index*FlatListBtnHeight,index})}
                                renderItem = {this._flatListRenderItem}
                                keyExtractor = {(item) => item.key}
                            />
                        </View>
                        <View style = {styles.SectionListContainer}>
                            <SectionList
                                ref = "sectionlist"
                                sections={GoodsData}
                                showsVerticalScrollIndicator={false}
                                renderItem = {this._sectionListRenderItem}
                                renderSectionHeader = {this._sectionListRenderHeader}
                                getItemLayout = {this._getSectionListItemLayout} 
                                onViewableItemsChanged = {this._sectionListLinkToFlatList}
                                keyExtractor = {(item, index) => item + index}
                                stickySectionHeadersEnabled = {true}
                                // viewabilityConfig = {VIEWABILITY_CONFIG}
                            />
                        </View>
                    </View>
                    {/* <View style = {styles.bottomCartBtnContianer}>
                        <TouchableOpacity 
                            // activeOpacity = {0.2}
                            onPress = {()=>this._goToCartPress()}>
                            <View style = {{flex:1,width:59,alignContent:'center',justifyContent:"center",flexDirection:'column'}}>
                                <Feather
                                    name = 'shopping-cart'
                                    size = {30}
                                    color = 'black'
                                ></Feather>
                                <View style = {{height:5}}></View>
                                <Text>购物车</Text>
                            </View>  
                        </TouchableOpacity>
                    </View> */}
                </View>
            )
        }      
    }
}

const styles = StyleSheet.create({
    tabBarIcon: {
        width: 21,
        height: 21,
    },  
    ShowGoodsPageContainer:{
        flex:1,
    },
    GoodsInfoContainer:{
        flex: 1,
        flexDirection:'row',
    },
    FlatListContainer:{
        flex:1,
        backgroundColor:"#F4F4F4",
    },
    FlatListBtn:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between',
        height:FlatListBtnHeight,
        alignItems:'center',
    },
    SectionListContainer:{
        flex:3,
    },
    sectionListHeaderContainer:{
        flex:1,
        flexDirection:"row",
        justifyContent:"center",
        alignItems:"center",
        height:sectionListHeaderHeight,
        backgroundColor:"#cccccc"
    },
    sectionListItemContainer:{
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
    },
    sectionListItemRow:{
        flexDirection:"column",
        padding:10,
        width: sectionListItemRowWidth,
        height:sectionListItemRowHeight,
    },
    bottomCartBtnContianer:{
        borderTopWidth : 2,
        borderTopColor : '#848484',
        height:59,
        paddingLeft:(deviceWidth)/3.5,
        flexDirection:"row",
    }
})
