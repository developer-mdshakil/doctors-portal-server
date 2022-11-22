const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require ('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

//midware
app.use(cors());
app.use(express.json());



app.get('/', (req, res) => {
    res.send('Hello patieant come with me!')
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.io31lql.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).send('unauthoraied')
    }
    const token = authHeader.split(' ')[1]
    
    jwt.verify(token, process.env.ACCESS_TOKEN, function(err, decoded){
        if(err){
            return res.status(401).send('unauthorizied')
        }
        req.decoded = decoded;
        next();
    })

}

async function run(){
    try{
    const apointmentOpstionCollection = client.db('doctors-portal').collection('apointmentoption')
    const bookingsCollection = client.db('doctors-portal').collection('bookings');
    const usersCollection = client.db('doctors-portal').collection('users');

    
    app.get('/bookingoptions', async(req, res) => {
        const date = req.query.date;
        const query = {};
        const bookingOpions = await apointmentOpstionCollection.find(query).toArray()

        const bookingQuery = {apointmentData: date}
        const alreadtBooked = await bookingsCollection.find(bookingQuery).toArray();
        bookingOpions.forEach( option => {
            const optionsBooked = alreadtBooked.filter(book => book.treatment === option.name);
            const bookSlot = optionsBooked.map(book => book.slot);
            const remainingSlot = option.slots.filter(slot => !bookSlot.includes(slot));
            option.slots = remainingSlot
        })
        res.send(bookingOpions)
    })

    app.get('/bookings', verifyJWT, async(req, res) => {
        const email = req.query.email;
        const decodedEmail = req.decoded.email;
        if(email !== decodedEmail){
            return res.status(403).send({message: 'forbidend access'})
        }
        const query = {email: email};
        const bookings = await bookingsCollection.find(query).toArray()
        res.send(bookings)
    })
    
    app.post('/booking', async(req, res)=> {
        const booking = req.body;
        const result = await bookingsCollection.insertOne(booking);
        res.send(result);
        
    })
    app.get('/users/admin/:email', async(req, res)=> {
        const email = req.params.email;
        const query = { email };
        const user = await usersCollection.findOne(query);
        res.send({ isAdmin: user?.role === 'admin'})
    })
    app.get('/users', async(req, res)=> {
        const query = {};
        const users = await usersCollection.find(query).toArray();
        res.send(users)
    })

    app.put('/users/admin/:id', verifyJWT, async(req, res)=> {
        const decodedEmail = req.decoded.email;
        const query = {email: decodedEmail};
        const user = await usersCollection.findOne(query);
        if(user?.role !== 'admin'){
            return res.status(403).send({message: 'forbidend access'})
        }
        const id = req.params.id;
        const filter = {_id: ObjectId(id)};
        const options = { upsert: true };
        const updateDoc ={
            $set: {
                role: 'admin'
            }
        }
        const result = await usersCollection.updateOne(filter, updateDoc,options);
        res.send(result)
    })

    app.post('/users', async(req, res) => {
        const user = req.body;
        const result = await usersCollection.insertOne(user);
        res.send(result);
    })

    app.get('/jwt', async(req, res)=> {
        const email = req.query.email;
        const query = {email: email};
        const user = await usersCollection.findOne(query);
        if(user){
            const token = jwt.sign({email}, process.env.ACCESS_TOKEN, {expiresIn: '1h'});
            return res.send({Access_token: token})
        }
        res.status(403).send({access: ''})
    })
    
    }
    finally{

    }
}
run().catch(erorr => console.log(erorr))
app.listen(port, () => {
    console.log(`Doctors portal server running ${port}`)
})