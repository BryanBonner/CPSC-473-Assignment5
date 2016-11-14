var main = function () {
	"using strict"
	
	var socket = io();
	var url = "http://localhost:3000/trivia";
	var question, userAnswer, score,
	    qObj = {id: null, question: null}, connectCount = 0,
	    answeredCount = 0, usedQuestions = [], scoreObj = {};
	
	// SOCKET IO .on
	socket.on('user join', function(msg) {
		connectCount++;
		$('#users').append($('<p>').text(msg));
		$('#user').append($('<p>').text('Username: ' + msg));
	});

	socket.on('game start', function(question){
		//pass the question id to ALL clients in order to correctly POST answer for each client
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
			$('#outcome').empty();
			$('#outcome').append($('<p>').text('Last question: ' + msg['correct'].toUpperCase()));
		}
	});

	socket.on('user scores', function(scoreObj) {
		$('#user-score').empty();
		$('#user-score').append($('<p>').text('Right, Wrong Score: ' + scoreObj['score']));
	});
	// END SOCKET IO

	//GET a question & if succesful emit it to all users
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

	// Get the score and emit to all users
	function getScore() {
		$.ajax({
			type: 'GET',
			url: url + '/score',
			contentType: 'application/json',
			dataType: 'json',
			data: scoreObj,
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

	//Start the game - only clicked once for each user who joins the competition
	$('#start').click(function() {
		getQuestion();
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
					socket.emit('user answers', response);
				}
			});
		}
	});
};

$(document).ready(main);
