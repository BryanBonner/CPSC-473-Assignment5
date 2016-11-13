var main = function () {
	"using strict"

	var socket = io();
	var url = "http://localhost:3000/trivia";
	var question, userAnswer, qObj = {id: null, question: null}, connectCount = 0,
			answeredCount = 0;

// SOCKET IO .on
socket.on('user join', function(msg){
	connectCount++;
	answeredCount = connectCount;
	$('#users').append($('<p>').text(msg));
	$('#user').append($('<p>').text(msg));
});

socket.on('game start', function(question){
	//pass the question id to ALL clients in order to correctly POST answer
	qObj.id = question.answerid;
	$('#foundQuestion').empty();
	$('#foundQuestion').append($('<p>').text(question.question));
	$('#start').hide();
});

socket.on('user answers', function(msg){
  answeredCount--;
	$('#outcome').append($('<p>').text(msg));
});
// END SOCKET IO

//GET a question & if succesful emit it to all connected sockets
function getQuestion() {
	$.ajax({
		type: 'GET',
		url: url + '/question',
		contentType: 'application/json',
		dataType: 'json',
		data:	question,
		success: function(question) {
			socket.emit('game start', question)
		},
		fail: function(question) {
			alert('failed');
		}
	});
};
function getConnectCount() {
	return connectCount;
}

// Get user name and emit that a user joined the game
	$('#join').click(function(){
		if($('#username').val() != '') {
			socket.emit('user join', $('#username').val());
	  	$('#username').val();
			$('#join').hide();
		}
		else alert("Enter username first");
	  return false;
	});

$('#start').click(function() {
	getQuestion();
});

$('#answer').click(function() {
	if($('#useranswer').val() == '' || null) {
		alert("Enter an answer before submitting");
	}
	else {
		qObj.question = $('#useranswer').val();
		$.ajax({
			type: 'POST',
			url: url + '/answer',
			contentType: 'application/json',
			dataType: 'json',
			data:	(JSON.stringify(qObj)),
			success: function(response) {
				socket.emit('user answers', response['correct']);
				getQuestion();
			}
		});
	}
})
};

$(document).ready(main);
