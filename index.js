const express = require('express');
var exphbs  = require('express-handlebars');
const path = require('path');
const app = express();

const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs'
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('index', {
        title: 'Home',
        isHome: true
    });
});

app.get('/courses', (req, res) => {
    res.render('courses', {
        title: 'Courses',
        isCourses: true
    });
});

app.get('/add', (req, res) => {
    res.render('add', {
        title: 'Add Course',
        isAdd: true
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});