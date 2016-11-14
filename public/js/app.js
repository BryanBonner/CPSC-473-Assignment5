var main = function () {
	"using strict"

	var socket = io();
	var url = "http://localhost:3000/trivia";
	var question, userAnswer, score,
			qObj = {id: null, question: null}, connectCount = 0,
			answeredCount = 0, usedQuestions = [], scoreObj = {};

// SOCKET IO .on
socket.on('user join', function(msg){
	connectCount++;
	$('#users').append($('<p>').text(msg));
	$('#user').append($('<p>').text(msg));
});

socket.on('game start', function(question){
	//pass the question id to ALL clients in order to correctly POST answer
		getScore();
	qObj.id = question.answerid;
	$('#foundQuestion').empty();
	$('#foundQuestion').append($('<p>').text(question.question));
	$('#start').hide();
});

socket.on('user answers', function(msg){
	answeredCount++;
	if(answeredCount == connectCount) {
		answeredCount = 0;
		getQuestion();

		$('#outcome').append($('<p>').text(msg));
	}
});

socket.on('user scores', function(scoreObj) {
	var scoreRight = scoreObj['right'],
			scoreWrong = scoreObj['wrong'];
			console.log(scoreRight + scoreWrong);
	$('#outcome').append($('<p>').text(scoreRight));
});
// END SOCKET IO

//GET a question & if succesful emit it to all connected sockets
function getQuestion() {
	$('#answer').show();
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
			alert('failed to retrieve question');
		}
	});
};

function getScore() {
	$.ajax({
		type: 'GET',
		url: url + '/score',
		contentType: 'application/json',
		dataType: 'json',
		data:	scoreObj,
		success: function(scoreObj) {
			socket.emit('user scores', scoreObj);
		},
		fail: function(scoreObj) {
			alert('failed to retrieve score');
		}
	});
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
	getScore();
});

// User submits an answer to a question & emits user's response
	$('#answer').click(function() {
		if($('#useranswer').val() == '' || null) {
			alert("Enter an answer before submitting");
		}
		else {
			qObj.question = $('#useranswer').val();
			$('#answer').hide();
			$.ajax({
				type: 'POST',
				url: url + '/answer',
				contentType: 'application/json',
				dataType: 'json',
				data:	(JSON.stringify(qObj)),
				success: function(response) {
					socket.emit('user answers', response['correct']);
				}
			});
		}
	});
};

$(document).ready(main);
