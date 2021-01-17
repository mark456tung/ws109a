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