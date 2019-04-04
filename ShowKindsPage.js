import React, {Component} from 'react';
import {FlatList,ScrollView,SectionList,StyleSheet,Image, Text, View ,TextInput , Button,TouchableOpacity} from 'react-native';
import UserDataModel from './viewModel/UserDataModel'
import GoodsDataModel from './viewModel/GoodsDataModel'
import apiHelper from './common/apiHelper'
import UserService from './service/UserService'
import GoodsService from './service/GoodsService'
import SearchHeader from './common/component/SearchHeader'
import AntDesign from 'react-native-vector-icons/AntDesign';
import {Dimensions} from 'react-native';
import LoadingPage from './common/component/LoadingPage'
global.deviceWidth = Dimensions.get('window').width
global.deviceHeight = Dimensions.get('window').height
global.FlatListBtnAmount = 8 //flatlist屏幕放item的个数
global.FlatListBtnHeight =  (deviceHeight-78-50)/FlatListBtnAmount   //flatList一个item的高度
export default class ShowGoodsPage extends Component{
    constructor(props){
      super(props);
      this.state = {
            userInfo:[],    //用户信息
            Is_LoadingFinsh:true,  //页面是否已经加载完数据
            KindsInfo : [],  //商品大类的数组
            G_scList:-1,    //商品小类的数组
            PressIndex : 0 //左边滚动栏选中的下标（从0开始）(默认选中第一个)
        }
    }
    //导航栏样式的配置（此处只配置底部导航栏）
    static navigationOptions = {
        tabBarLabel: '分类',
        tabBarIcon: ({focused}) => {
            if(focused){
                return (
                    <AntDesign
                        name = 'appstore-o'
                        size = {26}
                        color = '#FF8C00'
                    >
                    </AntDesign>
                );
            }
            else{
                return (
                    <AntDesign
                        name = 'appstore-o'
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
        const {navigation} = this.props
        if(navigation.getParam('pressIndex') != undefined){         //如果从首页的选大类的跳转处理
            this.setState({
                PressIndex : navigation.getParam('pressIndex')
            })
        }  
        await this.loadKindsInfo()  
        if (this.state.KindsInfo.length !== 0){        //如果商品信息请求成功,则做页面加载的工作，否则卡在loading页面
            await this.loadSmallKindByMainKind(this.state.PressIndex)       //进页面加载默认的种类
            if(this.state.G_scList.length !== 0){
                this.setState({              
                    Is_LoadingFinsh:true     //加载完成
                })  
            } 
        }
    } 
    //离开页面要做的事全部放这里
    cleanFunction(){
        this.setState({
            KindsInfo : [],  
            G_scList:[],   
        })
    }
    componentWillMount(){
        const {navigation} = this.props
        this.setState({
            userInfo : navigation.getParam('userInfo')
        })
        
    }
    componentDidMount(){
        this.Is_GoodsRefreshed = [this.props.navigation.addListener('willFocus', () => this.freshPageFunction()),]; //BottomTab路由改变时增加读取数据的监听事件
        this.Is_GoodsLeave = [this.props.navigation.addListener('didBlur',()=>this.cleanFunction()),]  //BottomTab路由离开这个页面时增加读取数据的监听事件
    }
    

    //向api请求所有的大类信息并加载到state.KindsInfo中
    async loadKindsInfo(){
        await GoodsService.loadAllMainkind()
        let API = apiHelper.getAPI()
        if (API.status == 200){
            this.setState({
                KindsInfo:GoodsDataModel.addGoods(API.reuslt.goods)
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
    //根据大类中的内容获得小类（传入的值为大类的下标）
    async loadSmallKindByMainKind(Index){
        let MainKind = {
            'g_kind':this.state.KindsInfo[Index].g_mainkind
        }
        await GoodsService.loadSmallKindByMainKind(MainKind)
        let API = apiHelper.getAPI()
        if (API.status == 200){
            this.setState({
                G_scList:GoodsDataModel.addGoods(API.reuslt.goods)
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

    async _onLeftFlatListBtnPress(Info){
        //点击左边滚动栏种类图标触发的功能
        this.setState({              //刚开始loading
            Is_LoadingFinsh:false
        })
        this.setState({
            G_scList:-1             //清空之前的数据
        })
        await this.setState({
            PressIndex:Info.item.Index
        })
        await this.loadSmallKindByMainKind(this.state.PressIndex)     
        if(this.state.G_scList.length !== -1 ){
            this.setState({                 //加载完成
                Is_LoadingFinsh:true
            })
        }
    }
    _onRightScrollViewBtnPress(Info){
        const {navigation} = this.props
        navigation.navigate('ShowGoodsListPage',{
            searchContent:Info,
            showCommand:'searchGoodsBySmallKind',
            userInfo:this.state.userInfo
        })
        //点击右边滚动栏种类图标触发的功能
    }
    //加载一行的flatlist(同时根据选中的情况对应加载样式)
    _leftFlatListRenderItem = (Info) =>{
        return  (
            <TouchableOpacity 
                activeOpacity = {1}
                onPress = {()=>this._onLeftFlatListBtnPress(Info)}>
                <View style = {[styles.leftFlatListBtn,{backgroundColor: Info.item.Index == this.state.PressIndex ? 'white':'transparent'}]}>
                    <View style={{height:28,width:5,backgroundColor: Info.item.Index == this.state.PressIndex ? 'red' : 'rgba(0,0,0,0)'}}/>
                    <Text style = {[{fontSize:Info.item.Index == this.state.PressIndex ? 20:18},{fontWeight:Info.item.Index == this.state.PressIndex ? 'bold':'normal'}]}>{Info.item.key}</Text>
                    <View style={{width:5}}></View>
                </View>
            </TouchableOpacity>
        )
    }
    _rightScrollViewItem(){
        let ScrollViewArr = []
        for(let i = 0;i < this.state.G_scList.length;i++){
            let newItem = 
                <TouchableOpacity 
                key = {i}
                activeOpacity = {0.2}
                style = {styles.rightScrollViewItemContainer}
                onPress = {()=>this._onRightScrollViewBtnPress(this.state.G_scList[i].g_smallkind)}>
                    <View style = {styles.rightScrollViewPicContainer}>
                        <Image style = {styles.rightScrollViewItemPic} source = {{uri:this.state.G_scList[i].g_smallkind_url}}></Image>
                    </View>
                    <View style = {styles.rightScrollViewTextContainer}>
                        <Text style = {styles.rightScrollViewItemText}>{this.state.G_scList[i].g_smallkind}</Text>
                    </View>
                </TouchableOpacity>
            ScrollViewArr.push(newItem)
        }
        return ScrollViewArr
    }
    render(){
         //根据KindsInfo的数据处理左边flatlist的内容
         let g_mainkindData = this.state.KindsInfo.map((item,index)=>{     
            let tempData = {};
            tempData.key = item.g_mainkind;
            tempData.Index = index;
            return tempData
        })
        if(!this.state.Is_LoadingFinsh){
            return (
                <LoadingPage></LoadingPage>
            )
        }
        else{
            return(
                <View style={styles.ShowGoodsPageContainer}>
                    <SearchHeader userInfo = {this.state.userInfo}></SearchHeader>
                    <View style = {styles.KindsInfoContainer}>
                        <View style = {styles.leftFlatListContainer}>
                            <FlatList
                                ref = "leftFlatlist"
                                data = {g_mainkindData}
                                showsVerticalScrollIndicator={false}
                                getItemLayout = {(data,index)=>({length:FlatListBtnHeight,offset:index*FlatListBtnHeight,index})}
                                renderItem = {this._leftFlatListRenderItem}
                                keyExtractor = {(item) => item.key}
                            />
                        </View>
                        <View style = {styles.rightScrollViewContainer}>
                            <ScrollView>
                                <View style = {styles.rightScrollViewRowContainer}>    
                                    {this._rightScrollViewItem()}
                                </View>
                            </ScrollView>
                        </View>
                    </View>
                </View>
            )
        }
    }
}

const styles = StyleSheet.create({
    ShowGoodsPageContainer:{
        flex:1,
    },
    KindsInfoContainer:{
        flex: 1,
        flexDirection:'row',
    },
    leftFlatListContainer:{
        flex:1,
        backgroundColor:"#F4F4F4",
    },
    leftFlatListBtn:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between',
        height:FlatListBtnHeight,
        alignItems:'center',
    },
    rightScrollViewContainer:{
        flex:3
    },
    rightScrollViewRowContainer:{
        flex:1,
        flexDirection:'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
    },
    rightScrollViewItemContainer:{
        width:(deviceWidth)/4,
        height:90,
        flexDirection:'column',
    },
    rightScrollViewPicContainer:{
        flex:3,
        justifyContent:'center',
        alignItems:'center',
    },
    rightScrollViewItemPic:{
        height:50,
        width:50,
        borderRadius:10
    },
    rightScrollViewTextContainer:{
        flex:1,
        justifyContent:'center',
        alignItems:'center',
    },
    rightScrollViewItemText:{
        fontSize:16,
        color:'black'
    }
})
