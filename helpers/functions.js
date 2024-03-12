const nodemailer = require("nodemailer");
const puppeteer = require("puppeteer");
const fs = require("fs").promises;
const uuid = require("uuid").v4;
const path = require("path");
require("dotenv").config();

async function crearPDF(baseUrl, dataPDF) {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();        
        await page.goto(baseUrl + encodeURIComponent(JSON.stringify(dataPDF)));
        const uniqueFilename = uuid() + ".pdf";
        const filePath = path.join(__dirname, uniqueFilename);
        await page.pdf({
            path: filePath,
            format: "A3"
        });
        await browser.close();
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
            baseUrl: "http://localhost:3000/viabilidad/PDF?data="
        } : {
            titulo: "Mensaje de contacto",
            texto: "El siguiente PDF contiene información detallada de la solicitud de contacto.",
            baseUrl: "http://localhost:3000/contacto/PDF?data="
        }

        const filePath = await crearPDF(options.baseUrl, data);
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

module.exports = { prepararEnvio, formatearTexto, desformatearTexto };