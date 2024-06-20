const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const handlebars = require("express-handlebars");
const bodyParser = require("body-parser");

const port = process.env.PORT || 3000;

app.set("view engine", "hbs");

app.engine("hbs", handlebars.engine({
    defaultLayout: "index",
    layoutsDir: path.join(__dirname, "views/layouts"), 
    extname: "hbs",
    partialsDir: path.join(__dirname, "views/partials")
}));

app.set("views", [ path.join(__dirname, "views"), path.join(__dirname, "views/templates")]);

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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