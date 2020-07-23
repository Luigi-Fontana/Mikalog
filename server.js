if (process.env.NODE_ENV !== 'production') { // Check if we are in production or development
    require('dotenv').config()
}

// Packages Installed
const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const articleRouter = require('./routes/articles')
const mongoose = require('mongoose')
const Article = require('./models/article')

// Database Connection
mongoose.connect('mongodb://localhost/mikalog',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    }
)

// Authentication
const initializePassport = require('./passport-config')
const { initialize } = require('passport')
initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

const users = [
    {
        id: Date.now().toString(),
        name: 'Luigi',
        email: 'w@w',
        password: '$2b$10$n5AsNCulOBhLdSjcKQ9pHeUXIeVwnk.NaZMr2oR6.HDiPnVkwmk0W'
    }
]

// Use
app.set('view engine', 'ejs') // Set ejs engine
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
app.use('/articles', articleRouter)
app.use('/dist/css', express.static('dist/css'))

// Admin Home Route
app.get('/articles', checkAuthenticated, async (req, res) => {
    const articles = await Article.find().sort({ createdAt: 'desc' })
    res.render('admin/index', { articles: articles })
})

// Guest Home Route
app.get('/', async (req, res) => {
    const articles = await Article.find().sort({ createdAt: 'desc' })
    res.render('guest/index', { articles: articles })
})

// Start Users Routes
app.get('/login', checkNotAuthenticated, (req, res) => { // Login Page
    res.render('login')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', { // Attempt a Login
    successRedirect: '/articles',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => { // Register Page
    res.render('register')
})

app.post('/register', checkNotAuthenticated, async (req, res) => { // Attempt a Registration
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect('/login')
    } catch {
        res.redirect('/register')
    }
    console.log(users);
})

app.delete('/logout', (req, res) => { // Logout
    req.logOut()
    res.redirect('/')
})
// End users routes

// Functions
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/articles')
    }
    next()
}

app.listen(3000)
