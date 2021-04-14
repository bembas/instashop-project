require("dotenv").config();
// Example express application adding the parse-server module to expose Parse
// compatible API routes.

const express = require('express');
const ParseServer = require('parse-server').ParseServer;
const ParseDashboard = require('parse-dashboard');
const path = require('path');
const cors = require('cors');
const sharp = require('sharp');
const args = process.argv || [];
const test = args.some(arg => arg.includes('jasmine'));

const databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
    console.log('DATABASE_URI not specified, falling back to localhost.');
}
const config = {
    databaseURI: process.env.DATABASE_URI || 'mongodb://localhost:27017/dev',
    cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
    appId: process.env.APP_ID || 'myAppId',
    masterKey: process.env.MASTER_KEY || '', //Add your master key here. Keep it secret!
    serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse', // Don't forget to change to https if needed
    liveQuery: {
        classNames: ['Posts', 'Comments'], // List of classes to support for query subscriptions
    },
    maxUploadSize: "5mb" //5mb limit :)
};


const dashboard = new ParseDashboard({
    apps: [{
        serverURL: `${process.env.SERVER_URL}`,
        appId: process.env.APP_ID,
        masterKey: process.env.MASTER_KEY,
        appName: process.env.APP_NAME
    }],
    users: [{
        user: process.env.APP_USER,
        pass: process.env.APP_PASS
    }]
});

// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

const app = express();

// Enable Cors
app.use(cors());

// parse application/json
app.use(express.json({ limit: '50mb' })); //Used to parse JSON bodies
app.use(express.urlencoded({ limit: '50mb' }));

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve parse dashboard
app.use('/dashboard', dashboard);

// Serve the Parse API on the /parse URL prefix
const mountPath = process.env.PARSE_MOUNT || '/parse';
if (!test) {
    const api = new ParseServer(config);
    app.use(mountPath, api);
}

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
    res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function(req, res) {
    res.sendFile(path.join(__dirname, '/public/test.html'));
});

const port = process.env.PORT || 1337;
if (!test) {
    const httpServer = require('http').createServer(app);
    httpServer.listen(port, function() {
        console.log('parse-server-example running on port ' + port + '.');
    });
    // This will enable the Live Query real-time server
    ParseServer.createLiveQueryServer(httpServer);
}

// Parse Server plays nicely with the rest of your web routes
app.get('/dubai', async(req, res) => {

    try {
        const dubaiQuery = new Parse.Query('Dubai');
        dubaiQuery.ascending("order");

        const dubaiResults = await dubaiQuery.find();

        //Debug
        // console.group(dubaiResults);


        res.status(200).json(dubaiResults);
    } catch (error) {
        console.log(error);

        res.status(400).json({ message: "Error in get all" })
    }
});


app.get('/dubai/:id', async(req, res) => {

    const objectId = req.params.id;
    try {
        const dubaiQuery = new Parse.Query('Dubai');

        const dubaiResultsById = await dubaiQuery.get(objectId);

        //Debug
        // console.group(dubaiResultsById);


        res.status(200).json(dubaiResultsById);
    } catch (error) {
        console.log(error);

        res.status(400).json({ message: "Error in get by id" })
    }
});


app.put('/dubai/:id', async(req, res) => {

    const objectId = req.body.objectId;
    const body = req.body;

    try {
        const dubaiQuery = new Parse.Query('Dubai');

        const dubaiResultsById = await dubaiQuery.get(objectId);


        // Title
        dubaiResultsById.set("title", (body.title) ? body.title : "");
        // Url
        dubaiResultsById.set("url", body.url ? body.url : "");
        // Location
        let location = [];
        location.push(body.long);
        location.push(body.lat);

        dubaiResultsById.set("location", location.length > 0 ? location : "");
        // Short info 
        dubaiResultsById.set("short_info", body.short_info ? body.short_info : "");
        // Descr
        dubaiResultsById.set("description", body.description ? body.description : "");


        //Debug
        console.group(dubaiResultsById);

        if (body.image) {

            // The full image
            const file = new Parse.File("image.png", { base64: body.image }, "image/png");
            await file.save().then(res => {
                dubaiResultsById.set("image", res);

            }), (error => {
                console.log('Error on loading image', error);
            });

            // The thumnail (250x250)
            const fileData = await file.getData();
            const str = fileData.toString('base64');
            const imageBuffer = Buffer.from(str, 'base64');
            const width = parseInt(process.env.PHOTO_WIDTH);
            const height = parseInt(process.env.PHOTO_HEIGHT);

            const newImageBuffer = await sharp(imageBuffer)
                .resize(width, height)
                .toBuffer();

            const fileThumbnail = new Parse.File('thumbnail.png', { base64: newImageBuffer.toString('base64') }, 'image/jpg');
            await fileThumbnail.save().then(res => {
                dubaiResultsById.set("photo_thumb", res);

            }), (error => {
                console.log('Error on loading thumbnail image', error);
            });

        }


        await dubaiResultsById.save();

        res.status(200).json({ message: 'Updated successfully' });
    } catch (error) {
        console.log(error);

        res.status(400).json({ message: "Error in update" })
    }
});

app.post('/login', async(req, res) => {

    Parse.User.enableUnsafeCurrentUser();
    const body = req.body;
    // console.log(req)
    const user = body.username;
    const pass = body.password;

    try {
        await Parse.User.logIn(user, pass);
        const userResult = Parse.User.current();
        res.status(200).json(userResult);
    } catch (error) {
        console.log(error);

        res.status(400).json({ message: "Invalid username or password." });
    }
});


app.post('/logout', async(req, res) => {

    Parse.User.enableUnsafeCurrentUser();

    try {
        await Parse.User.logOut();

        res.status(200).json({ message: 'User logged out.' });
    } catch (error) {
        console.log(error);

        res.status(400).json({ message: "Invalid username or password." });
    }
});


module.exports = {
    app,
    config,
};