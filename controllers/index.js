const Product = require('../models/relationals/Product');


function healthCheck(req, res) {
res.status(200).json({
status: 'UP'
});

}


async function home(req, res)
{
    const products = await Product.findAll();

    // render pide como primer parametro 
    // el nombre del template que va a desplegar
    res.render('index',{title: 'Stride-Co', products: products});
}
module.exports = { healthCheck, home};