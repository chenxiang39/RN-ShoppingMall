function addGoods(data){         // data == goods
    let newGoodsList = []
    if(data){
        for(let i = 0;i < data.length;i++){
            newGoodsList.push(newGood(data[i]))
        }
    }
    return newGoodsList
}
function newGood(data){            // data == goods[x]
    let newGood = {}
    newGood.g_comments = []
    if(data){
        newGood.g_id =  data._id ? data._id:"",
        newGood.g_name = data.g_name ? data.g_name:"",
        newGood.s_name = data.s_name ? data.s_name:"",
        newGood.g_price = data.g_cost != undefined ? data.g_cost:"",
        newGood.g_mainkind = data.g_kind ? data.g_kind:"",  //商品主类
        newGood.g_mainkind_url = data.g_kp ? data.g_kp:"",
        newGood.g_stock = data.g_number != undefined ? data.g_number:"",  //商品库存
        newGood.g_url = data.g_picture ? data.g_picture:"", //商品对应的图片
        newGood.g_url_2 = data.g_picture_2 ? data.g_picture_2:"",//商品详情三幅图
        newGood.g_url_3 = data.g_picture_3 ? data.g_picture_3:"",
        newGood.g_url_4 = data.g_picture_4 ? data.g_picture_4:"",
        newGood.g_salesamount = data.g_sales != undefined ? data.g_sales: "", //商品销量
        newGood.g_smallkind = data.g_sc ? data.g_sc:"",   //商品次级类
        newGood.g_smallkind_url = data.g_scp ? data.g_scp:"",
        newGood.g_cartAmount = data.g_buy != undefined ? data.g_buy : ""    //商品在购物车中的数量
        if(data.g_comment){
            for(let i = 0 ;i < data.g_comment.length;i++){
                newGood.g_comments.push(newComment(data.g_comment[i]))
            }
        }
    }
    return newGood
}
function newComment(data){              // data == goods[x].g_comment
    let newComment = {}
    newComment.Username = data.u_name ? data.u_name:"",
    newComment.u_comment = data.c_comment ? data.c_comment:""
    return newComment
}
const GoodsDataModel = {
    addGoods:addGoods,
    newGood:newGood
}

export default GoodsDataModel