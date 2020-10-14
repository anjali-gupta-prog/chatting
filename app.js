var express = require('express');
var app = express();
app.use(express.static('public'));
var mysql = require('mysql');

app.use(function (  request,response,next){
    response.setHeader("Access-Control-Allow-Origin","*");
    next();
});
var server = require('http').createServer(app);

var io= require('socket.io')(server);


var connection = mysql.createConnection({
    host : "localhost",
    user : "root",
    password : "",
    database : "node_web_chat"
});

connection.connect(function (error){
    //show error if any
});
io.on("connection", function(socket){
    console.log('User connected', socket.id);

    socket.on("delete_message", function(msgid){
        console.log(msgid);
        connection.query("Delete from message where id = '"+msgid+"' ", function (error,result){
              // server send  same message to all client
            //send event to client                                                                  
              io.emit("delete_message", msgid);
        });
    });
    // server should listen from each client 
    socket.on("new_message", function(data){
        console.log("Client says", data);

        //server will send message to all client

        

        //save query in table
        connection.query("Insert into message (message) values ('"+data+"') ", function (error,result){
                // server send  same message to all client
            io.emit("new_message", {
                id: result.insertId,
                message : data
            });
        });

    });
});

app.get("/get_message", function(req,response){
    connection.query("Select * from message", function(err,res){
        response.end(JSON.stringify(res))
    });
});

app.get('/',function(req, res) {
    // res.send('hello anjali');
	res.sendFile(__dirname + '/client/index.html');
});
// app.use('/client',express.static(__dirname + '/client'));

console.log("Server started.");
 
server.listen(4141);