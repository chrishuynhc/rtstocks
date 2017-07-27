var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var axios = require('axios');

var port = (process.env.PORT || 3000);
var fetchInterval = 20000;

function getStock(socket, ticker){

	console.log('GETTING TICKER: ' + ticker);

	axios.get('http://localhost:8080/api/' + ticker)
        .then(function(response) {

        		if (response.data.error == false){
        			 var data = {

		            	ticker: response.data.ticker,
		            	price: response.data.price,
		            	volume: response.data.volume,
		            	sign: response.data.sign,
		            	percentChange: response.data.percentChange,
		            	timeLastSale: response.data.timeLastSale,
		            	pLastSale: response.data.pLastSale,
		            	volumeLastSale: response.data.volumeLastSale,
		            	news: response.data.news	
					}

					socket.emit(data.ticker, data);
        		} else {
        			socket.emit('invalid');
        		}           
	});
}

function update(socket, ticker){

	getStock(socket, ticker);

	var timer = setInterval(function() {
        getStock(socket, ticker);
    }, fetchInterval);

    socket.on('disconnect', function() {
    	console.log('disconnected');
        clearInterval(timer);
    });

    socket.on('invalid', function () {
    	console.log('Invalid ticker received from client. Ending updates...');
        clearInterval(timer);
    });
}

app.get('/', function(req, res) {

 	res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){

	console.log('We have a connection');

	socket.on('ticker', function(ticker){
		update(socket, ticker);
	});
});

server.listen(port, function(){
	console.log('Listening on port...');
})



