import GoodsDataModel from './GoodsDataModel'
import  moment from 'moment';
function addUser(data){       //data == User
    let newUser = {}
    if (data){
        newUser.u_id = data._id != undefined ? data._id : ""
        newUser.u_name = data.u_name != undefined ? data.u_name : ""
        newUser.u_password = data.u_password != undefined ? data.u_password : ""
        newUser.cartList = []
        newUser.addressList = []
        newUser.orderList = []
        if(data.cartList){
            for(let i = 0;i < data.cartList.length;i++){
                newUser.cartList.push(add_cartList(data.cartList[i]))
            }
        }
        if(data.addressList){
            for(let i = 0;i < data.addressList.length;i++){
                newUser.addressList.push(add_addressList(data.addressList[i]))
            }
        }
        if(data.orderList){
            for(let i = 0;i < data.orderList.length;i++){
                newUser.orderList.push(add_orderList(data.orderList[i]))
            }
        }
    }
    return newUser
}

function add_cartList(data){               //data == User.cartList[x]
    let newcartList = {}
    newcartList = data
    return newcartList
}

function add_addressList(data){               //data == User.addressList[x]
    let newaddressList = {}
    newaddressList.a_id = data._id ? data._id : ""
    newaddressList.a_name = data.a_name ? data.a_name : ""
    newaddressList.a_tel = data.tellphone ? data.tellphone : ""
    newaddressList.a_IsDefault = data.a_state ? data.a_state : ""
    return newaddressList
}
function add_orderList(data){           //data == User.orderList[x]
    let neworderList = {}
    neworderList.o_id = data._id != undefined ? data._id : ""
    neworderList.deliveryInfo = data.addressInfo != undefined ? add_addressList(data.addressInfo):{}
    neworderList.goodInfo = data.good != undefined ? GoodsDataModel.newGood(data.good):{}
    neworderList.createDate = data.createDate != undefined ? moment(data.createDate).format("YYYY-MM-DD HH:mm:ss"):""
    neworderList.commentFlag = data.flag != undefined ? data.flag:""        //评论的flag 1为可以评论，0为不能评论
    return neworderList
}

const UserDataModel = {
    addUser : addUser
}
export default UserDataModel



