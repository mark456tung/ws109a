# 期中作業(網路爬蟲)
## 什麼是網路爬蟲
* 網路爬蟲，用來自動化取得網路上的資料，根據不同的用途，有不同的寫法。
## 爬蟲分類
* 網路爬蟲 從一些種子rul擴散到整個web 主要是搜尋引擎使用
* 主題爬蟲 選擇性地爬一些已經定義好的主題(比較常用的爬蟲，google搜尋會出現很多資料，大多是python實作)
* 增量式爬蟲 爬行新產生或有變化的網頁的爬蟲
## 常見的應用
* 搜尋引擎
* 網路服務商
* 數據搜集
## 常見的負面效應
* 盜文採集、垃圾流量網站
* 資安威脅

## 作業:code
* [code](https://github.com/mark456tung/ws109a/blob/master/midterm/crawler/nodecrawler.js)
```
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

```

## 描述與步驟

* code
  * 程式碼參考鍾誠老師gitlab上程式碼 了解程式碼並添加註釋
  * 步驟:
      * 安裝套件: npm install URIjs
      * 開始爬蟲：node nodecrawler.js "網址"(不可用https協議的網址)




## 來源:參考老師的gitlab上程式碼
* 來源及理解程度。
  * 1.資料參考[網站設計進階](https://gitlab.com/ccckmit/course/-/wikis/%E9%99%B3%E9%8D%BE%E8%AA%A0/%E6%9B%B8%E7%B1%8D/%E7%B6%B2%E7%AB%99%E8%A8%AD%E8%A8%88/httpCrawler)
  * 2.對這個程式原始碼我大部分可以理解
  * 3.目前自己實在無法從生出一個這種功能的爬蟲(我只會爬單一(或多個格式相同)網頁內容)，這是從鍾誠老師的blog照打上來後添加註釋的
  * 4.以下是我查到的或許有關於這類型爬蟲的資料的先備知識，自己都有讀過一遍並大部分理解
    * [DFS及BFS(深度優先搜尋及廣度優先搜尋演算法)](https://magiclen.org/dfs-bfs/)
    * [sitemap](https://ranking.works/%E6%8A%80%E8%A1%93SEO/sitemap)
    * [python-sitemap爬蟲](https://blog.csdn.net/github_35160620/article/details/52537210?ops_request_misc=%25257B%252522request%25255Fid%252522%25253A%252522161069497916780255290392%252522%25252C%252522scm%252522%25253A%25252220140713.130102334..%252522%25257D&request_id=161069497916780255290392&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~first_rank_v2~rank_v29-2-52537210.pc_search_result_hbase_insert&utm_term=sitemap%20%E7%88%AC%E8%9F%B2)
