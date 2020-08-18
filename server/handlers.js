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
  catch ({ message }) {
    throw new Error(message);
  }
};

async function bookSeat(_id) {
  try {
    if (!_id) throw new Error('Invalid request');

    const client = await MongoClient(MONGO_URI, { useUnifiedTopology: true });

    await client.connect();

    const database = client.db('seat_booking');

    const newValues = { $set: { isBooked: true } };

    const databaseResponse = await database.collection("seats")
                                           .updateOne({ _id }, { ...newValues});

    assert.equal(1, databaseResponse.matchedCount);
    assert.equal(1, databaseResponse.modifiedCount);

    client.close();

    return;
  }
  catch (error) {
    console.log(error)
    throw new Error(error);
  }
}


async function createUser(fullName, email, seatID) {
  try {
    const client = await MongoClient(MONGO_URI, { useUnifiedTopology: true });

    await client.connect();

    const database = client.db('seat_booking');

    const databaseResponse = await database.collection("users").insertOne({
      fullName,
      email,
      bookedSeats: { [seatID]: true },
    });

    assert.equal(1, databaseResponse.insertedCount);

    client.close();

    return
  }
  catch ({ message }) {
    throw new Error(message);
  }
}

async function updateBooking(req, res) {
  const { seatID: _id } = req.body;

  try {
    const client = await MongoClient(MONGO_URI, { useUnifiedTopology: true });

    await client.connect();

    const database = client.db('seat_booking');

    const newValues = { $set: { isBooked: false } };
    const databaseResponse = await database.collection("seats").updateOne(
      { _id }, { ...newValues},
    );

    assert.equal(1, databaseResponse.matchedCount);
    assert.equal(1, databaseResponse.modifiedCount);

    client.close();

    res.status(200).json({ status: 200, seatID: _id });
  }
  catch (error) {
    console.log(error);
    res.status(404).json({ status: 404, ...error });
  }
}

async function updateUser(req, res) {
  let { fullName, email, newFullName, newEmail } = req.body;

  try {
    const client = await MongoClient(MONGO_URI, { useUnifiedTopology: true });

    await client.connect();

    const database = client.db('seat_booking');

    console.log(newFullName, newEmail)

    let newValues;
    let filter;
    if (email) {
      filter = {"email": email};
      newValues = { $set: { email: newFullEmail } };
    }
    else {
      filter = {"fullName": fullName};
      newValues = { $set: { fullName: newFullName } };
    }

    const databaseResponse = await database.collection("users").updateOne(
      {...filter},
      {...newValues}
    );

    // assert.equal(1, databaseResponse.matchedCount);
    // assert.equal(1, databaseResponse.modifiedCount);

    client.close();

    res.status(200).json({ status: 200, ...newValues });
  }
  catch (error) {
    console.log(error);
    res.status(404).json({ status: 404, ...error });
  }
}

module.exports = {
  getSeats,
  bookSeat,
  createUser,
  updateBooking,
  updateUser,
};
