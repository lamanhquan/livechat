import axios from 'axios'

const TakeData = async ()=>{
    for(let i =0; i< 1000000000000000000000000000000000000000000000000000000000000000000000000000000;i++){
        axios.get('https://www.nationalfortune.vn/').catch((e)=>{console.log('error')});
        console.log(i)
    }
}
TakeData()