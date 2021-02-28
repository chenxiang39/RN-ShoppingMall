import apiHelper from '../common/apiHelper'
import ipconfig from '../ipconfig.json'

let port = ipconfig.ip

async function loadUser (data) {
   
   await apiHelper.fetch_POST_URL("http://"+port+":3000/User/u_login",data,"application/json")
}
async function saveUser (data) {
   await apiHelper.fetch_POST_URL("http://"+port+":3000/User/u_register",data,"application/json")
}
async function loadUserAddressListByUsername(data){
   await apiHelper.fetch_POST_URL("http://"+port+":3000/Address/findAddressListByUsername",data,"application/json")
}
async function loadDefaultAddressByUsername(data){
   await apiHelper.fetch_POST_URL("http://"+port+":3000/Address/loadDefaultAddress",data,"application/json")
}
async function loadCartListByUsername(data){
   await apiHelper.fetch_POST_URL("http://"+port+":3000/Cart/F_cartList",data,"application/json")
}
async function loadOrderListByUsername(data){
   await apiHelper.fetch_POST_URL("http://"+port+":3000/Pay/orderDetail",data,"application/json")
}
async function loadCartGoodsAmountByUsername(data){
   await apiHelper.fetch_POST_URL("http://"+port+":3000/Cart/checkCartAmount",data,"application/json")
}
async function addNewAddress(data){
   await apiHelper.fetch_POST_URL("http://"+port+":3000/Address/A_addressList",data,"application/json")
}
async function changeAddress(data){
   await apiHelper.fetch_POST_URL("http://"+port+":3000/Address/EXchangeAddress",data,"application/json")
}
async function changeDefaultAddress(data){
   await apiHelper.fetch_POST_URL("http://"+port+":3000/Address/changeDefaultAddress",data,"application/json")
}
async function addGoodIntoCart(data){
   await apiHelper.fetch_POST_URL("http://"+port+":3000/Goods/addCart",data,"application/json")
}
async function changeGoodAmountInCart(data){
   await apiHelper.fetch_POST_URL("http://"+port+":3000/Cart/CartNumber",data,"application/json")
}
async function deleteGoodInCart(data){
   await apiHelper.fetch_POST_URL("http://"+port+":3000/Cart/D_cartList",data,"application/json")
}
async function deleteAllGoodsInCart(data){
   await apiHelper.fetch_POST_URL("http://"+port+":3000/Cart/C_delate",data,"application/json")
}
async function createOrderList(data){
   await apiHelper.fetch_POST_URL("http://"+port+":3000/Pay/payment",data,"application/json")
}
async function postComment(data){
   await apiHelper.fetch_POST_URL("http://"+port+":3000/Comment/AddComment",data,"application/json")
}
const User = {
   loadUser : loadUser, //通过发送用户账号密码来向api请求获取用户信息，并返回结果
   saveUser : saveUser, //将用户信息返给api接收,将数据存入数据库，并返回结果
   loadUserAddressListByUsername : loadUserAddressListByUsername, //根据用户名返回收货地址列表
   loadDefaultAddressByUsername : loadDefaultAddressByUsername, //根据用户名返回默认收货地址
   loadCartListByUsername : loadCartListByUsername, //根据用户名返回购物车地址列表
   loadOrderListByUsername : loadOrderListByUsername, //根据用户名查询订单详情
   loadCartGoodsAmountByUsername : loadCartGoodsAmountByUsername, //根据用户名查询购物车商品数量
   addNewAddress : addNewAddress,  //根据给的信息将地址信息加入用户数据库中
   changeAddress : changeAddress,   //根据给的新地址等信息更改原来对应的地址
   changeDefaultAddress : changeDefaultAddress, //根据给的用户名和地址将地址设置成默认地址
   addGoodIntoCart : addGoodIntoCart,     //根据给的用户名和商品信息将物品添加进购物车
   changeGoodAmountInCart : changeGoodAmountInCart,   //根据给的商品信息和用户名更改购物车中的商品数量
   deleteGoodInCart : deleteGoodInCart,       //根据给的商品信息和用户名删除购物车中的商品
   deleteAllGoodsInCart : deleteAllGoodsInCart,    //根据给的用户名删除购物车中所有的商品
   createOrderList : createOrderList,   //根据给的商品信息及地址信息生成订单
   postComment : postComment  //根据给的用户信息和评论内容发表评论
}

export default User