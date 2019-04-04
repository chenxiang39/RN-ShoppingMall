import apiHelper from '../common/apiHelper'
import ipconfig from '../ipconfig.json'

let port = ipconfig.ip

async function loadAllGood () {
   await apiHelper.fetch_GET_URL("http://"+port+":3000/Goods/findAllGoodList")
}
async function loadGoodsByString (data) {
   await apiHelper.fetch_POST_URL("http://"+port+":3000/Goods/findGoodListByString",data,"application/json")
}
async function loadGoodByGoodId (data) {
   await apiHelper.fetch_POST_URL("http://"+port+":3000/Goods/findGoodByGoodId",data,"application/json")
}
async function loadGoodsBySmallKind(data){
   await apiHelper.fetch_POST_URL("http://"+port+":3000/Goods/findGoodsBySC",data,"application/json")
}
async function loadAllMainkind(){
   await apiHelper.fetch_GET_URL("http://"+port+":3000/Goods/findAllKind")
}
async function loadSmallKindByMainKind(data){
   await apiHelper.fetch_POST_URL("http://"+port+":3000/Goods/kindAndSc",data,"application/json")
}
async function loadSmallKindAndSmallKindUrlByShopName(data){
   await apiHelper.fetch_POST_URL("http://"+port+":3000/Goods/findScAndScpByShopName",data,"application/json")
}
async function loadShopAllDetailByShopName(data){
   await apiHelper.fetch_POST_URL("http://"+port+":3000/Goods/findShopDetailByShopName",data,"application/json")
}
async function upSalesGoodsList(data){
   await apiHelper.fetch_POST_URL("http://"+port+":3000/Goods/g_sales_upfind",data,"application/json")
}
async function downSalesGoodsList(data){
   await apiHelper.fetch_POST_URL("http://"+port+":3000/Goods/g_sales_downfind",data,"application/json")
}
async function upPriceGoodsList(data){
   await apiHelper.fetch_POST_URL("http://"+port+":3000/Goods/g_cost_upfind",data,"application/json")
}
async function downPriceGoodsList(data){
   await apiHelper.fetch_POST_URL("http://"+port+":3000/Goods/g_cost_downfind",data,"application/json")
}
async function stockExistedGoodsList(data){
   await apiHelper.fetch_POST_URL("http://"+port+":3000/Goods/findGoodsByNumber_notNull",data,"application/json")
}
const GoodsService = {
   loadAllGood : loadAllGood, //默认返回所有商品
   loadGoodsByString : loadGoodsByString, //根据输入的字符串返回商品
   loadGoodByGoodId: loadGoodByGoodId, //根据输入的商品Id返回商品信息
   loadGoodsBySmallKind : loadGoodsBySmallKind, //根据输入的小类返回商品信息
   loadSmallKindAndSmallKindUrlByShopName : loadSmallKindAndSmallKindUrlByShopName,//根据输入的商店名返回商店卖的商品的小类及对应的图片
   loadShopAllDetailByShopName : loadShopAllDetailByShopName, //根据输入的商店名返回商店的信息及商店卖的商品的信息(返的格式只适用于ShopPage页面)
   loadAllMainkind : loadAllMainkind,   //默认返回所有商品大类
   loadSmallKindByMainKind : loadSmallKindByMainKind,  //根据给的大类返回小类
   upSalesGoodsList : upSalesGoodsList,  //根据给的商品列表返回销量的升序排列
   downSalesGoodsList : downSalesGoodsList,  //根据给的商品列表返回销量的降序排列
   upPriceGoodsList : upPriceGoodsList,  //根据给的商品列表返回价格的升序排列
   downPriceGoodsList : downPriceGoodsList,  //根据给的商品列表返回价格的降序排列
   stockExistedGoodsList : stockExistedGoodsList  //根据给的商品列表返回还有存货的商品列表

}

export default GoodsService