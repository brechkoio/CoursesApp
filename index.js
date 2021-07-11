const express = require('express');
var exphbs  = require('express-handlebars');
const Handlebars = require('handlebars');
const path = require('path');
const mongoose  = require('mongoose');
const app = express();
const homeRoutes = require('./routes/home');
const coursesRoutes = require('./routes/courses');
const addRoutes = require('./routes/add');
const cardRoutes = require('./routes/card');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');
const User = require('./models/user');

const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs',
    handlebars: allowInsecurePrototypeAccess(Handlebars)
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');

app.use(async (req, res, next) => {
    try {
        const user = await User.findById('60e72f6167ad462124f7e81c');
        req.user = user;
        next();
    } catch (error) {
        console.log('User error', error);
    }
});
mongoose.set('useFindAndModify', false);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: true}));

app.use('/', homeRoutes);
app.use('/courses', coursesRoutes);
app.use('/add', addRoutes);
app.use('/card', cardRoutes);

const PORT = process.env.PORT || 3000;



async function start() {
    try {
        const url = 'mongodb+srv://SuperDB:C0i3ATKYUWI5CRe5@cluster0.cj5tv.mongodb.net/CoursesApp?retryWrites=true&w=majority';
        await mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true}); 
        const candidate = await User.findOne();
        if (!candidate) {
            const user = new User({
                email: 'yuriibrechko@gmail.com',
                name: 'Yurii',
                cart: {items: []}
            });
            await user.save();
        }
        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`);
        });  
    } catch (error) {
        console.log('Error connect to BD', error);
    }
}

start();