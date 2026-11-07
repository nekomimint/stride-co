const path = require("path"); // para formar la ruta de locale
const i18n = require("i18n");

i18n.configure(
    {
        locales: ['es', 'en'],
        defaultLocale: 'en',   // si en la cookie del cliente no viene el idioma 
        fallbacks: {
            'es-*': 'es',   // Si se detecta una variación en español cambia directamente al idioma original
            'en-*': 'en',   //Si se detecta una variación en inglés cambia directamente al idioma original
        },
        directory: path.join(__dirname, '..', 'locales'), // con la libreria path, junta el directorio donde estamos
        // diferentes formas de indicarle de donde va a sacar el lang
        queryParameter: 'lang', // si yo digo ?lang=es
        header: 'accept-language', 
        cookie: 'lang', // si el cliente envia la cookie tomalo de ahi
        objectNotation: true // permite usar obj.valor
    }
);

module.exports = i18n;