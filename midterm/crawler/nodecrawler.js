// 安裝套件： npm install URIjs
// 執行方法： node crawler http://tw.msn.com/     https協議的網站不適用此爬蟲
var fs = require('fs');
var http = require('http');
var URI = require('URIjs');
var c = console;
//初始化
var urlMap = {};
var urlList = [];
var urlIdx = 0;

urlList.push(process.argv[2]);
// 新增第一個網址 agrv[0]="node" agrv[1]=" " agrv[2]=:"輸入的網址" 即 node crawler http://tw.msn.com/ 的三個值

crawNext(); // 開始抓

function crawNext() {
  // 下載下一個網頁 遞迴函數， 重複從"網頁裡面抓網址 再利用網址的網頁抓網址"
  if (urlIdx >= urlList.length)
    return;
  var url = urlList[urlIdx];
  if (url.indexOf('http://') !== 0) {
    //url初始值為所輸入的網址 以此程式碼為例即"http://tw.msn.com/""
    urlIdx++;
    crawNext();
    return;
  }
  c.log('url[%d]=%s', urlIdx, url);
  urlMap[url] = { downlioad: false };
  pageDownload(url, function (data) {
    var page = data.toString();
    urlMap[url].download = true;
    var filename = urlToFileName(url);
    fs.writeFile('data/' + filename, page, function (err) {
      // fs.writeFile(filename, data[, options], callback)
      //寫入檔案
    });
    var refs = getMatches(page, /\shref\s*=\s*["'#]([^"'#]*)[#"']/gi, 1);
    // \s 空白字元(space, tab, form feed, line feed) herf即href字母 \s*空白字元 單一或多個空白字元
    //["'#]"'#集合 [^"'#]* 多個"'#的補集合 ()在這裡不確定意思 不像是 Capturing Parentheses捕捉[^"'#]* 以方便之後使用 推測是括弧起來增加可讀性


    for (i in refs) {                                            //印出網址            
      try {
        var refUri = URI(refs[i]).absoluteTo(url).toString();
        c.log('ref=%s', refUri);
        if (refUri !== undefined && urlMap[refUri] === undefined)
          urlList.push(refUri);
      } catch (e) { } //處理例外
    }
    urlIdx++;
    crawNext();
  });
}
// 下載一個網頁
function pageDownload(url, callback) {
  http.get(url, function (res) {    //有找到相關解釋 http://forum.espruino.com/conversations/1364/ 看了但不是很懂
    res.on('data', callback);
  }).on('error', function (e) {
    console.log("Got error: " + e.message);
  });
}
// 取得正規表達式比對到的結果成為一個陣列
function getMatches(string, regex, index) {
  index || (index = 1); // default to the first capturing group
  var matches = [];
  var match;
  while (match = regex.exec(string)) {
    matches.push(match[index]);
  }
  return matches;
}
// 將網址改寫為合法的檔案名稱
function urlToFileName(url) {
  return url.replace(/[^\w]/gi, '_');
}
// ^在這裡是補字元集(因為在[]內) 而非字串首  \w即[[a-zA-Z0-9_] //flag部分 g:全域比對(若沒標g會只讀第一個) i:忽略大小寫
//正規表示式參考 https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Guide/Regular_Expressions  最後的"gi"在 Advanced Searching With Flags 條目下                             
//鍾誠老師的10分鐘系列--用十分鐘學會字串處理的那些事兒  https://www.slideshare.net/ccckmit/ss-77167684

