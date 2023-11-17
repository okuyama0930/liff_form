// LINE developersのメッセージ送受信設定に記載のアクセストークン
const LINE_TOKEN = 'LmF4VkJTpwWja6spdMyWhfnv3UyInmD7pnuhN6PH4jJPHaVJe63M7MnrdrtCE6oYRAGc4faZtzw6Hb+QLH2wBdB10Yit0OqBGq5qeF8NSiGSLLhm3fRQpZ1s9R9IeCaiW9CkxOfpg98t8NbUI+3+jwdB04t89/1O/w1cDnyilFU=';
const LINE_URL = 'https://api.line.me/v2/bot/message/reply';

//postリクエストを受取ったときに発火する関数
function doPost(e) {
    var event = JSON.parse(e.postData.contents).events[0];
    // WebHookで受信した応答用Token
    var replyToken = event.replyToken;
    // ユーザーのメッセージを取得
    var userMessage = event.message.text;


    // 返答用メッセージを作成
    const messages = [
        {
            type: "text",
            text: "",
        },
    ];
    
    const form_msg = userMessage.split("\n")[0];
    // 査定依頼の処理
    if (form_msg === "査定内容") {
        //メッセージを改行ごとに分割
        const all_msg = userMessage.split("\n");
        const msg_num = all_msg.length;

        // ***************************
        // スプレットシートからデータを抽出
        // ***************************
        // 1. 今開いている（紐付いている）スプレッドシートを定義
        const sheet = SpreadsheetApp.getActiveSpreadsheet();
        // 2. ここでは、デフォルトの「シート1」の名前が書かれているシートを呼び出し
        const listSheet = sheet.getSheetByName("シート1");
        // 3. 最終列の列番号を取得
        const numColumn = listSheet.getLastColumn();
        // 4. 最終行の行番号を取得
        const numRow = listSheet.getLastRow() - 1;
        // 5. 範囲を指定（上、左、右、下）
        const topRange = listSheet.getRange(1, 1, 1, numColumn);      // 一番上のオレンジ色の部分の範囲を指定
        const dataRange = listSheet.getRange(2, 1, numRow, numColumn); // データの部分の範囲を指定
        // 6. 値を取得
        const topData = topRange.getValues();  // 一番上のオレンジ色の部分の範囲の値を取得
        const data = dataRange.getValues(); // データの部分の範囲の値を取得
        const dataNum = data.length + 2;        // 新しくデータを入れたいセルの列の番号を取得

        // ***************************
        // スプレッドシートにデータを入力
        // ***************************
        //シート１にuserIdを登録
        // 最終列の番号まで、順番にスプレッドシートの左からデータを新しく入力
        for (let i = 0; i < msg_num; i++) {
            SpreadsheetApp.getActiveSheet().getRange(dataNum, i + 1).setValue(all_msg[i + 1]);
        }
        recordLineUserId(event.source.userId);

        // 返答用メッセージを追加
        messages[0].text = "データを送信しました";

    } else if (userMessage === "キャンセル") {
        messages[0].text = "キャンセルしました";
    }


    // lineで返答する
    UrlFetchApp.fetch(LINE_URL, {
        'headers': {
            'Content-Type': 'application/json; charset=UTF-8',
            'Authorization': `Bearer ${LINE_TOKEN}`,
        },
        'method': 'post',
        'payload': JSON.stringify({
            'replyToken': replyToken,
            'messages': messages,
        }),
    });

    ContentService.createTextOutput(JSON.stringify({ 'content': 'post ok' })).setMimeType(ContentService.MimeType.JSON);

    function recordLineUserId(userId) {
        var activeSheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
        // F列の空いているセルの行番号を取得する。（I1,I2が既に埋まっていたらnext=3となる）
        var next = activeSheet.getRange("I:I").getValues().filter(String).length + 1;
        Logger.log(next);
        // F列の空いてるセルにユーザーIDを登録する
        activeSheet.getRange(next, 9).setValue(userId);
    };
}
