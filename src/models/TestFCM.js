
var request = require('request');
var cheerio = require('cheerio');

var adr = 'http://www2.hm.com/en_in/productpage.0651244003.html'
request({
  uri: adr,
}, function(error, response, body) {

//console.log("   bpdy =========",body)
  var $ = cheerio.load(body);

  $("span").each(function() {
    var link = $(this);
//    console.log(  " -> " + link);
    var text = link.attr('class')
//    console.log(  " ------------> " + text);
//     console.log( href +"--");
    if(text == 'price-value')
        
//        console.log(link)
       console.log(  " -> " + link.text().trim().split('Rs.')[1].trim());
    });

  })