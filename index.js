const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0wqac.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('doctors'));
app.use(fileUpload());

const port = 5000;

app.get('/', (req, res) => {
    res.send("Database in response");
})


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const appointmentCollection = client.db("doctorsPortal").collection("appointments");
  const doctorCollection = client.db("doctorsPortal").collection("doctors");
  
    app.post('/addAppointment', (req, res) => {
        const appointment = req.body;
        appointmentCollection.insertOne(appointment)
        .then(result => {
            res.send(result.insertedCount)
        })
    });

    app.post('/appointmentsByDate', (req, res) => {
        const date = req.body;
        //console.log(date.date);
        appointmentCollection.find({date: date.date})
        .toArray((err, documents) => {
            res.send(documents);
        })
    });

    app.get('/allPatients', (req, res) => {
        appointmentCollection.find({})
        .toArray( (err, documents) => {
            res.send(documents);
        })
    });

    app.post('/addADoctor', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const email = req.body.email;
        console.log("Name:", name, "Email :", email, "file :", file);

        file.mv(`${__dirname}/doctors/${file.name}`, error => {

            if(error){
                console.log(error);
                return res.status(500).send({msg: 'Failed to upload Images'});
            }
            // return res.send({name: file.name, path: `/${file.name}`});
            doctorCollection.insertOne({ name, email, img: file.name })
            .then(result => {
                res.send(result.insertedCount > 0);
            })

        })

        
        

    })

    app.get('/doctors', (req, res) => {
        doctorCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
    });



});

app.listen(process.env.PORT || port);