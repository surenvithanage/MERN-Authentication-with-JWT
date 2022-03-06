const express = require('express');
const cors = require('cors');
const db = require("./models");
const dbConfig = require("./config/db.config");

const Role = db.role;

const app = express();

const PORT = process.env.PORT || 8080;

var corsOptions = {
    origin: "http://localhost:8081"
};

//without any options allow any
//app.use(cors());

// with options
app.use(cors(corsOptions));

// parse requests of content-type = application/json
app.use(express.json());

// parse requests of content-type = application/x-www-form-urlencoded
app.use(express.urlencoded({extended: true}));

app.get("/", (request, response) => {
    response.json({message: "Welcome to management tool server"});
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


db.mongoose.connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Successfully connected to MongoDB.");
    initialize();
}).catch(error => {
    console.log("Connection error", error);
    process.exit();
});

function initialize() {
    // estimate the number of documents in the MongoDB collection
    // used for large collections because this function uses collection metadata rather than scanning the entire collection
    Role.estimatedDocumentCount((err, count) => {
        if (!err && count === 0) {
            new Role({
                name: "user"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }
                console.log("added 'user' to roles collection");
            });

            new Role({
                name: "moderator"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }
                console.log("added 'moderator' to roles collection");
            })

            new Role({
                name: "admin"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }
                console.log("added 'admin' to roles collection");
            })
        }
    })
}


require("./routes/auth.routes")(app);
require("./routes/user.routes")(app);