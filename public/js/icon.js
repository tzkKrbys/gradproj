//MyIconクラス------------------------------------------------
function MyIcon(){
	this.socketId;
	this.PosX;					// x座標
	this.PosY;					// y座標
	this.AddNumX;				// x座標移動加算量
	this.AddNumY;				// y座標移動加算量
	this.radius = 20;			// 円の半径
	this.relX;					// 円の中心とマウスの相対位置
	this.relY;					// 円の中心とマウスの相対位置
	this.dragging = false;//ドラッグ中かどうか
	this.onObj = false;//マウスがアイコンに乗っかってるかどうか
	this.chatShowCount;
	this.str;//チャットで発言した文字
	this.countVoice;//発言した文字が消えるまでのカウントダウン
	this.iconImg;//アイコン画像用
	this.peerId;//skywayのpeer.id
	this.talkingNodes = [];//{socketId: icon.socketId, call: call }
	this.talkingNodesSocketIds = [];
}

/*初期化関数*/
MyIcon.prototype.Init = function(x,y){//引数にx,yの初期位置を渡す
	this.PosX = x;
	this.PosY = y;
	this.AddNumX = 4/*2*/;
	this.AddNumY = 4;
	this.iconImg = new Image();
	this.iconImg.src = "../img/circleParis.png";//アイコン画像を渡す
}

MyIcon.fromObject = function(obj, x, y) {
	console.log(obj);
	var icon = new MyIcon();
//	icon.xxx = obj.xxx;
	Object.keys(obj).forEach(function (key) {
		icon[key] = obj[key];
		
	});
	icon.Init(x, y);
	// ...
	return icon;
}


/*アイコン描画関数*/
MyIcon.prototype.Draw = function(img,offsetX,offSetY){ //引数 CanvasRenderingContext2Dオブジェクト,0,0
	img.save(); //現在の描画スタイル状態を一時的に保存//context . save() 現在の状態をスタックの最後に加えます。
	img.transform(-1, 0, 0, 1, 0, 0);//context . transform(m11, m12, m21, m22, dx, dy)下記の通りに引数に指定されたマトリックスを適用して、変換マトリックスを変更します。
	img.drawImage(this.iconImg, 0, 0, 160, 160, -this.PosX - this.radius, this.PosY - this.radius, this.radius * 2, this.radius * 2);//drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
	img.restore();//context . restore() スタックの最後の状態を抜き出し、その状態をコンテキストに復元します。
	//socket.emit('client_from_emit_icon_draw', this);
}

/*動き*/
MyIcon.prototype.Move = function(bRight,bLeft,bUp,bDown){
	if(bRight) {// 右キーが押された
		this.PosX += this.AddNumX;
	}
	else if(bLeft) {// 左キーが押された
		this.PosX -= this.AddNumX;
	}
	if(bUp) {// 上キーが押された
		this.PosY -= this.AddNumY;
	}
	else if(bDown) {// 下キーが押された
		this.PosY += this.AddNumY;
	}
	if(this.PosX < 0){
		this.PosX = 4;
	}else if(this.PosX > canvasWidth){
		this.PosX = canvasWidth - 4;
	}
	if(this.PosY < 0){
		this.PosY = 4;
	}else if(this.PosY > canvasHeight){
		this.PosY = canvasHeight - 4;
	}
}
//チャットの文字描画の為のメソッド
MyIcon.prototype.DrawChat = function(){
	if(this.chatShowCount > 0){
		this.chatShowCount--;
		//カラー指定
		context.fillStyle = '#fff';
		//fontサイズ、書式
		context.font = "16px _sans";
		context.strokeStyle = '#fff';
		//文字の設置位置
		context.textBaseline = "top"; //top,middle,bottom...
		//表示文字と座標
		context.fillText(this.str, this.PosX, this.PosY); //ctx.fillText(文字列,x,y)
	}
}
MyIcon.prototype.SendChat = function () {
	this.str = $('textarea').val();
	this.chatShowCount = 500;
	$('textarea').val("");
	return false;
}


//ドラッグ&ドロップ関数
MyIcon.prototype.beginDrag = function (event) {
	this.mousePosCheck();
	if (this.onObj) {// マウスが円の上ならばドラッグ開始
		this.dragging = true;
		this.relX = this.PosX-mouseX;
		this.relY = this.PosY-mouseY;
		canvas.style.cursor="move";//マウスカーソルの変更
	}
}
MyIcon.prototype.drag = function (event) {
	this.mousePosCheck();
	if (this.dragging) {//ドラッグ中ならばアイコンを移動
		this.PosX = mouseX + this.relX;
		this.PosY = mouseY + this.relY;
		this.Draw(context,0,0);
	}
	else {
		if (this.onObj && canvas.style.cursor != "pointer") {
			canvas.style.cursor="pointer";
		}
		if (!this.onObj && canvas.style.cursor == "pointer") {
			canvas.style.cursor="default";
		}
	}
}

MyIcon.prototype.endDrag = function (event) {
	this.dragging = false;//ドラッグ終了
	canvas.style.cursor="default";
}

MyIcon.prototype.mousePosCheck = function (event) {
	// 円の上にあるかチェック
	var len = Math.sqrt(( mouseX - this.PosX ) * ( mouseX - this.PosX ) + ( mouseY - this.PosY ) * ( mouseY - this.PosY ));
	if (len <= this.radius) {
		this.onObj = true;
	} else {
		this.onObj = false;
	}
}

//MyIconクラス------------------------------------------------












//
//
////OtherIconクラス------------------------------------------------
//function OtherIcon(){
//	this.socketId;
//	this.PosX;					// x座標
//	this.PosY;					// y座標
//	this.AddNumX;				// x座標移動加算量
//	this.AddNumY;				// y座標移動加算量
//	this.radius = 20;			// 円の半径
//	this.relX;					// 円の中心とマウスの相対位置
//	this.relY;					// 円の中心とマウスの相対位置
//	this.dragging = false;//ドラッグ中かどうか
//	this.onObj = false;//マウスがアイコンに乗っかってるかどうか
//	this.chatShowCount;
//	this.str;//チャットで発言した文字
//	this.countVoice;//発言した文字が消えるまでのカウントダウン
//	this.iconImg;//アイコン画像用
//	this.peerId;//skywayのpeer.id
//	this.talkingNodesSocketIds = [];
//}
//
///*初期化関数*/
//OtherIcon.prototype.Init = function(x,y){//引数にx,yの初期位置を渡す
//	this.PosX = x;
//	this.PosY = y;
//	this.AddNumX = 4/*2*/;
//	this.AddNumY = 4;
//	this.iconImg = new Image();
//	this.iconImg.src = "../img/son.png";//アイコン画像を渡す
//	this.talkingCount = 0;
//}
//
//OtherIcon.fromObject = function(obj, x, y) {
//	console.log(obj);
//	var icon = new OtherIcon();
////	icon.xxx = obj.xxx;
//	Object.keys(obj).forEach(function (key) {
//		icon[key] = obj[key];
//		
//	});
//	
//	console.log(icon);
//	icon.Init(x, y);
//	// ...
//	return icon;
//}
//
//
///*アイコン描画関数*/
//OtherIcon.prototype.Draw = function(img,offsetX,offSetY){ //引数 CanvasRenderingContext2Dオブジェクト,0,0
//	img.save(); //現在の描画スタイル状態を一時的に保存//context . save() 現在の状態をスタックの最後に加えます。
//	img.transform(-1, 0, 0, 1, 0, 0);//context . transform(m11, m12, m21, m22, dx, dy)下記の通りに引数に指定されたマトリックスを適用して、変換マトリックスを変更します。
//	img.drawImage(this.iconImg, 0, 0, 160, 160, -this.PosX - this.radius, this.PosY - this.radius, this.radius * 2, this.radius * 2);//drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
//	img.restore();//context . restore() スタックの最後の状態を抜き出し、その状態をコンテキストに復元します。
//	//socket.emit('client_from_emit_icon_draw', this);
//}
//
///*動き*/
//OtherIcon.prototype.Move = function(bRight,bLeft,bUp,bDown){
//	if(bRight) {// 右キーが押された
//		this.PosX += this.AddNumX;
//	}
//	else if(bLeft) {// 左キーが押された
//		this.PosX -= this.AddNumX;
//	}
//	if(bUp) {// 上キーが押された
//		this.PosY -= this.AddNumY;
//	}
//	else if(bDown) {// 下キーが押された
//		this.PosY += this.AddNumY;
//	}
//	if(this.PosX < 0){
//		this.PosX = 4;
//	}else if(this.PosX > canvasWidth){
//		this.PosX = canvasWidth - 4;
//	}
//	if(this.PosY < 0){
//		this.PosY = 4;
//	}else if(this.PosY > canvasHeight){
//		this.PosY = canvasHeight - 4;
//	}
//}
////チャットの文字描画の為のメソッド
//OtherIcon.prototype.DrawChat = function(str){
//	if(this.chatShowCount > 0){
//		this.chatShowCount--;
//		//カラー指定
//		context.fillStyle = '#fff';
//		//fontサイズ、書式
//		context.font = "16px _sans";
//		context.strokeStyle = '#fff';
//		//文字の設置位置
//		context.textBaseline = "top"; //top,middle,bottom...
//		//表示文字と座標
//		context.fillText(this.str, this.PosX, this.PosY); //ctx.fillText(文字列,x,y)
//	}
//}
//OtherIcon.prototype.SendChat = function () {
//	this.str = $('textarea').val();
//	this.DrawChat();
//	this.chatShowCount = 500;
//	$('textarea').val("");
//	return false;
//};
//
//
////ドラッグ&ドロップ関数
//OtherIcon.prototype.beginDrag = function (event) {
//	this.mousePosCheck();
//	if (this.onObj) {// マウスが円の上ならばドラッグ開始
//		this.dragging = true;
//		this.relX = this.PosX-mouseX;
//		this.relY = this.PosY-mouseY;
//		canvas.style.cursor="move";//マウスカーソルの変更
//	}
//}
//OtherIcon.prototype.drag = function (event) {
//	this.mousePosCheck();
//	if (this.dragging) {//ドラッグ中ならばアイコンを移動
//		this.PosX = mouseX + this.relX;
//		this.PosY = mouseY + this.relY;
//		this.Draw(context,0,0);
//	}
//	else {
//		if (this.onObj && canvas.style.cursor != "pointer") {
//			canvas.style.cursor="pointer";
//		}
//		if (!this.onObj && canvas.style.cursor == "pointer") {
//			canvas.style.cursor="default";
//		}
//	}
//}
//
//OtherIcon.prototype.endDrag = function (event) {
//	this.dragging = false;//ドラッグ終了
//	canvas.style.cursor="default";
//}
//
//OtherIcon.prototype.mousePosCheck = function (event) {
//	// 円の上にあるかチェック
//	var len = Math.sqrt(( mouseX - this.PosX ) * ( mouseX - this.PosX ) + ( mouseY - this.PosY ) * ( mouseY - this.PosY ));
//	if (len <= this.radius) {
//		this.onObj = true;
//	} else {
//		this.onObj = false;
//	}
//}
//
////OtherIconクラス------------------------------------------------