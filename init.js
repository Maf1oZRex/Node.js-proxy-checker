const request         = require("request"),
      fs              = require("fs"),
      proxyFile       = fs.readFileSync('./proxy.txt', 'utf-8'),
      proxyList       = proxyFile.split('\n'),
      colors          = require('colors');

class ProxyChecker {
    constructor(protocol, address, port, id, total) {
        this.protocol = protocol;
        this.address = address;
        this.port = port;

        this.total = total;
        this.id = id;
        this.checkProxy();
    }
    checkProxy() {
        let sender = request.defaults({
            proxy: `${this.protocol}://${this.address}:${this.port}`
        });
        sender('http://de.agar.bio/', {timeout: 1000}, (err, res) => {    
            if(err) global.BadProxies++;
            if(!err && res.statusCode) global.GoodProxies++, fs.appendFileSync('goods.txt', `${this.protocol}://${this.address}:${this.port}\n`, 'utf8');
            console.log(`${~~((global.GoodProxies / this.total) * 100)}`.green + `/` + `${~~((global.BadProxies / this.total) * 100)}`.red + `%`);
            if(global.GoodProxies + global.BadProxies == this.total) return console.log(`GOODS: ${global.GoodProxies} | BADS: ${global.BadProxies} | TOTAL: ${this.total}`), console.log(`${global.GoodProxies} PROXIES SAVED TO GOODS.txt`);
        })
    }
}

fs.writeFileSync('Goods.txt', 'utf-8');
require('events').EventEmitter.defaultMaxListeners = 15;
global.GoodProxies  = 0;
global.BadProxies   = 0;

for(let i=0;i<proxyList.length;i++) {
    let port = proxyList[i].split(':');
    new ProxyChecker("http", port[0], port[1], i, proxyList.length);
}