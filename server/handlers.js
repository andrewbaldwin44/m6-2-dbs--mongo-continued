'use strict';

const { MongoClient } = require("mongodb");
const assert = require('assert');

require("dotenv").config();
const { MONGO_URI } = process.env;

const getSeats = async (req, res) => {
  try {
    const client = await MongoClient(MONGO_URI, { useUnifiedTopology: true });

    await client.connect();

    const database = client.db('seat_booking');

    const seatsData = await database.collection('seats').find().toArray();

    return seatsData.reduce((seats, seatData) => {
      const { _id, price, isBooked } = seatData;

      seats[_id] = { price, isBooked };
      return seats;
    }, {});
  }
  catch (error) {
    throw new Error(error);
  }
};

module.exports = { getSeats };
