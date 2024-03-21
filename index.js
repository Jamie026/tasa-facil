const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const bodyParser = require("body-parser");
const handlebars = require("express-handlebars");

const port = process.env.PORT || 3000;

app.set("view engine", "hbs");

app.engine("hbs", handlebars.engine({
    defaultLayout: "index",
    layoutsDir: path.join(__dirname, "views/layouts"), 
    extname: "hbs",
    partialsDir: path.join(__dirname, "views/partials")
}));

app.set("views", [ path.join(__dirname, "views"), path.join(__dirname, "views/templates")]);

app.use(session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
}));

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash());

app.use((request, response, next) => {
    response.locals.success_msg = request.flash("success_msg");
    response.locals.error_msg = request.flash("error_msg");
    next();
});

const router = require("./routes/index.js");
const contacto = require("./routes/contacto.js");
const viabilidad = require("./routes/viabilidad.js");

app.use("/", router);
app.use("/contacto", contacto);
app.use("/viabilidad", viabilidad);

app.listen(port, () => console.log("App listening to port " + port));

app.use((request, response, next) => {
    return response.status(404).render("404");
});
  
app.use((error, request, response, next) => {
    response.status(error.status || 500);
    response.render("error", { error });
});