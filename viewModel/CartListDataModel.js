import GoodsDataModel from './GoodsDataModel'
function addCartList(data){                     // data = User
    let newUser = {}
    if(data){
        newUser.TotalPrice = data.total != undefined ? data.total:""
        newUser.cartList = []
        if(data.cartList){
            for (let i = 0 ; i < data.cartList.length ; i++){
                let newCartItem = {}
                newCartItem.shopName = data.cartList[i].s_name
                newCartItem.goodsList = addNewGoodsList(data.cartList[i].goodInfo)    
                newUser.cartList.push(newCartItem)
            }
        }
    }
    
    return newUser
}


function addNewGoodsList(data){             //data == cartList[x].goodInfo
    let newGoodsList = []
    if(data){
        for(let i = 0 ; i < data.length ; i++){
            let newGood = GoodsDataModel.newGood(data[i])
            newGoodsList.push(newGood)
        }
    }
    return newGoodsList
}

const CartListDataModel = {
    addCartList : addCartList
}

export default CartListDataModel