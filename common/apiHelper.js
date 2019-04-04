global.status = 0
global.result_kind = ""
global.result = {}
async function fetch_POST_URL(URL,sendData,ContentType){
   await fetch(URL, {
      method: "POST",
      headers: {
         "Content-Type": ContentType
      },
      body: JSON.stringify(sendData)
    }).then((response) => response.json())
    .then((responseData)=>{
       status = responseData.status
       result_kind = responseData.result_kind
       result = responseData.result
    })
    .catch((error)=>{
       status = 404
       result_kind = "ERROR"
       result = {
          'msg':'向服务器发送请求失败！'
       }
    });
}

async function fetch_GET_URL(URL){
    await fetch(URL).then((response)=>response.json()).then((responseData)=>{
      status = responseData.status
      result_kind = responseData.result_kind
      result = responseData.result
    })
    .catch((error)=>{
       status = 404
       result_kind = "ERROR"
       result = {
           'msg':'向服务器发送请求失败！'
       }
    });
}

function getAPI(){
    let API = {"status":status,
            "result_kind":result_kind,
            "reuslt":result
         }
     return API
  }


const apiHelper = {
    fetch_POST_URL:fetch_POST_URL, //以post的方式向服务器发送请求的方法（需要URL,传给服务器的数据及发给服务器内容的格式）
    fetch_GET_URL:fetch_GET_URL, //以get的方式向服务器请求数据(需要URL)
    getAPI:getAPI  //接收api返回的状态码，信息及内容(在执行任何向服务器发送请求的方法后都需要执行此方法获取API返回的内容,最好紧跟在请求方法后面)
}

export default apiHelper