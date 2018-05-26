'use strict';

const http = require('http');
const config = require('config');
const mustache = require('mustache');
const fs = require('fs');
const request = require('request');
const xml2jsParseString = require('xml2js').parseString;
const util = require('util');

const creditCheckTemplates = require('./lib/creditCheckTemplates.js');

const PORT = config.get('canonical_server.port');

const server = http.createServer((req, res) => {
    console.log('A connection has been received on port ' + PORT);
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString(); // convert Buffer to string
    });
    req.on('end', () => {
        console.log(body);
        let bodyObj = JSON.parse(body);

        /* (Optional) Extract data from the canonical request and preprocess (e.g. concatenate, change case, etc.) or validate */
        const customerFirstName = bodyObj.identity.firstName;
        const customerLastName = bodyObj.identity.lastName;
        const carrier = bodyObj.carrier;
        //console.log(`\nname from canonical request is: ${customerFirstName} ${customerLastName}, and carrier is: ${carrier}`);

        /* Build the carrier XML request for credit check using a template parser for each carrier. */
        const template = creditCheckTemplates.getCarrierCreditCheckRequestTemplate(carrier);
        //console.log('carrier request template is: ' + template);

        const context = {
            firstName: bodyObj.identity.firstName,
            lastName: bodyObj.identity.lastName,
            address: { 
                street: bodyObj.address.street,
                city: bodyObj.address.city,
                state: bodyObj.address.state,
                zip: bodyObj.address.zip
            },
            identity: {
                driverLicenseNumber: bodyObj.identity.driverLicenseNumber,
                driverLicenseState: bodyObj.identity.driverLicenseState,
                socialSecurityNumber: bodyObj.identity.socialSecurityNumber
            }
        };
                    
        const carrierRequest = mustache.render(template, context);
        console.log('carrierRequest is: ' + carrierRequest);
          
        /* Store the XML request with a timestamp in apihistory directory */
        const dateStringISO = new Date().toISOString();
        const dateStringForFileName = dateStringISO.replace(/[\:\.]/g, '_');
        const logContent = `Request for carrier ` + carrier + ` logged on ` + dateStringISO + `\n` + carrierRequest; 
        const filePath = './api_logs/' + carrier + '/' + carrier + '_' + dateStringForFileName + '.txt';
        /*fs.writeFile(filePath, logContent, err => {
            if (err) throw err;
            console.log('The file has been saved!');
        });
        */

        /* Send the request to the carrier or carrier responder asynchronously */
        if (config.get('use_carrier_responder')) {
            var url = config.get('carrier_responders.' + carrier + '.url');
            //console.log('Request url for carrier responder is: ' + url);
        } else {
            console.log('Support to call live carrier is required');
        };

        const options = {
            url: url,
            headers: {
                'Accept': 'text/xml',
                'Accept-Charset': 'utf-8'
            },
            body: carrierRequest
        };

        //console.log(`options is: ` + JSON.stringify(options));

        request.post(options, (err, resCarrier, bodyCarrierXML) => {
            if (err) {
                console.log(`Request is returning an error:` + err);
            } else {
                /* Handle the response, converting XML string (carrier API response) into JS object ... */
                //console.log(`Response from carrier/responder is: ` + bodyCarrierXML);
                xml2jsParseString(bodyCarrierXML, function (err, result) {
                    if (err) {
                        console.log('Error converting carrier response XML to JS: ' + err);
                    } else {
                        //console.log('result of xml2js conversion of carrier responder response:');
                        //console.log(util.inspect(result, {showHidden: false, depth: null}));

                        /* Extract data from the JS object representation of the carrier response ... */
                        /* ... then construct and return the canonical response */
                        const template = creditCheckTemplates.getCanonicalCreditCheckResponseTemplate();
                        //console.log('canonical credit check response template is: ' + template);
                        const context = {
                            customerFirstName: customerFirstName,
                            customerLastName: customerLastName,
                            approvalStatus: result.CreditCheck.Status,
                            accountNumber: result.CreditCheck.AccountNumber,
                        };
                        var canonicalResponse = mustache.render(template, context);
                        //console.log('Canonical response is: ' + canonicalResponse);

                        /* Send the canonical response to the client */
                        //res.write(canonicalResponse);
                        res.writeHead(200, {'Content-type':'application/json'});
                        res.write(canonicalResponse);
                        res.end(`\n`);
                    }
                });
            }
        });
    });
});

server.listen(PORT, () => {
    console.log(`\nlistening for a connection on port ` + PORT);
});