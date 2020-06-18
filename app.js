// ===== CONFIG ===== //
const   express             = require('express'),
        app                 = express(),
        bodyParser          = require('body-parser'),
        mongoose            = require('mongoose'),
        methodOverride      = require('method-override'),
        expressSanitizer    = require('express-sanitizer');

mongoose.connect('mongodb+srv://login:pass@database?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
    }).then(() => {
        console.log('Connected to DB!');
    }).catch(err => {
        console.log('ERROR:', err.message);
    }
);
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

// ===== SCHEMA ===== //
const blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});

const Blog = mongoose.model("Blog", blogSchema);

// ===== RESTFUL ROUTES ===== //
app.get('/', (req, res) => {
    res.redirect("/blogs");
});

// INDEX route
app.get('/blogs', (req, res) => {
    Blog.find({}, (err, blogs) => {
        if(err)
            console.log(err);
        else
            res.render("index", {blogs: blogs});
    });
});

// NEW route
app.get('/blogs/new', (req, res) => {
    res.render("new");
});

// CREATE route
app.post('/blogs', (req, res) => {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    // create blog
    Blog.create(req.body.blog, (err, newBlog) => {
        if(err)
            res.render("new");
        else
            res.redirect("/blogs");
    });
});

// SHOW route
app.get('/blogs/:id', (req, res) => {
    Blog.findById(req.params.id, (err, foundBlog) => {
        if(err)
            res.redirect('/blogs');
        else
            res.render("show", {blog: foundBlog});
    });
});

// EDIT route
app.get('/blogs/:id/edit', (req, res) => {
    Blog.findById(req.params.id, (err, foundBlog) => {
        if(err)
            res.redirect('/blogs');
        else
            res.render("edit", {blog: foundBlog});
    });
});

// UPDATE route
app.put('/blogs/:id', (req, res) => {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err, updatedBlog) => {
        if(err)
            res.redirect('/blogs');
        else
            res.redirect("/blogs/" + req.params.id);
    });
});

// DESTROY route
app.delete('/blogs/:id', (req, res) => {
    Blog.findByIdAndRemove(req.params.id, (err) => {
        if(err)
            res.redirect('/blogs');
        else
            res.redirect('/blogs');
    });
});

// ===== START SERVER ===== //
app.listen(3000, () => {
    console.log("Server started!");
});