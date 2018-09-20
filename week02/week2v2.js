// npm install cheerio

var fs = require('fs');
var cheerio = require('cheerio');

// load the thesis text file into a variable, `content`
// this is the file that we created in the starter code from last week
// var content = fs.readFileSync('data/mo10.txt/<tr style="margin-bottom:10px"></tr>');
var content = fs.readFileSync('data/mo10v1.txt');
// load `content` into a cheerio object
var $ = cheerio.load(content);

// print (to the console) names of thesis students

// content.querySelector("table").get(0) 
    

$('body > center > table > tbody > tr > td > table > tbody > tr:nth-child(2) > td > div > table > tbody tr>td')
.each(function(i, elem) {
    if(i==0||i==3||i==6||i==9||i==12||i==15||i==18||i==21||i==24||i==27||i==30||i==33||i==36||i==39||i==42||i==45||i==48||i==51||i==54||i==57||i==60||i==63)
    console.log(i+"meetingAddress :"+$(elem).text());
});


var meetingAddress = ''; // this variable will hold the lines of text

$('body > center > table > tbody > tr > td > table > tbody > tr:nth-child(2) > td > div > table > tbody>tr>td')
.each(function(i, elem) {
      if(i==0||i==3||i==6||i==9||i==12||i==15||i==18||i==21||i==24||i==27||i==30||i==33||i==36||i==39||i==42||i==45||i==48||i==51||i==54||i==57||i==60||i==63) {

    meetingAddress += ($(elem).text()) + '\n';}
});

fs.writeFileSync('data/week2v2.txt',meetingAddress);