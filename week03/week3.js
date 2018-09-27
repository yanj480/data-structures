var request = require('request');  // npm install request
var fs = require('fs');  // npm install fs
var async = require('async');  // npm install async
var cheerio = require('cheerio');  // npm install cheerio
var content = fs.readFileSync('data/mo10.txt');
var $ = cheerio.load(content);


// ApiKey
// 这个apiKey就是对应的在geoservices.tamu.edu得个人id。然后下面有两个，一个是
// 在linux environment里面设好，就相当于在另外一个地方已经有的一个variable然后
// 在这边再提出来用，另外一个就是下面comment掉得那一行，那个string直接放在这里的（
// 就是有“”的就是string，是字符，就算里面是数字也是字符），这个写法叫hardcoded
var apiKey = process.env.apiKey;
// var apiKey = "123870082a8745b3a6d640a2dfb47fb9";

// Create empty array addresses to store address for each meeting
// 这个addresses的空array是接下来用来存提取出来的各个meeting的地址的。下面的$('td')在mo10.txt里面代表的就是
// table的意思，然后.each就可以理解为loop，在这里就是以table为单位进行循环，function(i, elem)就是一个
// anonymous function然后有两个变量，一个是i，一个是elem。i可以不用管，其实就是在记跑的循环的次数，跑完一个循环i的值
// 加1。elem在这里指的就是这一次读到的这个table, $('td')。然后{}里的if那一个判断语句就是在对读的table进行筛选，
// 在这里筛选的条件就是.attr("style") == "border-bottom:1px solid #e3e3e3; width:260px")，.attr("style")可以理解为
// 这个table的其中一个attribute是style（这里的style也是string，如果没有“”的话style就是一个variable）。如果正在读的
// 这个table满足这个条件（if），那就执行if后面{}里的code，因为这里没有else{}，所以要是不满足这个条件的就直接跳过
// 继续读下一个table($("td")。 如果满足这个条件，就新建一个var叫作address，这个address的value就后面那一段code跑出来的东西，
// 就是提出来经过clean-up之后的meeting的地址。然后要把address放到（push）addresses里面，这里address是一段string，然后addresses
// 是一个array，第一次放进去之后就相当于这个array的第一个element是address对应的那一段string。这里如果不把address放到
// addresses里面，那这一个loop跑完之后确实是有一个叫address的variable它对应的值是meeting的地址，但是在跑到下一个满足
// 条件的table时，又会重新initialize一个variable叫address，一旦重新initialize，之前address的值就会被新的值代替，就从始至终
// 这就是单单一个variable存了一个meeting的地址，所以要把每次提出来的地址存到addresses里面，这样等整个mo10.txt里的table全部
// 读完之后，22个符合条件的table里面的地址都会被放在addresses里面，每一个地址都是一段string，在addresses里面的位置（或者叫
// index）是从0到21。你可以用addresses[0]来读第一个meeting的地址，addresses[1]是第二个meeting的。
var addresses = [];
$("td").each(function(i, elem) {
    if($(elem).attr("style") == "border-bottom:1px solid #e3e3e3; width:260px") {
        var address = $(elem).html().split('<br>')[2].trim().split(',')[0];
        // Modify the original address to get the street address only
        addresses.push(address);
    }
})

// Create an empty array meetingData to store meeting geocodes
// 这个新建的meetingData也是个空的array，到最后里面存的每一个element的形式是{"address":"xxx", "LatLong":{“lat”:"yyy", “lng":"zzz"}}
// 第一组key：value是"address":"xxx"，这个里面"address"是string，就是每个meeting的地址，"xxx"是"address"对应的value；
// 第二组key:value是"LatLong":{“lat”:"yyy", “lng":"zzz"}, 这个是一样的道理，“LatLong”是key，{“lat”:"yyy", “lng":"zzz"}是value。
// 在这里比较特殊的是在整个{“lat”:"yyy", “lng":"zzz"}这个value里面，又有两对key:value，一个是"lat":"yyy",另外一个是"lng":"zzz",
// 这里在每个element里面"lat"跟“lng"这两个key是不变的，因为是hardcoded,然后"yyy"跟“zzz”是会跟着address的不一样而改变的。
// 你不要觉得这个key：value然后value里面又套了一个key:value很复杂，其实很好理解的，就假设我现在这个meetingData里面
// 已经放了很多element了，每个element的格式就是上面那个{"address":"xxx", "LatLong":{“lat”:"yyy", “lng":"zzz"}}。那meetingData[0]就是
// 第一个element对吧，这个element的第一个key是“address”（注意这个address还是string），第二个key是“LatLong”。假设我想提取“LatLong”这个key
// 对应的value，有两种写法，一个是meetingData[0]["LatLong"]，另外一个是meetingData[0].LatLong，这两个提取出来的都是{“lat”:"yyy", “lng":"zzz"}，
// 这两个的差别就是是一个在[0]后面继续用[]来读，如果这样写那LatLong是要加""的，如果用.的方式来写，LatLong就不用加""，这就差不多是一个规定。
// 假设你还想进一步提取“LatLong”里面“lat"这个key对应的值，可以写meetingData[0]["LatLong"]["lat"]或者meetingData[0].LatLong.lat，道理是一样的，
// 得到的都是yyy。可能到这边你又会问了，为什么只能写meetingData[0]而不能写meetingData.0,这是因为对于meetingData来说它的每一个element不是key:value
// 的格式，0不是一个key，它只是这个element在meetingData里面的位置。
var meetingData = [];
// eachSeries in the async module iterates over an array and operates on each item in the array in series
// 这个async.eachSeries具体是啥我也不是很清楚,但这里pass in了addresses这个array,然后后面function(value, callback)的value就是addresses里的
// 每一个element,就是每一个meeting的地址.然后到request之前的就是在处理apiRequest,其实就是个网址说白了,得specify streetAddress是啥,city跟state是
// 每个地址都一样的所以直接hardcode就好了,然后再加上apiKey,这个是这个网址规定一定要有的,然后再specify显示出来的格式是JSON.这里这个JSON format其实跟
// 上面的讲的meetingData里的format差不多,但它不止两对大的key:Value,可能有十几对.你可以试试看不加'&format=json&version=4.01'看看在网页上显示出来的是
// 啥样子的,就知道区别在哪儿了.但我的理解是这里的JSON format仅仅是在网页上显示的时候是JSON的格式,但是把这个数据导出的时候可能只是plain text,所以下面
// 要用tamu = JSON.parse(body)来把导出来的数据变成真的可以处理的JSON format.下面新建那个object然后里面的格式就跟上面讲的meetingData里是一样的,你对照着
// 网页上显示出来的内容一看就看明白了,要记住的是在网页上如果是[]里面的那就不是key:value而是array,就像tamuGeo.OutputGeocodes[0],因为"OutputGeocodes"的
// 冒号后面跟着的是[ 而不是{, 所以用[0]来提取接下来{}的内容,就是"OutputGeocode" (没有s)这个key对应的value,所以可以用tamuGeo.OutputGeocodes[0].OutputGeocode,
// 然后再提接下来"Latitude","Longitude"两个key对应的value.然后这个object提出来之后就存到meetingData,理由跟上面把address存到addresses里面是一样的.再往下的code
// 应该没啥难得了,就是把meetingData写到file里面.
async.eachSeries(addresses, function(value, callback) {
    var apiRequest = 'https://geoservices.tamu.edu/Services/Geocode/WebService/GeocoderWebServiceHttpNonParsed_V04_01.aspx?';
    apiRequest += 'streetAddress=' + value.split(' ').join('%20');
    apiRequest += '&city=New%20York&state=NY&apikey=' + apiKey;
    apiRequest += '&format=json&version=4.01';
    
    request(apiRequest, function(err, resp, body) {
        // Error handling
        if(err) {throw err;}
        else {
            var tamuGeo = JSON.parse(body);
            // Create an object with the JSON formate {"address": value, "LatLong": {"lat": value, "lng": value}}
            var object = {
                "address": tamuGeo.InputAddress.StreetAddress,  
                "LatLong": {
                    "lat":tamuGeo.OutputGeocodes[0].OutputGeocode.Latitude,
                    "lng":tamuGeo.OutputGeocodes[0].OutputGeocode.Longitude
                }
            };
            // Add the object to the meetingData array
            meetingData.push(object);
        }
    });
    setTimeout(callback, 500);
}, function() {
    // Save meetingData to week3.json with a JSON format
    fs.writeFileSync('week3.json', JSON.stringify(meetingData));
    console.log('*** *** *** ** ***');
    console.log('Number of meetings in this zone: ');
    console.log(meetingData.length);
});

