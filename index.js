const keys = require('./keys');
const express = require('express');
var exphbs  = require('express-handlebars');
const flash = require('connect-flash');
const session = require('express-session');
const Handlebars = require('handlebars');
const path = require('path');
const mongoose  = require('mongoose');
const app = express();
const MongoStore = require('connect-mongodb-session')(session);
const csrf = require('csurf')

//ROUTES
const homeRoutes = require('./routes/home');
const coursesRoutes = require('./routes/courses');
const aboutRoutes = require('./routes/about');
const addRoutes = require('./routes/add');
const cardRoutes = require('./routes/card');
const ordersRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');
//
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');
const varMiddleware = require('./middleware/variables');
const userMiddleware = require('./middleware/user');
//

const store = new MongoStore({
    collection: 'sessions',
    uri: keys.MONGODB_URI
});

const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs',
    helpers: require('./utils/hbs-helpers'),
    handlebars: allowInsecurePrototypeAccess(Handlebars)
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');

mongoose.set('useFindAndModify', false);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: true}));

app.use(session({
    secret: keys.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store
}));
app.use(flash());
app.use(csrf());
app.use(varMiddleware);
app.use(userMiddleware);


app.use('/', homeRoutes);
app.use('/courses', coursesRoutes);
app.use('/add', addRoutes);
app.use('/card', cardRoutes);
app.use('/orders', ordersRoutes);
app.use('/auth', authRoutes);
app.use('/about', aboutRoutes);

const PORT = process.env.PORT || 3000;

async function start() {
    try {
        await mongoose.connect(keys.MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true}); 

        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`);
        });  
    } catch (error) {
        console.log('Error connect to BD', error);
    }
}

start();