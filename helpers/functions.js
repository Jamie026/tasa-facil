require("dotenv").config();
const path = require("path");
const uuid = require("uuid").v4;
const PDF = require("html-pdf");
const fs = require("fs").promises;  
const nodemailer = require("nodemailer");
const handlebars = require("handlebars");

async function crearPDF(nameTemplate, dataPDF) {
    try {
        const hbsFilePath = path.join(__dirname, "..", "views", "templates", nameTemplate);
        const templateSource = await fs.readFile(hbsFilePath, "utf-8");
        const template = handlebars.compile(templateSource, { noEscape: true });
        const dataHTML = template({ data: dataPDF });
        const uniqueFilename = uuid() + ".pdf";
        const filePath = path.join(__dirname, uniqueFilename);
        const options = {
            "format": "A3",
            "border": "20px",
            "childProcessOptions": { env: { OPENSSL_CONF: '/dev/null' }}
        }
        await new Promise((resolve, reject) => {
            PDF.create(dataHTML, options).toFile(filePath, (error, response) => {
                error ? reject(error) : resolve(response);
            });
        });

        return filePath;
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

async function prepararEnvio(data, tipo, email) {
    try {
        const options = tipo === "viabilidad" ? {
            titulo: "Resultado de evaluación",
            texto: "El siguiente PDF contiene información detallada de la evaluación.",
            template: "viabilidadPDF.hbs"
        } : {
            titulo: "Mensaje de contacto",
            texto: "El siguiente PDF contiene información detallada de la solicitud de contacto.",
            template: "contactoPDF.hbs"
        }

        const filePath = await crearPDF(options.template, data);
        if(!filePath) return false;
        await enviarArchivo({ filename: "Información.pdf", path: filePath }, options, email);
        await eliminarPDF(filePath);
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

async function enviarArchivo(archivos, options, email) {
    try {
        const mailTransporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS,
            }
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

function desformatearTexto(texto) {
    return texto.replace(/_/g, " ");
}

function formatearTexto(texto) {
    return texto
        .replace(/\b\w/g, (char) => char.toUpperCase())
        .replace(/\s+/g, "_");
}

module.exports = { prepararEnvio, formatearTexto, desformatearTexto };