require('dotenv').config();
let unirest =  require('unirest');

let month = 2,
    length = 26,
    endDate,
    startDate,
    monthMax,
    newMonth,
    newStart,
    newEnd;

var newArray = [];
var pricingOptionsArray = [];

if(month = 2) {
  monthMax = 28;
} else if(month=4,6,9,11) {
  monthMax = 30;
} else {
  monthMax = 31;
}

function createSession (month, outbound, inbound){
  unirest
    .post("https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/pricing/v1.0")
    .header("X-RapidAPI-Key", process.env.API_KEY)
    .header("Content-Type", "application/x-www-form-urlencoded")
    .send("originPlace=LGW-sky")
    .send("destinationPlace=MCO-sky")
    .send(`outboundDate=2019-${month}-${outbound}`)
    .send(`inboundDate=2019-${month}-${inbound}`)
    //.send(`outboundDate=2019-02-10`)
    //.send(`inboundDate=2019-02-20`)
    .send("cabinClass=economy")
    .send("children=0")
    .send("infants=0")
    .send("groupPricing=false")
    //.send("excludeCarriers=") // Filter out results from these carriers (ids)
    .send("includeCarriers=1859") //Only return results from these carriers (ids)
    .send("country=UK")
    .send("currency=GBP")
    .send("locale=en-US")
    .send("adults=1")
    .end(function (result) {
      if(result.status === 201){
        let sessionKey = ((result.headers.location).split('/')).pop();
        retreiveResults(sessionKey);
      } else {
        console.log("Error: "+result.status)
      }
    });
}

function retreiveResults(sessionKey){
  //include carriers includeCarriers=VS%3BDL%3BUA%3BLH%3BAA%3BBA
  //stops &stops=0
  //sortOrder sortOrder=asc
  //sortType sortType=price
  //origin originAirports=MCO
  //destination destinationAirports=LHR

  unirest
    .get(`https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/pricing/uk2/v1.0/${sessionKey}?stops=0&sortOrder=asc&sortType=price&includeCarriers=VS&originAirports=LGW&destinationAirports=MCO&pageIndex=0&pageSize=10`)
    .header("X-RapidAPI-Key", `${process.env.API_KEY}`)
    .end(function (result) {
      if(result.status === 200){
        itineraryArray = result.body.Itineraries;
        console.log(result.body.Query.InboundDate);
        console.log(result.body.Query.OutboundDate);
        for(i=0;i<itineraryArray.length;i++){
          pricingOptionsArray.push(itineraryArray[i].PricingOptions);
        }
        console.log("itinierarys: "+pricingOptionsArray.length);
      }else{
        console.log("Error: "+result.status);
      }
    });
}

function flattenOptions() {
  newArray = [].concat.apply([], pricingOptionsArray);
  console.log(newArray.length);
}

//var newArray = [].concat.apply([], pricingOptionsArray);
//console.log(newArray);
// console.log("3:   " + newArray);
// console.log(" ");
//new array is array of all agents with their price
//go through new array and filter out agents
//go through new filtered array and find cheapest price

for(startDate=1; startDate <= (monthMax-length); startDate++){
  endDate = startDate + length;
  newMonth = "0"+month.toString();
  if(startDate < 10){
    newStart = "0"+startDate.toString();
  }else{
    newStart = startDate.toString();
  }
  if(endDate < 10){
    newEnd = "0"+endDate.toString();
  }else{
    newEnd = endDate.toString();
  }

  createSession(newMonth, newStart, newEnd);
}

flattenOptions();
