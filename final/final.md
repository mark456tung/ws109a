# 期末作業(搜尋引擎)
* 過程
    * 先利用利用爬蟲將網址爬取後存下
    * 程式透過elasticsearch進行
    * 完成搜尋
* 搜尋結果 
[result](https://github.com/mark456tung/ws109a/blob/master/final/picture/result1.png)
[result](https://github.com/mark456tung/ws109a/blob/master/final/picture/result2.jpg)
* [爬蟲程式](https://github.com/mark456tung/ws109a/blob/master/final/denocrawler.js)
```
 import { get, post } from '../midterm/crawler/esearch.js'
//import { writeJson } from 'https://deno.land/std/fs/mod.ts'
import { writeJson, writeJsonSync } from 'https://deno.land/x/jsonfile/mod.ts';
var urlList = [
    // 'http://msn.com', 
    'https://en.wikipedia.org/wiki/Main_Page'
]

var urlMap = {}

async function getPage(url) {
    try {
        const res = await fetch(url);
        return await res.text();
    } catch (error) {
        console.log('getPage:', url, 'fail!')
    }
}

function html2urls(html) {
    var r = /\shref\s*=\s*['"](.*?)['"]/g 
    // \s單一或多個空白字元 href 即href \s* 多個或單一個空白 ['"]'"的聯集 
    // .*? 比對多個任意字元且可為0個或1個 ()在這裡不確定意思 不像是 Capturing Parentheses捕捉.*? 以方便之後使用 推測是括弧起來增加可讀性 g即全域比對
    var urls = []
    while (true) {
        let m = r.exec(html)
        if (m == null) break
        urls.push(m[1])
    }
    return urls
}

// await post(`/web/page/${i}`, {url, page})
function sleep(ms) {               //用來讓程式停止
    return new Promise(resolve => setTimeout(resolve, ms));  
}
async function craw(urlList, urlMap) {
    var count = 0
    for (let i = 0; i < urlList.length; i++) {
        // for (let i=0; i<10; i++) {
        var url = urlList[i]
        console.log('url=', url)
        await sleep(2000);//delay
        if (!url.startsWith("https://en.wikipedia.org/wiki")) continue;
        console.log(url, 'download')
        count++
        if (count >= 10) break
        try {
            var page = await getPage(url)
            await post(`/web9/page/${count}`, { url, page })
            // await Deno.writeTextFile(`data/${i}.txt`, page)
            var urls = html2urls(page)
            // console.log('urls=', urls)
            for (let surl of urls) {
                var purl = surl.split(/[#\?]/)[0]
                var absurl = purl
                if (surl.indexOf("//") < 0) { // 是相對路徑
                    absurl = (new URL(purl, url)).href
                    // console.log('absurl=', absurl)
                }
                if (urlMap[absurl] == null) {
                    urlList.push(absurl)
                    urlMap[absurl] = 0
                }
            }
        } catch (error) {
            console.log('error=', error)
        }

        writeJson("./users1.json", urlList);
    }
}

await craw(urlList, urlMap)
```

* [seach](https://github.com/mark456tung/ws109a/blob/master/final/app.js)
 ```   
const ejsEngine = engineFactory.getEjsEngine();
const oakAdapter = adapterFactory.getOakAdapter();

const router = new Router();

router
  .get('/', (ctx) => {
    ctx.response.redirect('/public/search.html')
  })
  .get('/search', search)
  .get('/public/(.*)', pub)

const app = new Application();
app.use(viewEngine(oakAdapter, ejsEngine));   //ejs 引擎可協助我們把搜尋的結果 用相同的版面顯示出來 (需事先寫好 ejs檔)
app.use(router.routes());
app.use(router.allowedMethods());
const parser = new DOMParser();

async function search(ctx) {
  const query = ctx.request.url.searchParams.get('query')
  console.log('query =', query)

  let docs = await get('/web9/page/_search', { page: query })
  docs = docs.hits.hits
  let document = []
  let title1 = []

  for (var i = 0; i < docs.length; i++) {
    let s = ""
    let s1 = ""
    docs[i]["_title"] = ""
    title1 = parser.parseFromString(docs[i]["_source"]["page"], "text/html")//JSON字串轉換成 JavaScript的數值或是物件
    title1.querySelectorAll('title').forEach((node) => s1 += (node.textContent))//querySelectorAll()，這個不但可以把同樣的元素選起來外，還會以陣列的方式被傳回
    docs[i]["_title"] = s1
    console.log("title=", s1)
    console.log(docs[i])
    document = parser.parseFromString(docs[i]["_source"]["page"], "text/html")//.querySelector('#mw-content-text') 
    document.querySelectorAll('p').forEach((node) => s += (node.textContent))//返回與指定選擇器匹配的文檔中所有Element節點的列表。
    var j = s.indexOf(query)
    docs[i]["_source"]["page"] = s.substring(j - 150, j + 150)
  }

  ctx.render('views/searchResult1.ejs', { docs: docs })
}

async function pub(ctx) {
  var path = ctx.params[0]
  await send(ctx, path, {
    root: Deno.cwd() + '/public',
    index: "index.html",
  });
}

console.log('Server run at http://127.0.0.1:8000') //架站在本機的port 8000
await app.listen({ port: 8000 });
 ```


* 補充
    * 對於此程式大部分可以理解
    * 參考柯泓吉同學的code理解後並加上部分註解
    * 使用deno爬蟲爬取資料後再搭配elasticsearch做搜尋引擎
    * 搜尋資料來源網址為維基百科
* 修課心得 
    * 上學期的網頁設計比較著重於前端的部分，而這學期則是後端的部分，對於不太會寫程式的我來說都相當的頭痛，特別是這學期程式的部分變得相當的重。
    * 在比較接近期末的時候(因為寫程式處處碰壁)，我有反思自己為何"不太會寫程式"原因大概如下
        * 對於學習程式的時候往往只有聽會或讀懂而沒有自己"實際操作"，等到真正需要寫比較有結構性的程式的時候，東缺一塊，西缺一塊，沒有地方是熟的，最後只能用"參考"這種方式來草草結束作業。
        * 理解和會寫其實有著相當大的差距，學習程式應該邊學習邊寫才有辦法進步。

    