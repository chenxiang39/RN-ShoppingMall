import GoodsDataModel from './GoodsDataModel'
function addScAndGoodsList(data){         // data == GoodsList
    let newScAndGoodsList = []
    if(data){
        for(let i = 0;i < data.length;i++){
            let newScAndGoods = {}
            newScAndGoods.GoodsKind = data[i].g_sc ? data[i].g_sc : "",
            newScAndGoods.GoodsList = addNewGoodsList(data[i].goodInfo)  
            newScAndGoodsList.push(newScAndGoods)
        }    
    }
    return newScAndGoodsList
}

function addNewGoodsList(data){               // data == GoodsList[x].goodInfo
    let GoodsList = []
    if(data){
        for (let i = 0 ; i < data.length ; i++){
            let newGood = GoodsDataModel.newGood(data[i])
            GoodsList.push(newGood)
        }  
    } 
    return GoodsList
}

const SmallKindAndGoodsListDataModel = {
    addScAndGoodsList : addScAndGoodsList
}

export default SmallKindAndGoodsListDataModel