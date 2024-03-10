const handlebars = require("handlebars");
const nodemailer = require("nodemailer");
const fs = require("fs").promises;
const PDF = require("html-pdf");
const path = require("path");
require("dotenv").config();

async function crearPDF(plantillaNombre, data){
    try {
        const plantillaRuta = path.join(__dirname, "..", "views", "templates", plantillaNombre);
        const plantillaEsquema = await fs.readFile(plantillaRuta, "utf-8");
        const plantilla = handlebars.compile(plantillaEsquema, { noEscape: true });
        const dataHTML = plantilla({ data: data });
        const options = {
            format: "A3",
            childProcessOptions: { env: { OPENSSL_CONF: '/dev/null' }}
        }
        const PDFResponse = await new Promise((resolve, reject) => {
            PDF.create(dataHTML, options).toFile((error, response) => {
                error ? reject(error) : resolve(response);
            });
        });
        return PDFResponse;
    } catch (error) {
        console.log(error);
        return false;
    }
}

async function eliminarPDF(archivoRuta) {
    try {
        await fs.unlink(archivoRuta);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

async function enviarArchivo(data, tipo, email) {
    try {
        const options = tipo === "viabilidad" ? {
            titulo: "Resultado de evaluación",
            texto: "El siguiente PDF contiene información detallada de la evaluación.",
            plantillaNombre: "viabilidad.hbs"
        } : {
            titulo: "Mensaje de contacto",
            texto: "El siguiente PDF contiene información detallada de la solicitud de contacto.",
            plantillaNombre: "contacto.hbs"
        }

        const PDFResponse = await crearPDF(options.plantillaNombre, data);

        if(!PDFResponse) return false;

        await prepararEnvio({ filename: "Información.pdf", path: PDFResponse.filename }, options, email);
        await eliminarPDF(PDFResponse.filename);
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

async function prepararEnvio(archivos, options, email) {
    try {
        const mailTransporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS
            },
        });

        const mailDetails = {
            from: "REDIN Perú <redinperu@gmail.com>",
            to: email,
            subject: options.titulo,
            text: options.texto,
            attachments: archivos
        };
        await mailTransporter.sendMail(mailDetails);
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

function desformatearTexto(texto){
    return texto.replace(/_/g, " ");
};

function formatearTexto(texto){
    return texto.replace(/\b\w/g, char => char.toUpperCase()).replace(/\s+/g, "_");
}

module.exports = { enviarArchivo, formatearTexto, desformatearTexto };