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
    

$("b").each(function(i, elem) {
// $("td h4").each(function(i, elem) {
    if($(elem).text().includes("-")) {
      console.log($(elem).text());
    }
})

 
    
// write the project titles to a text file
var meetingAddress = ''; // this variable will hold the lines of text

$("b").each(function(i, elem) {
      if($(elem).text().includes("-")) {

    meetingAddress += ($(elem).text()) + '\n';}
});

fs.writeFileSync('data/week2.txt',meetingAddress);