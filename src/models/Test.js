//var request = require('request');
//var cheerio = require('cheerio');
//var adr = 'http://www2.hm.com/en_in/productpage.0651244003.html'
//var q = url.parse(adr, true);
//
///*The parse method returns an object containing url properties*/
//console.log(q.host);
//console.log(q.pathname);
//console.log(q.search);
//
///*The query property returns an object with all the querystring parameters as properties:*/
//var qdata = q.query;
//console.log(qdata.month);
//
//fs.readFile(adr, function(err, data) {
//    if (err) {
//      console.log(err)
//    }  
//    console.log(data)
//  });\
//  
//  request({
//  uri: adr,
//}, function(error, response, body) {
//  console.log(error);
//});
//
//
//
//var request = require('request');
//var cheerio = require('cheerio');
//var adr = 'http://www2.hm.com/en_in/productpage.0651244003.html'
//request({
//  uri: adr,
//}, function(error, response, body) {
//
////console.log("   bpdy =========",body)
//  var $ = cheerio.load(body);
//
//  $("span").each(function() {
//    var link = $(this);
////    console.log(  " -> " + link);
//    var text = link.attr('class')
////    console.log(  " ------------> " + text);
////     console.log( href +"--");
//    if(text == 'price-value')
//        
////        console.log(link)
//       console.log(  " -> " + link.text());
//    });
//
//  });
//  
//  
//  (async (url) => {
//    var body = getScript2(url)
//    console.log(body('body'));
//})(adr);
//
//  
//  const getScript2 = (url) => {
//    return new Promise((resolve, reject) => {
//        const http      = require('http'),
//              https     = require('https');
//
//        let client = http;
//
//        if (url.toString().indexOf("https") === 0) {
//            client = https;
//        }
//
//        client.get(url, (resp) => {
//            let data = '';
//
//            // A chunk of data has been recieved.
//            resp.on('data', (chunk) => {
//                data += chunk;
//            });
//
//            // The whole response has been received. Print out the result.
//            resp.on('end', () => {
//                var $ = cheerio.load(data);
//                resolve($);
//            });
//
//        }).on("error", (err) => {
//            reject(err);
//        });
//    });
//};
