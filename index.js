const express = require('express');
const cors = require('cors');
require ('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

//midware
app.use(cors());
app.use(express.json());



app.get('/', (req, res) => {
    res.send('Hello patieant come with me!')
})


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.io31lql.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
    const apointmentOpstionCollection = client.db('doctors-portal').collection('apointmentoption')
    const bookingsCollection = client.db('doctors-portal').collection('bookings');

    app.get('/bookingoptions', async(req, res) => {
    const query = {};
    const bookingOpions = await apointmentOpstionCollection.find(query).toArray()
    res.send(bookingOpions)
    })


    app.post('/booking', async(req, res)=> {
        const booking = req.body;
        const result = await bookingsCollection.insertOne(booking);
        res.send(result);
        
    })


    }
    finally{

    }
}
run().catch(erorr => console.log(erorr))
app.listen(port, () => {
    console.log(`Doctors portal server running ${port}`)
})