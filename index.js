const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

//midware
app.use(cors());
app.use(express.json());



app.get('/', (req, res) => {
    res.send('Hello patieant come with me!')
})

app.listen(port, () => {
    console.log(`Doctors portal server running ${port}`)
})