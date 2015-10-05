var canvas;//canvas
var context;//context
var mouseX, mouseY;// マウスの位置座標
var canvasWidth;//canvasのwidth
var canvasHeight;//canvasのheight
// キー
var gBLeftPush = false;	// left
var gBRightPush = false;	// right
var gBUpPush = false;		// up
var gBDownPush = false;	// down
var myIcon;
//var otherIcon;
var icons = [];

var socket;

var myUniqueId;



$(document).ready(function(){
	console.log(peer);
	canvas = document.getElementById('canvas');
	context = canvas.getContext('2d');
	canvasWidth = canvas.width;
	canvasHeight = canvas.height;
	// canvas非対応
	if (!canvas || !canvas.getContext) {
		alert("html5に対応していないので、実行できません");
		return false;
	}
	// キーの登録
	window.addEventListener('keydown', KeyDown, true); //キーを押した時、呼び出される関数を指定
	window.addEventListener('keyup', KeyUp, true); //キーを離した時、呼び出される関数を指定

	//キーを押した時
	function KeyDown(event) {
		var code = event.keyCode;       // どのキーが押されたか
		switch(code) {
			case 37:// ←キー
				gBLeftPush = true;
				break;
			case 39:// →キー
				gBRightPush = true;
				break;
			case 38:// ↑キー
				gBUpPush = true;
				break;
			case 40:// ↓キー
				gBDownPush = true;
				break;
			case 13:
				if (event.shiftKey) { // Shiftキーも押された
					event.preventDefault();
					myIcon.SendChat();
					socket.emit('emit_from_client_sendMsg', {str: myIcon.str, chatShowCount: myIcon.chatShowCount});
				}
		}
	}

	//キーを離した時
	function KeyUp(event) {
		code = event.keyCode;
		switch(code) {
			case 37:// ←キー
				gBLeftPush = false;
				break;
			case 39:// →キー
				gBRightPush = false;
				break;
			case 38:// ↑キー
				gBUpPush = false;
				break;
			case 40:// ↓キー
				gBDownPush = false;
				break;
		}
	}

//	//-------------------------------------マイク取得
//	//エラー処理
//	var errBack = function(e){
//		console.log("Web Audio error:",e.code);
//	};
//	//WebAudioリクエスト成功時に呼び出されるコールバック関数
//	function gotStream(stream){
//		//streamからAudioNodeを作成
//		var mediaStreamSource = audioContext.createMediaStreamSource(stream);
//		mediaStreamSource.connect(filter);
//		console.log(mediaStreamSource);
//		console.log(mediaStreamSource.connect());
//		filter.connect(analyser);
//		//出力Nodeのdestinationに接続
//		analyser.connect(audioContext.destination);
//		//mediaStreamSource.connect(audioContext.destination);
//	}
//	var audioObj = {"audio":true};
//	//マイクの有無を調べる
//	if(navigator.webkitGetUserMedia){
//		//マイク使って良いか聞いてくる
//		navigator.webkitGetUserMedia(audioObj,gotStream,errBack);
//	}else{
//		console.log("マイクデバイスがありません");
//	}
//	//-------------------------------------マイク取得




//	};
//	init();
	socket = io.connect();
	console.log('connectしました。');
	
	
	
	myIcon = new MyIcon();		// クラス
	myIcon.Init( canvasWidth/2, canvasHeight/2 ); //初期化メソッド実行(初期の位置を引数に渡してcanvas要素中央に配置)//



//-------------------------------------------socket.io---//
	socket.on('connect', function() {
		socket.on('emit_fron_server_sendIcons', function(data){
			data.forEach(function(icon) {
				if (!icon) return;
				icons.push(MyIcon.fromObject( icon,canvasWidth/2, canvasHeight/2 ));
			});
		});
		// クラス生成
		myIcon.uniqueId = socket.id;

		//socket.emit('emit_from_client_join', myIcon);

		socket.on('emit_from_server_join', function(data) {
			console.log(data);
			icons.push(MyIcon.fromObject( data, canvasWidth/2, canvasHeight/2  ));
		});

		
//		socket.on('emit_from_server_iconMove', function(data) {
//			if(otherIcon){
//				otherIcon.PosX = data.PosX;
//				otherIcon.PosY = data.PosY;
//			}
//		});
		
		socket.on('emit_from_server_iconRemove', function(data){
			icons.forEach(function(icon, i, icons) {
				if(icon.uniqueId == data) icons.splice(i, 1);
			});
		});
		
		socket.on('emit_from_server_sendMsg', function(data) {
			icons.forEach(function(icon, i, icons) {
				if(icon.uniqueId == data.uniqueId) {
					console.log('きてます');
					icons[i].str = data.str;
					icons[i].chatShowCount = data.chatShowCount;
				}
			});
		});
	});//----------end----------socket.on('connect'
	


	$('#sendMsgBtn').on("click",function(){
		myIcon.SendChat();
		socket.emit('emit_from_client_sendMsg', {str: myIcon.str, chatShowCount: myIcon.chatShowCount});
	});


//	$('#myForm').submit(function (e) {
////		e.preventDefault();
////		socket.emit('emit_from_client', $('#msg').val());
////		console.log('emit_from_clientしました');
////		console.log($('#msg').val());
////
//		myIcon.SendChat();
//		socket.emit('emit_from_client_sendMsg', {str: myIcon.str, chatShowCount: myIcon.chatShowCount});
//	});

	//canvas要素にイベント設定----------------------s
	canvas.onmousedown = function () {
		if(myIcon) {
			myIcon.beginDrag();
		}
	};
	canvas.onmousemove = function () {
		mousePos(event);//mouseX,mouseY座標を取得
		if(myIcon) {
			PosX = myIcon.PosX;
			PosY = myIcon.PosY;
			myIcon.drag();
			positionChange();
		}
	};
	canvas.onmouseup = function () {
		if(myIcon) {
			myIcon.endDrag();
		}
	};

	//レンダリング関数-----------------------------------------------------
	window.requestNextAnimationFrame = (function () {
		var originalWebkitRequestAnimationFrame = undefined,
			wrapper = undefined,
			callback = undefined,
			geckoVersion = 0,
			userAgent = navigator.userAgent,
			index = 0,
			self = this;
		if (window.webkitRequestAnimationFrame) {
			wrapper = function (time) {
				if (time === undefined) {
					time = +new Date();
				}
				self.callback(time);
			};
			// Make the switch
			originalWebkitRequestAnimationFrame = window.webkitRequestAnimationFrame;
			window.webkitRequestAnimationFrame = function (callback, element) {
				self.callback = callback;
				// Browser calls the wrapper and wrapper calls the callback
				originalWebkitRequestAnimationFrame(wrapper, element);
			}
		}
		if (window.mozRequestAnimationFrame) {
			index = userAgent.indexOf('rv:');
			if (userAgent.indexOf('Gecko') != -1) {
				geckoVersion = userAgent.substr(index + 3, 3);
				if (geckoVersion === '2.0') {
					window.mozRequestAnimationFrame = undefined;
				}
			}
		}

		return window.requestAnimationFrame   ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame    ||
			window.oRequestAnimationFrame      ||
			window.msRequestAnimationFrame     ||

			function (callback, element) {
			var start,
				finish;

			window.setTimeout( function () {
				start = +new Date();
				callback(start);
				finish = +new Date();
				self.timeout = 1000 / 60 - (finish - start);
			}, self.timeout);
		};
	})();
	//レンダリング関数終了-----------------------------------------------------
	var PosX;
	var PosY;
	var countFrames = 0;

	function positionChange() {
		if(myIcon) {
			if(myIcon.PosX != PosX || myIcon.PosY != PosY) {
				socket.emit('emit_from_client_iconPosChanged', {PosX: myIcon.PosX, PosY: myIcon.PosY});
			}
		}
	}
	function animate(now) {//レンダリング関数
		countFrames++;
		if(myIcon) {
			PosX = myIcon.PosX;
			PosY = myIcon.PosY;
		}
		//サーバーにmyIconインスタンスを丸ごと送る
//		if (countFrames % 60 == 0 ) {
//			socket.emit('emit_from_client_iconUpdate', myIcon);
//			socket.on('emit_from_server_iconUpdate', function(data) {
//				console.log(data);
//				icons.forEach(function(icon, i, icons) {
//					console.log(icon);
//					console.log(i);
//					console.log(icons);
//					if (icon.uniqueId == data.uniqueId ) {
//						icons[i] = MyIcon.fromObject( data, data.PosX, data.PosY );
//					}
////					icons.push(icon);
//				});
//			});
//		}
		
		//-----------------------------------音声ビジュアルエフェクト
		//符号なし8bitArrayを生成
		var data = new Uint8Array(analyser.frequencyBinCount);
		//周波数データ
		analyser.getByteFrequencyData(data);
		var volume = false;
		for(var i = 0; i < data.length; ++i) {
			//上部の描画
			//			context2.fillRect(i*5, 0, 5, data[i]*2);
			//下部の描画
			//			context2.fillRect(i*5, h, 5, -data[i]*2);
			//console.log( data[i] > 100 );
			if(data[i] > 200){
				volume = true;
			}
		}
		if( volume ){
			if(myIcon) {
				myIcon.countVoice = 100;
				socket.emit('emit_from_client_voicePU', myIcon.countVoice);
			}
		}
		//-----------------------------------音声ビジュアルエフェクト

		
		
		socket.on('emit_from_server_voicePU', function(data) {
			icons.forEach(function (icon, i, icons) {
				if(icon.uniqueId == data.uniqueId) {
					icons[i].countVoice = data.countVoice;
				}
			});
		});
		socket.on('emit_from_server_peerCallConnected', function(data) {
			icons.forEach(function (icon, i, icons) {
				if(icon.uniqueId == data.uniqueId) {
					if(!icons[i].talkingNodesIds.length) {
						console.log(data);
						console.log(icons[i].talkingNodesIds);
						icons[i].talkingNodesIds.push(data.talkingNodesIds);
						console.log(icons[i].talkingNodesIds);
					}else{
						icons[i].talkingNodesIds.forEach(function(id) {
							if(id != data.uniqueId) return;
							console.log(data);
							console.log(icons[i].talkingNodesIds);
							icons[i].talkingNodesIds.push(data.talkingNodesIds);
							console.log(data.talkingNodesIds);
						});
					}
				}
			});
		});
		socket.on('emit_from_server_peerCallDisconnected', function(data) {
			icons.forEach(function (icon, i, icons) {
				if(icon.uniqueId == data.uniqueId) {
					if(icons[i].talkingNodesIds.length) {
						icons[i].talkingNodesIds.forEach(function(id,j,arr) {
							console.log(id);
							console.log(data.talkingNodesIds);
							console.log(data.uniqueId);
							console.log(arr);
							if(id == data.talkingNodesIds) {
								arr.splice(j,1);
								console.log(arr);
							}
						});
					}
				}
			});
		});
		
		//	Draw
		//	描画

		function Draw(){
				
			if( countFrames % 30 == 0 ) {
				if(myIcon && peer && myStream) {
					if(icons.length > 0) {
						icons.forEach(function(icon) {
							if(icon.peerId){
								var diffX = icon.PosX - myIcon.PosX;
								var diffY = icon.PosY - myIcon.PosY;
								if((diffX * diffX) + (diffY * diffY) < 140 * 140){//距離判定
									if(myIcon.talkingNodes.length < 1 && icon.talkingNodes < 1){
										if(myIcon.talkingNodes.length) {
											myIcon.talkingNodes.forEach(function(node, i, arr) {
												if(node.uniqueId != icon.uniqueId) {
													return;
												} else {//接続する
													var call = peer.call(icon.peerId, myStream);
													call.on('stream', receiveOthersStream);
													myIcon.talkingNodes.push({uniqueId: icon.uniqueId, call: call });
													socket.emit('emit_from_client_peerCallConnected', icon.uniqueId);
												}
											});
										} else {//接続する
											var call = peer.call(icon.peerId, myStream);
											call.on('stream', receiveOthersStream);
											myIcon.talkingNodes.push({uniqueId: icon.uniqueId, call: call });
											socket.emit('emit_from_client_peerCallConnected', icon.uniqueId);
										}
									}
								}else{
									myIcon.talkingNodes.forEach(function(node, i, arr) {
										if(node.uniqueId == icon.uniqueId) {//切断する
											node.call.close();
											arr.splice(i,1);
											socket.emit('emit_from_client_peerCallDisconnected', icon.uniqueId);
										}
									});
								}
							}
						});
					}
				}
			}



			context.fillStyle = "rgb(255,255,255)";// 白に設定。
			context.clearRect(0,0,canvasWidth,canvasHeight);// 塗りつぶし。
			if(myIcon) {
				myIcon.Draw(context,0,0); //myIconの描画メソッド呼出
				myIcon.DrawChat(); //myIconオブジェクトの描画メソッド呼出
				if(myIcon.countVoice){
					context.globalAlpha = myIcon.countVoice * 3 / 1000;
//					console.log(myIcon.talkingNodes.length);
					if(myIcon.talkingNodes.length > 0) {
						context.fillStyle = "#0f0";
					}else{
						context.fillStyle = "#ff0";
					}
					context.beginPath();
					//円の設定（X中心軸,Y中心軸、半径、円のスタート度、円のエンド度、回転）
					//		context.arc(oldX, oldY, Math.sqrt(Math.pow(px, 2) + Math.pow(py, 2)), 0, Math.PI * 2, false); // full circle
					context.arc(myIcon.PosX, myIcon.PosY, 140, 0, Math.PI * 2, false); // full circle
					context.fill();
					context.globalAlpha = 1;
					myIcon.countVoice--;
				}
			}

			//otherIcon-------------------
			icons.forEach(function(icon) {
				icon.endDrag();
				icon.Draw(context,0,0); //myIconオブジェクトの描画メソッド呼出(CanvasRenderingContext2Dオブジェクト,イメージオブジェクト,0,0)
				icon.DrawChat(); //myIconオブジェクトの描画メソッド呼出(CanvasRenderingContext2Dオブジェクト,str)
				if(icon.countVoice){
					context.globalAlpha = icon.countVoice * 3 / 1000;
					console.log(icon.talkingNodesIds.length);
					if(icon.talkingNodesIds.length > 0) {
						context.fillStyle = "#0f0";
					}else{
						context.fillStyle = "#ff0";
					}
//					context.fillStyle = "#ff0";
					context.beginPath();
					//円の設定（X中心軸,Y中心軸、半径、円のスタート度、円のエンド度、回転）
					//		context.arc(oldX, oldY, Math.sqrt(Math.pow(px, 2) + Math.pow(py, 2)), 0, Math.PI * 2, false); // full circle
					context.arc(icon.PosX, icon.PosY, 140, 0, Math.PI * 2, false); // full circle
					context.fill();
					context.globalAlpha = 1;
					icon.countVoice--;
				}
			});
		}
		Draw();		// 描画
		if(myIcon) {
			myIcon.Move(gBRightPush,gBLeftPush,gBUpPush,gBDownPush);//アイコンを動かす
		}

		socket.on('emit_from_server_iconPosChanged', function(data) {
			icons.forEach(function(icon, i, icons) {
				if(icon.uniqueId == data.uniqueId) {
					icons[i].PosX = data.PosX;
					icons[i].PosY = data.PosY;
				}
			});
		})
		positionChange();
		requestNextAnimationFrame(animate);//描画がloopする
	}
	requestNextAnimationFrame(animate);		// loopスタート



	function mousePos(event) {// マウスの座標の取得
		// Canvasの左上のウィンドウ上での座標
//		var ele = document.getElementById('canvas');
		var bounds = canvas.getBoundingClientRect();//エレメントの絶対座標値を取得。戻り値はオブジェクトで左の座標値はleft、上の座標値はtopプロパティに入る
		var offsetX = bounds.left;
		var offsetY = bounds.top;

		// マウスが押された座標を取得
		mouseX = event.clientX - offsetX;
		mouseY = event.clientY - offsetY;
	}







//	var audioContext = new webkitAudioContext();
//	//フィルター
//	var filter = audioContext.createBiquadFilter();
//	filter.type = 0;
//	filter.frequency.value = 440;
//	//analyserオブジェクトの生成
//	var analyser = audioContext.createAnalyser();

});