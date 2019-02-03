require('dotenv').config();
let unirest =  require('unirest');
let agents = require('./agents.js');

var date = new Date();

let month = 9,
    length = 7,
    endDate,
    startDate =1,
    year=date.getYear();
    
let monthMax = new Date(year, month, 0).getDate();

console.log(monthMax);

var priceList = [];
var pricingOptionsArray = [];

function createSession (month, outbound, inbound){
  unirest
    .post("https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/pricing/v1.0")
    .header("X-RapidAPI-Key", process.env.API_KEY)
    .header("Content-Type", "application/x-www-form-urlencoded")
    .send("originPlace=LGW-sky")
    .send("destinationPlace=MCO-sky")
    .send(`outboundDate=2019-${month}-${outbound}`)
    .send(`inboundDate=2019-${month}-${inbound}`)
    .send("cabinClass=economy")
    .send("children=0")
    .send("infants=0")
    .send("groupPricing=false")
    //.send("excludeCarriers=") // Filter out results from these carriers (ids)
    //.send("includeCarriers=1859") //Only return results from these carriers (ids)
    .send("country=UK")
    .send("currency=GBP")
    .send("locale=en-US")
    .send("adults=1")
    .end(function (result) {
      if(result.status === 201){
        let sessionKey = ((result.headers.location).split('/')).pop();
        retreiveResults(sessionKey);
      } else {
        console.log("POST Error: "+result.status);
        process.exit();
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
    .get(`https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/pricing/uk2/v1.0/${sessionKey}?stops=0&sortOrder=asc&sortType=price&originAirports=LGW&destinationAirports=MCO&pageIndex=0&pageSize=10`)
    .header("X-RapidAPI-Key", `${process.env.API_KEY}`)
    .end(function (result) {
      if(result.status === 200){
        itineraryArray = result.body.Itineraries;
        console.log(result.body.Query.InboundDate);
        console.log(result.body.Query.OutboundDate);
        for(i=0;i<itineraryArray.length;i++){
          pricingOptionsArray.push(itineraryArray[i].PricingOptions);
        }
        console.log("itineraries: "+itineraryArray.length);
        console.log("total: " +pricingOptionsArray.length);
        startDate++;
        main();
      }else{
        console.log("GET Error: "+result.status);
        process.exit();
      }
    });
}

function flattenOptions() {
  priceList = [].concat.apply([], pricingOptionsArray);
  console.log(priceList.length);
  filterOptions();
}

function filterOptions() {
  let beforeList = priceList.length;
  priceList.forEach(function(option, index) {
     let unfilteredAgent = option.Agents[0];
     var found = agents.excludeAgents.some(function(object) {
       return object.Id === unfilteredAgent;
     });
     if(found) { 
      priceList.splice(index, 1)};
  });
  let afterList = priceList.length;
  if(beforeList !== afterList){
    filterOptions();
  } else {
    console.log("fully filtered: ")
    console.log(priceList);
    findCheapest();
  }
}

function findCheapest() {
  let lowestPrice = priceList[0].Price;
  let lowestPriceIndex;
  priceList.forEach(function(option, index){
    if(option.Price < lowestPrice){
      lowestPrice = option.Price;
      lowestPriceIndex = index;
    }
  });
  console.log("lowest price: "+ lowestPrice);
  console.log("lowest price index: "+ lowestPriceIndex);
  console.log(priceList[lowestPriceIndex]);
}

function main() {
  if(startDate > (monthMax-length)){
    console.log("Completed main");
    flattenOptions();
  }else{
    console.log(startDate);
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
}

main();
