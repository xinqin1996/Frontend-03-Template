// 创建一个服务器

const http = require('http');

let app = http.createServer((request, response) => {
  let body = [];
  request.on('error', (err) => {
    // console.error(err);
  }).on('data', (chunk) => {
    // console.log(chunk);
    body.push(chunk);
  }).on('end', () => {
    body = Buffer.concat(body).toString();
    // console.log("body", body);
    response.writeHead(200, {'Content-type': 'text/html'})
    response.end(`<html lang="en">
        <head>
            <style>
                #box div {
                    color: red;
                    font-size: 32px;
                }
                #name li {
                    color: blue;
                }
            </style>
            <title>Document</title>
        </head>
        <body id="box">
            <div>name</div>
        </body>
    </html>
    `)
  })
})

app.listen(8088)

// console.log('server start')