const http = require('http');
const url = require('url');
const fs = require('fs');
const qs = require('querystring');

const get = cssUrl =>
  new Promise(resolve => {
    http.get(cssUrl, function(res) {
      res.setEncoding('utf8');
      let rawData = '';
      res.on('data', chunk => {
        rawData += chunk;
      });
      res.on('end', () => {
        const data = rawData
          .split('\n.')
          .slice(2)
          .map(icon_name => icon_name.substr(0, icon_name.indexOf(':')));
        resolve(data);
      });
    });
  });

const server = http.createServer(async (req, res) => {
  // 获取请求地址数据
  const urlObj = url.parse(req.url);
  const { pathname, query } = urlObj;
  //请求css
  if ('/getCss' === pathname) {
    const { cssUrls } = qs.parse(query);
    const cssUrlsArray = cssUrls.split(',').filter(cssUrl => /^https?:\/\//.test(cssUrl));
    res.setHeader('Content-Type', 'application/json;charset=UTF-8');
    if (cssUrlsArray.length > 0) {
      const dataArray = await Promise.all(cssUrlsArray.map(cssUrl => get(cssUrl)));
      res.end(JSON.stringify(dataArray), 'utf-8');
    } else {
      res.end(JSON.stringify([]), 'utf-8');
    }

    return;
  }

  // 返回网页
  const html = fs.readFileSync('./index.html', 'utf8');
  res.end(html, 'UTF-8');
});
server.listen(9000);
console.log('打开http://localhost:9000/');
