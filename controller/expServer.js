const express =require('express')
const fileUpload= require('express-fileupload')
const model= require('../model/check.js')


const app=express()
app.use(express.urlencoded({
    extended:false
}))


app.use(fileUpload())

app.use(express.static('../view'))

app.get("/",(req,res)=>{
res.sendFile("./index.html")
})
app.post("/detect",(req,res)=>{
res.write('searching for ' +  req.body.algorithm_type +':\n' )
var type_algo =  req.body.algorithm_type
console.log(type_algo)
if(req.files){
    var file =req.files.normal_file
    var result= file.data.toString()
    
    var file2 =req.files.anomaly_file
    var result2= file2.data.toString()

    res.write(result)
    res.write(result2)

}
res.end()

})


app.listen(8080)















