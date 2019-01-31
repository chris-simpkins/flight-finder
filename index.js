require('dotenv').config();
let unirest =  require('unirest');

//var resultsLocation;
//var sessionKey;

var pricingOptionsArray = [];

let month = 2,
    length = 26,
    endDate,
    startDate,
    monthMax,
    newMonth,
    newStart,
    newEnd;

if(month = 2) {
  monthMax = 28;
} else if(month=4,6,9,11) {
  monthMax = 30;
} else {
  monthMax = 31;
}

console.log(process.env.API_KEY);

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
    .send("includeCarriers=1859") //Only return results from these carriers (ids)
    .send("country=UK")
    .send("currency=GBP")
    .send("locale=en-US")
    .send("adults=1")
    .end(function (result) {
      console.log("status: "+result.status);
      let resultsLocation = result.headers.location;
      let sessionKey = (resultsLocation.split('/')).pop();      

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
          console.log("Dates: "+month + "/" + outbound + " - " + month + "/" + inbound);
          var itineraryArray = result.body.Itineraries;
          for(i=0;i<itineraryArray.length;i++){
            pricingOptionsArray.push(itineraryArray[i].PricingOptions);
          }
          console.log("1:         " )
          console.log(pricingOptionsArray);
          console.log(" ");
          console.log("2:      "+ pricingOptionsArray[1]);
          console.log(" ");

          //var newArray = [].concat.apply([], pricingOptionsArray);
          //console.log(newArray);
          // console.log("3:   " + newArray);
          // console.log(" ");
          //new array is array of all agents with their price
          //go through new array and filter out agents
          //go through new filtered array and find cheapest price
        });
    });
}

// function response() {

//   unirest.get(`https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/pricing/uk2/v1.0/${sessionKey}?pageIndex=0&pageSize=10`)
//   .header("X-RapidAPI-Key", `${process.env.API_KEY}`)
//   .end(function (result) {
//     console.log(result.status, result.headers, result.body);
//   });

// }

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

//response();
