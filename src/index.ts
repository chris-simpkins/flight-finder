import axios from "axios";
import credentials from "../credentials.json" assert { type: "json" };

const defaultCurrency = "GBP";

const query = {
  adults: "1",
  origin: "LHR",
  destination: "MCO",
  departureDate: "2022-06-30"
};

const getFlights = async () => {
  try {
    const response = await axios.get(
      `https://skyscanner44.p.rapidapi.com/search-extended`,
      {
        params: {
          adults: query.adults,
          origin: query.origin,
          destination: query.destination,
          departureDate: query.departureDate,
          currency: defaultCurrency
        },
        headers: {
          "X-RapidAPI-Host": credentials.rapidApi.host,
          "X-RapidAPI-Key": credentials.rapidApi.apiKey
        }
      }
    );
    return response;
  } catch (err) {
    return err;
  }
};

const response = await getFlights();

console.log(response);
