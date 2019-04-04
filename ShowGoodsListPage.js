import React, {Component} from 'react';
import {FlatList,ScrollView,SectionList,StyleSheet,Image, Text, View ,TextInput , Button,TouchableOpacity} from 'react-native';
import {Dimensions} from 'react-native';
import UserDataModel from './viewModel/UserDataModel'
import GoodsService from './service/GoodsService'
import apiHelper from './common/apiHelper'
import LoadingPage from './common/component/LoadingPage'
import GoodsDataModel from './viewModel/GoodsDataModel';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
global.deviceWidth = Dimensions.get('window').width
global.deviceHeight = Dimensions.get('window').height
global.OriginGoodsList = -1 //临时的goodlist(用于存储搜索的结果)
global.OriginExistedGoodsList = -1  //临时的goodlist(用于存储还有货的结果) 用this.state.goodsList赋值会导致事件触发多次时出错，故用此值来赋值）
class SearchHeader extends Component{
    constructor(props){
        super(props)
        this.state = {
            searchContent : "",
        }
    }
    _onSearchPress(){
        this.refs["searchInput"].clear()
        this.props.searchByHeader(this.state.searchContent)
    }
    render(){
        return (
            <View style = {styles.titleContainer}>
                <TouchableOpacity 
                    // activeOpacity = {0.2}
                    onPress = {()=>{
                        this.props.navigation.navigate("MainPage")
                    }}>
                    <AntDesign
                        name={'left'}
                        size={26}
                        color="white"
                    />
                </TouchableOpacity>
                <View style = {styles.searchContainer}>
                    <TouchableOpacity 
                        // activeOpacity = {0.2}
                        onPress = {()=>this._onSearchPress()}>
                        <Image
                            style={styles.searchBtnIcon}
                            source={require('./images/SearchBtn_icon.png')}
                        />
                    </TouchableOpacity>
                    <TextInput ref="searchInput" style = {styles.searchInput} 
                        placeholder = '请输入要搜索的内容'
                        clearButtonMode = 'while-editing'
                        fontSize = {18}  
                        onChangeText={(text) => {
                            this.setState({
                                searchContent:text
                            })
                        }}               
                    />
                </View>
            </View>
        )
    }
}

export default class ShowGoodsListPage extends Component{
    //价格和销量按钮有三种状态（normal,up,down）
    //显示有货按钮有两种状态(all,exist)
    constructor(props){
      super(props);
      this.state = {
        userInfo:[], //用户信息
        Is_LoadingFinsh:false,  //页面是否已经加载完数据
        goodsList : -1,//商品信息(默认无数据)（用来检查数据是否载入）
        searchContent : "",//用于接收搜索内容
        showGoodsList:[],//用于展示的商品信息
        showCommand : "",  //进这个商品页面时接收的指令（根据指令展示信息）
        saleBtnCommand : "normal",  //商品页面自身点击事件发出的指令 （根据指令展示信息）(初始状态为normal)(销量按钮)
        priceBtnCommand : "normal",  //商品页面自身点击事件发出的指令 （根据指令展示信息）(初始状态为normal)(价格按钮)
        stockBtnCommand : "all"    //商品页面自身点击事件发出的指令 （根据指令展示信息）(初始状态为all)(显示有货按钮)
      }
    }
    static navigationOptions =  ({ navigation, state })=>({
        title: null,
        header:null,
    });
    
    componentWillMount(){      //根据登录页面传来的值获取用户信息
        const {navigation} = this.props
        this.setState({
            userInfo : navigation.getParam('userInfo')
        })
        this.setState({
            showCommand : navigation.getParam('showCommand')   //接收页面跳转过来发出的指令
        })   

    }
    
      //从首页进入此页面要做的所有方法全部放在里面
      async freshPageFunction(){
        const {navigation} = this.props
        this.setState({                    //刚开始loading
            Is_LoadingFinsh:false
        }) 
         this.setState({
            saleBtnCommand : "normal",                 //进页面时,按钮回归默认值
            priceBtnCommand : "normal",  
            stockBtnCommand : "all"
        }) 
        if(this.state.showCommand === 'searchHotGoods'){
            await this.fetchAllGoodsList()  //向api请求所有商品信息  
            await this._sortBySaleBtn()      //默认按了两下排序按钮将其置为按销量降序排列
            await this._sortBySaleBtn()
            if (this.state.goodsList !== -1){        ////如果有商品信息
                this._createshowGoodsList(this.state.goodsList,50)      //根据商品信息创建showGoodsList(需传入展示的数量)   
                this.setState({
                    Is_LoadingFinsh:true    //加载完成
                })   
            }  
        }
        if(this.state.showCommand === 'searchGoodsByStringFromOtherPage'){
            await this.setState({
                searchContent : navigation.getParam('searchContent')
            })          
            await this.fetchGoodsListByString(this.state.searchContent)
            if (this.state.goodsList !== -1){        ////如果有商品信息
                this._createshowGoodsList(this.state.goodsList,99)      //根据商品信息创建showGoodsList(需传入展示的数量)   
                this.setState({
                    Is_LoadingFinsh:true    //加载完成
                })   
            }  
        } 
        if(this.state.showCommand === 'searchGoodsBySmallKind'){
            await this.setState({
                searchContent : navigation.getParam('searchContent')
            }) 
            await this.fetchGoodsListBySmallKind(this.state.searchContent)
            if (this.state.goodsList !== -1){        ////如果有商品信息
                this._createshowGoodsList(this.state.goodsList,99)      //根据商品信息创建showGoodsList(需传入展示的数量)   
                this.setState({
                    Is_LoadingFinsh:true    //加载完成
                })   
            } 
        }    
    }
    //离开页面进入非首页的页面要做的事全部放这里
    cleanFunction(){
        
    }

 

    componentDidMount(){
        this.freshPageFunction()    //从首页进入页面要做的事情
        // this.Is_GoodsRefreshed = [this.props.navigation.addListener('willFocus', () => this.freshPageFunction()),]; //BottomTab路由从非首页处后退进这一页面改变时增加读取数据的监听事件
        // this.Is_GoodsLeave = [this.props.navigation.addListener('didBlur',()=>this.cleanFunction()),]  //BottomTab路由离开这个页面进入非首页的页面时时增加读取数据的监听事件
    }

    componentWillUnmount(){ //离开页面进首页的操作
        this.setState({
            goodsList : -1,  //重置商品信息和搜索内容
            searchContent : ""
        })
    }
    //向api请求所有商品信息
    async fetchAllGoodsList(){
        await GoodsService.loadAllGood()
        let API = apiHelper.getAPI()
        if(API.status == 200){
            OriginGoodsList = GoodsDataModel.addGoods(API.reuslt.goods)
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

    //根据搜索的内容向api请求相应的商品信息
    async fetchGoodsListByString(searchContent){
        let searchData = {
            'name':searchContent
        }
        await GoodsService.loadGoodsByString(searchData)
        let API = apiHelper.getAPI()
        if(API.status == 200){  
            OriginGoodsList = GoodsDataModel.addGoods(API.reuslt.goods)
            this.setState({                                     //此值已经作废
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
    //根据给的小类向api请求相应的商品信息
    async fetchGoodsListBySmallKind(SmallKind){
        let SmallKindData = {
            'g_sc':SmallKind
        }
        await GoodsService.loadGoodsBySmallKind(SmallKindData)
        let API = apiHelper.getAPI()
        if(API.status == 200){  
            OriginGoodsList = GoodsDataModel.addGoods(API.reuslt.goods)
            this.setState({                                     //此值已经作废
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
    //用于从子组件SearchHeader接收搜索信息的方法
    async searchFromSearchHeader(searchContent){
        this.setState({              //刚开始loading
            Is_LoadingFinsh:false,
        }) 
        await this.setState({
            searchContent : searchContent
        })
        await this.setState({
            goodsList : -1,   //还原状态
            saleBtnCommand : "normal",     //一旦按了搜索键,按钮回归默认值
            priceBtnCommand : "normal",
            stockBtnCommand : "all" 
        })
        await this.fetchGoodsListByString(this.state.searchContent)
        if (this.state.goodsList !== -1){        ////如果有商品信息
            this._createshowGoodsList(this.state.goodsList,99)   
            this.setState({
                Is_LoadingFinsh:true    //加载完成
            })   
        }  
    }
    //根据给的商品列表及排序按钮的状态及对应的排序请求返回处理后的商品列表
    async fetchGoodsListBySortBtnCommand(GoodsList,reference,btnCommand){
        if(btnCommand == 'up'){
            if(reference == 'sales'){
                await GoodsService.upSalesGoodsList(GoodsList)
            }
            if(reference == 'price'){
                await GoodsService.upPriceGoodsList(GoodsList)
            }    
        }
        if(btnCommand == 'down'){
            if(reference == 'sales'){
                await GoodsService.downSalesGoodsList(GoodsList)  
            }
            if(reference == 'price'){
                await GoodsService.downPriceGoodsList(GoodsList)
            }
        }
        if(btnCommand == 'normal'){

        }
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

    //根据给的商品列表处理显示有货后的商品列表
    async fetchGoodsListByStockBtnCommand(GoodsList){
        await GoodsService.stockExistedGoodsList(GoodsList)
        let API = apiHelper.getAPI()
        if(API.status == 200){  
            OriginExistedGoodsList = GoodsDataModel.addGoods(API.reuslt.goods)
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
    //根据商品信息创建showGoodsList(需传入展示的数量和商品列表)
    _createshowGoodsList(goodList,count){
        let tempGoodsList = []
        let showGoodsList = []
        let loadAmount 
        if(goodList.length > count){
            loadAmount = count
        }
        else{
            loadAmount = goodList.length
        }
        for(let i = 0 ;i < goodList.length ; i++){
            let newGoods = {
                'g_id':goodList[i].g_id,
                'g_price':goodList[i].g_price,
                'g_name':goodList[i].g_name,
                'g_url': goodList[i].g_url,
                'g_salesamount': goodList[i].g_salesamount,
                's_name': goodList[i].s_name
            }
            tempGoodsList.push(newGoods) 
        }
        for(let i = 0 ; i < loadAmount ; i++){
            showGoodsList.push(tempGoodsList[i])
        }
        this.setState({
            showGoodsList:showGoodsList
        })
    }

    

    //根据内容表现flatlist的呈现方式
    _flatListRenderItem = (Info) => {
        return  (
            <TouchableOpacity 
                activeOpacity = {1}
                onPress = {()=>this._onflatListBtnPress(Info.item.key)}>
                <View style = {styles.flatListItemContainer}>
                    <Image style={{flex:1}} source={{uri:Info.item.data.g_url}}></Image>
                    <View style={{flex:2,flexDirection:"column",paddingTop:10}}>
                        <View style = {{flex:1,paddingLeft:20,justifyContent:"center"}}>
                           <Text style={{flex:1,fontSize:16}}>{Info.item.data.g_name}</Text> 
                        </View>
                        <View style = {{flex:1}}>
                        </View>
                        <View style = {{flex:1,paddingLeft:20}}>
                            <Text style={{flex:1,fontSize:16,color:"red"}}>¥{Info.item.data.g_price}</Text>
                            <View style={{flex:1,flexDirection:'row',justifyContent:'space-between',alignItems:"center"}}>
                                <Text style={{fontSize:14,color:"#cccccc"}}>销量:{Info.item.data.g_salesamount}</Text>
                                <TouchableOpacity onPress={()=>this._enterShopPress(Info.item.key)}>
                                    <View style={styles.button}>
                                        <Text style={{fontSize:16,color:"#9E9E9E"}}>进店>></Text>
                                    </View>
                                </TouchableOpacity>
                            </View>       
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }
    _sortBtn(){
        //后期加按钮的功能
        alert("排序")
    }

    //销量排序按钮的功能
    async _sortBySaleBtn(){
        let goodListArr = {}
        this.setState({              //刚开始loading
            Is_LoadingFinsh:false
        }) 
        // let goodListArr = {         //用于让API接收固定格式 （此方法作废，点击次数多会导致state值跟不上）
        //     goods:this.state.goodsList
        // }

        if(this.state.stockBtnCommand == 'all'){
            goodListArr = {
                goods:OriginGoodsList
            }
        }
        else if (this.state.stockBtnCommand == 'exist'){
            goodListArr = {
                goods:OriginExistedGoodsList
            }
        }
        
        await this.setState({
            goodsList : -1    //还原状态
        })
        await this.setState({
            priceBtnCommand : 'normal',      //刚点按钮时将其他按钮状态置回默认
            // stockBtnCommand:  'all'      //显示有货按钮不置回
        }) 
        if(this.state.saleBtnCommand == 'normal'&&goodListArr.goods.length !=0){      //商品数量不为0，则按钮才起作用
            await this.setState({
                saleBtnCommand : 'up'
            })     
        }
        else if(this.state.saleBtnCommand == 'up'){             //有商品了就无需检验商品数量了
            await this.setState({
                saleBtnCommand : 'down'
            })     
        }
        else if(this.state.saleBtnCommand == 'down'){
            await this.setState({
                saleBtnCommand : 'up'
            })     
        }
        await this.fetchGoodsListBySortBtnCommand(goodListArr,'sales',this.state.saleBtnCommand)
        if (this.state.goodsList !== -1){
            this._createshowGoodsList(this.state.goodsList,99)      //根据商品信息创建showGoodsList(需传入展示的数量)   
            this.setState({
                Is_LoadingFinsh:true    //加载完成
            })  
        }
    }
     //价格排序按钮的功能
     async _sortByPriceBtn(){
        let goodListArr = {} 
        this.setState({              //刚开始loading
            Is_LoadingFinsh:false
        }) 
        // let goodListArr = {         //用于让API接收固定格式 （此方法作废，点击次数多会导致state值跟不上）
        //     goods:this.state.goodsList
        // }
        if(this.state.stockBtnCommand == 'all'){
            goodListArr = {
                goods:OriginGoodsList
            }
        }
        else if (this.state.stockBtnCommand == 'exist'){
            goodListArr = {
                goods:OriginExistedGoodsList
            }
        }
        await this.setState({   
            goodsList : -1    //还原状态
        })
        await this.setState({
            saleBtnCommand : 'normal',      //刚点按钮时将其他按钮状态置回默认
            // stockBtnCommand:  'all'      //显示有货按钮不置回
        }) 
        if(this.state.priceBtnCommand == 'normal'&&goodListArr.goods.length !=0){      //商品数量不为0，则按钮才起作用
            await this.setState({
                priceBtnCommand : 'up'
            })     
        }
        else if(this.state.priceBtnCommand == 'up'){            //有商品了就无需检验商品数量了
            await this.setState({
                priceBtnCommand : 'down'
            })     
        }
        else if(this.state.priceBtnCommand == 'down'){
            await this.setState({
                priceBtnCommand : 'up'
            })     
        }
        await this.fetchGoodsListBySortBtnCommand(goodListArr,'price',this.state.priceBtnCommand)
        if (this.state.goodsList !== -1){
            this._createshowGoodsList(this.state.goodsList,99)      //根据商品信息创建showGoodsList(需传入展示的数量)   
            this.setState({
                Is_LoadingFinsh:true    //加载完成
            })  
        }
    }
    //显示有货按钮的功能
    async _checkByStockBtn(){
        this.setState({              //刚开始loading
            Is_LoadingFinsh:false
        }) 
        await this.setState({
            goodsList : -1    //还原状态
        })
        let tempGoodsList = {               //用于让API接收固定格式
            goods:OriginGoodsList
        }
        await this.setState({
            saleBtnCommand : 'normal',      //刚点按钮时将其他按钮状态置回默认
            priceBtnCommand : 'normal'  
        }) 
        if(this.state.stockBtnCommand == 'all'){     
            await this.fetchGoodsListByStockBtnCommand(tempGoodsList)
            await this.setState({
                stockBtnCommand : 'exist'
            })     
        }
        else if(this.state.stockBtnCommand == 'exist'){
            this.setState({                     //重新加载商品列表
                goodsList : OriginGoodsList
            })        
            this.setState({
                stockBtnCommand : 'all'
            })     
        }
        if (this.state.goodsList !== -1){
            this._createshowGoodsList(this.state.goodsList,99)      //根据商品信息创建showGoodsList(需传入展示的数量)   
            this.setState({
                Is_LoadingFinsh:true    //加载完成
            })  
        }
    }
    _onflatListBtnPress(i){
        //点击flatlist一块内容触发的功能
        const {navigation} = this.props
        navigation.navigate("ShowGoodPage",{
            goodId:this.state.showGoodsList[i].g_id,
            userInfo: this.state.userInfo
        })
    }
    _enterShopPress(i){
        //点击进店按钮触发的功能
        const {navigation} = this.props
        navigation.push("ShopPage",{
            shopName:this.state.showGoodsList[i].s_name,
            userInfo:this.state.userInfo
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
            let showGoodsList = this.state.showGoodsList.map((item,index)=>{     
                let tempData = {};
                tempData.key = index;
                tempData.data = item;
                return tempData
            })  
            return(
                <View style={styles.ShowGoodsPageContainer}>
                    <SearchHeader searchByHeader={(this.searchFromSearchHeader.bind(this))} navigation = {navigation}/>
                    <View style = {styles.sortBtnListContainer}>
                        <TouchableOpacity style = {styles.sortBtn}
                            activeOpacity = {1}
                            onPress = {()=>this._sortBySaleBtn()}>
                            <View style = {styles.sortBtnTextContainer}>
                                <Text style={styles.sortBtnText}>销量</Text> 
                            </View>
                            <View style = {[styles.sortBtnIconContainer,{width:this.state.saleBtnCommand == 'normal'?0:19}]}>
                                <MaterialIcons
                                    name = {this.state.saleBtnCommand == 'up'?'arrow-upward':'arrow-downward'}
                                    size={19}
                                    color="black"
                                >
                                </MaterialIcons>
                            </View>     
                        </TouchableOpacity> 
                        <TouchableOpacity style = {styles.sortBtn}
                            activeOpacity = {1}
                            onPress = {()=>this._sortByPriceBtn()}>
                            <View style = {styles.sortBtnTextContainer}>
                                <Text style={styles.sortBtnText}>价格</Text> 
                            </View>
                            <View style = {[styles.sortBtnIconContainer,{width:this.state.priceBtnCommand == 'normal'?0:19}]}>
                                <MaterialIcons
                                    name = {this.state.priceBtnCommand == 'up'?'arrow-upward':'arrow-downward'}
                                    size={19}
                                    color="black"
                                >
                                </MaterialIcons>
                            </View>     
                        </TouchableOpacity> 
                        {/* <TouchableOpacity style = {styles.sortBtn}
                            activeOpacity = {1}
                            onPress = {()=>this._sortBtn()}>
                            <Text style={styles.sortBtnText}>评分</Text>       
                        </TouchableOpacity>  */}
                        <TouchableOpacity style = {styles.sortBtn}
                            activeOpacity = {1}
                            onPress = {()=>this._checkByStockBtn()}>
                            <Text style={styles.sortBtnText}>{this.state.stockBtnCommand == 'all'?'显示有货':'显示全部'}</Text>    
                        </TouchableOpacity> 
                    </View>
                    <FlatList
                        data = {showGoodsList}
                        renderItem = {this._flatListRenderItem}
                        keyExtractor = {(item) => item.key + item.data}
                    />
                </View>
            )
        }
    }
}


const styles = StyleSheet.create({
    titleContainer:{
        flexDirection:"row",
        alignItems : 'center',
        height:deviceHeight/10,
        backgroundColor:"#FF8C00",
        paddingTop:deviceHeight/40,
        paddingLeft:deviceWidth/40,
    },
    searchContainer:{
        flexDirection:'row',
        alignItems:'center',
        marginLeft:deviceWidth/80,
        height:35,
        backgroundColor:"white",
        borderRadius:25,
        paddingLeft : 20,
    },
    searchBtnIcon:{
        height:26,
        width :26,
    },
    searchInput:{
        marginLeft:6,
        height:(deviceHeight)/11,
        width:deviceWidth - 4*26 -10,
    },
    ShowGoodsPageContainer:{
        flex:1,
    },
    sortBtnListContainer:{
        height:deviceHeight/16,
        flexDirection:'row',
        backgroundColor:"#EE9A49"
    },
    sortBtn:{
        flex:1,
        flexDirection:"row",
        justifyContent: 'center',
        alignItems:'center',
        borderBottomWidth : 1,
        borderBottomColor : '#F4F4F4',
    },
    sortBtnTextContainer:{
        // height:40,
        // width:40,
        // justifyContent: 'center',
        // alignItems:'flex-end',
    },
    sortBtnText:{
        fontSize:19
    },
    sortBtnIconContainer:{
        height:19
        // justifyContent: 'center',
        // alignItems:'flex-start',
    },
    flatListItemContainer:{
        height:(deviceHeight - deviceHeight/14 )/4,
        padding:(deviceHeight)/120,
        borderBottomWidth:1,
        borderBottomColor:"#F4F4F4",
        flexDirection:"row"
    },
    flatListImageContainer:{
        flex:2
    },
})