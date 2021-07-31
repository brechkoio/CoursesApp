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
const MONGODB_URI = 'mongodb+srv://SuperDB:C0i3ATKYUWI5CRe5@cluster0.cj5tv.mongodb.net/CoursesApp?retryWrites=true&w=majority';

//ROUTES
const homeRoutes = require('./routes/home');
const coursesRoutes = require('./routes/courses');
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
    uri: MONGODB_URI
});

const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs',
    handlebars: allowInsecurePrototypeAccess(Handlebars)
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');

mongoose.set('useFindAndModify', false);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: true}));
app.use(session({
    secret: 'some secret value',
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

const PORT = process.env.PORT || 3000;

async function start() {
    try {
        await mongoose.connect(MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true}); 

        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`);
        });  
    } catch (error) {
        console.log('Error connect to BD', error);
    }
}

start();