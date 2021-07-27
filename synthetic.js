const fs = require('fs')
const util = require('util')
const xml2js = require('xml2js')
const parser = new xml2js.Parser()
const builder = new xml2js.Builder({cdata: true})
const path = require('./shared/path')
const make_output_dir = require('./shared/make_output_dir')
const beer = require('./feed_data/beer')

const input_file_path = `./${path.input.folder}/${path.synthetic.input.file}`
const output_file_path = `./${path.output.folder}/${path.synthetic.output.file}`
const vendor_name = 'Smart Food Shop'
const producing_country = 'Польша'

// Make output dir
make_output_dir(path.output.folder)

// Read feed file
const feed_content = fs.readFileSync(input_file_path)

parser.parseString(feed_content, function (err, result) {
    //console.log(util.inspect(result, false, null))
    let offers = result.yml_catalog.shop[0].offers[0].offer

    // Remove beer
    // synth doesn't support 18+ products
    const offers_without_beer = offers.filter(offer => !beer.includes(offer['$'].id))
    result.yml_catalog.shop[0].offers[0].offer = offers_without_beer

    // Update <offer> tag
    offers.forEach(offer => {
        
        // Add available attr
        offer['$'].available = 'true';

        // Add <quantity>
        offer.quantity = 100

        // Enforce adding <cdata> in description
        offer.description = offer.description + '<!--Enforce cdata-->'

        // Check <vendor> tag
        if (!offer.vendor) offer.vendor = [vendor_name]
        else if (!offer.vendor[0]) offer.vendor[0] = vendor_name

        // Check <param> existance
        // If no params add producing country param
        if (!offer.param) offer.param = [{ _: producing_country, '$': { name: 'Производитель' }}]
    })

    // Build xml
    const xml = builder.buildObject(result)
    fs.writeFileSync(output_file_path, xml)

    console.log('synthetic feed done')
})