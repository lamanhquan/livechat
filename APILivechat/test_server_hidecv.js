import axios from 'axios'

const TestApi = async ()=>{
    try{
        const response = await axios.get('http://43.239.223.148:8000/test_server');
        if(response && response.data){
            console.log(response.data,new Date());
        }
        else{
            console.log("Loi api");
            await axios.get("http://43.239.223.148:3000/restart/hidecv");
        }
    }
    catch(e){
        console.log(e);
        await axios.get("http://43.239.223.148:3000/restart/hidecv");
    }
}
setInterval(()=>{
    TestApi();
},15000)
