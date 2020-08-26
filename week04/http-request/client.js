const net = require('net');
const parser = require('./parser.js');

// 创建一个http请求的类
class Request {
    constructor(options){
        this.method = options.method || 'GET';
        this.host = options.host;
        this.port = options.port || 80;
        this.path = options.path || '/';
        this.body = options.body || {};
        this.headers = options.headers || {};
        // Content-Type 必须有
        if(!this.headers['Content-Type']){
            this.headers['Content-Type'] = 'application/x-www-for-form-urlencoded';
        }

        if(this.headers['Content-Type'] === 'application/json')
            this.bodyText = JSON.stringify(this.body);
        else if(this.headers['Content-Type'] === 'application/x-www-for-form-urlencoded')
            this.bodyText = Object.keys(this.body).map(key => `${key}=${encodeURIComponent(this.body[key])}`).join('&');
        
        this.headers['Content-Length'] = this.bodyText.length
    }

    // 把真实的请求发往服务器
    send(connection){
        return new Promise((resolve, reject) => {
            const parser = new ResponseParser;
            // console.log('请求')
            // console.log(this.toString());
            // console.log('-----')
            if(connection){
                connection.write(this.toString())
            }else{
                connection = net.createConnection({
                    host: this.host,
                    port: this.port
                }, () => {
                    connection.write(this.toString())
                })
            }
            connection.on('data', data => {
                // 使用parser来解析返回的数据
                // console.log('接口返回')
                // console.log(data.toString())
                // console.log('-----')
                parser.receive(data.toString());
                // console.log(parser.headers)
                // console.log(parser.bodyParser.content)
                if(parser.isFinished){
                    resolve(parser.response)
                    connection.end();
                }
            })
            connection.on('error', err => {
                reject(err);
                connection.end()
            })
        
        })
    }

    // 解析Request实例
    toString(){
        return `${this.method} ${this.path} HTTP/1.1\r\n${Object.keys(this.headers).map(key => `${key}: ${this.headers[key]}`).join('\r\n')}\r\n\r\n${this.bodyText}`
    }
}

// 用来解析接口返回的header数据
class ResponseParser {
    constructor(){
        this.WAITING_STATUS_LINE = 0;
        this.WAITING_STATUS_LINE_END = 1; // statusLine结束
        this.WAITING_HEADER_NAME = 2;
        this.WAITING_HEADER_SPACE = 3;
        this.WAITING_HEADER_VALUE = 4;
        this.WAITING_HEADER_LINE_END = 5; // header单行结束
        this.WAITING_HEADER_BLOCK_END = 6; // header全部结束
        this.WAITING_BODY = 7;

        this.current = this.WAITING_STATUS_LINE; // 当前所处的状态
        this.statusLine = '';
        this.headers = {};
        this.headerName = '';
        this.headerValue = '';
        this.bodyParser = null; 
    }
    // 返回bodyParser的isFinished
    get isFinished(){
        return this.bodyParser && this.bodyParser.isFinished
    }
    get response(){
        this.statusLine.match(/HTTP\/1.1 ([0-9]+) ([\s\S]+)/); // 正则匹配
        // console.log('$$', RegExp.$1)
        // console.log('$$', RegExp.$2)
        return {
            statusCode: RegExp.$1,
            statusText: RegExp.$2,
            headers: this.headers,
            body: this.bodyParser.content.join('')
        }
    }

    receive(string){
        for(let i = 0; i < string.length; i++){
            this.receiveChar(string.charAt(i)) // 返回i位置的字符
        }
    }
    // 判断当前的状态
    receiveChar(char){
		if(this.current === this.WAITING_STATUS_LINE){
            if(char === '\r'){
                this.current = this.WAITING_STATUS_LINE_END;
            }else{
                this.statusLine += char;
            }
        }else if(this.current === this.WAITING_STATUS_LINE_END){
            if(char === '\n'){
                this.current = this.WAITING_HEADER_NAME;
            }
        }else if(this.current === this.WAITING_HEADER_NAME){
            if(char === ':'){
                this.current = this.WAITING_HEADER_SPACE
            }else if(char === '\n'){ // 等到了'换行'代表header部分的结束,到了body部分
                this.current = this.WAITING_HEADER_BLOCK_END
                if(this.headers['Transfer-Encoding'] === 'chunked'){ // nodejs默认--Transfer-Encoding: chunked
                    this.bodyParser = new TrunkedBodyParser()
                }
            }else{
                this.headerName += char
            }
        }else if(this.current === this.WAITING_HEADER_SPACE){
            if(char === ' '){
                this.current = this.WAITING_HEADER_VALUE
            }
        }else if(this.current === this.WAITING_HEADER_VALUE){
            if(char === '\r'){
                // 生成一个header
                this.current = this.WAITING_HEADER_LINE_END;
                this.headers[this.headerName] = this.headerValue;
                this.headerName = '';
                this.headerValue = '';
            }else{
                this.headerValue += char;
            }
        }else if(this.current === this.WAITING_HEADER_LINE_END){
            if(char === '\n'){
                this.current = this.WAITING_HEADER_NAME
            }
        }else if(this.current === this.WAITING_HEADER_BLOCK_END){
            // 会对body进行多次解析
            this.bodyParser.receiveChar(char)
            // if(char === '\n') {
            //     this.current = this.WAITING_BODY
            // }
        }else if(this.current === this.WAITING_BODY) {
            // 会对body进行多次解析
            // this.bodyParser.receiveChar(char)
        }
    }
}

// 用来解析接口返回的body数据
class TrunkedBodyParser {
    constructor(){
        this.WAITING_LENGTH = 0;
        this.WAITING_LENGTH_LINE_END = 1;
        this.READING_TRUNK = 2;
        this.WAITING_NEW_LINE = 3;
        this.WAITING_NEW_LINE_END = 4;
        this.length = 0; // chunk长度
        this.content = [];
        this.isFinished = false;
        this.current = this.WAITING_LENGTH
    }
    receiveChar(char){
        if(this.current === this.WAITING_LENGTH) {
            if(char === '\r') {
                if(this.length === 0) {
                    this.isFinished = true;
                }
                this.current = this.WAITING_LENGTH_LINE_END
            } else {
                // 生成chunk长度(16进制)
                this.length *= 16;
                this.length += parseInt(char, 16);
            }
        } else if(this.current === this.WAITING_LENGTH_LINE_END) {
            if(char === '\n') {
                this.current = this.READING_TRUNK
            }
        } else if(this.current === this.READING_TRUNK) {
            // 把chunk的字符push入content中
            this.content.push(char);
            this.length --;
            if(this.length === 0) {
                this.current = this.WAITING_NEW_LINE
            }
        } else if(this.current === this.WAITING_NEW_LINE) {
            if(char === '\r') {
                this.current = this.WAITING_NEW_LINE_END;
            }
        } else if(this.current === this.WAITING_NEW_LINE_END) {
            if(char === '\n') {
                this.current = this.WAITING_LENGTH;
            }
        }
    }
}

// 调用函数
void async function(){

    let request = new Request({
        method: "POST",
        host: "127.0.0.1",
        port: "8088",
        path: "/",
        headers: {
            ["X-Foo2"]:"customed"
        },
        body: {
            name: 'winter'
        }
    });

    let response = await request.send();

    // console.log('打印处理后的response',response);
    let dom = parser.parseHTML(response.body)
    console.log(JSON.stringify(dom, null, "   "))
}();