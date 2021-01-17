import { Application, Router, send } from "https://deno.land/x/oak/mod.ts";
import {
  viewEngine,
  engineFactory,
  adapterFactory,
} from "https://ccc-js.github.io/view-engine/mod.ts" // from "https://deno.land/x/view_engine/mod.ts";
import { get, post } from "./essearch.js";
import { DOMParser, Element } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";  //deno.land 上有許多deno的第三方模組

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