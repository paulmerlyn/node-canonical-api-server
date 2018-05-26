'use strict';

const http = require('http');
const dateformat = require('dateformat');
const url = require('url');

const port = 7000;
const dateNowFormatted = dateformat(Date.now(), 'isoDateTime');
console.log(`dateNowFormatted is: ` + dateNowFormatted);
const generateRandomNumber = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

const carrier = ''; // Must initialize before runtime

const mockResponse = (accountNumber) => {
    return `
    <?xml version="1.0"?>
    <CreditCheck>
        <responseTimeStamp>${dateNowFormatted}</responseTimeStamp>
        <Status>Approved</Status>
        <AccountNumber>${accountNumber}</AccountNumber>
    </CreditCheck>
    </xml>
    `;
}

http.createServer((request, response) => {
    console.log(`Request received at URL: ${request.url}`);
    response.writeHead(200, {'Content-type':'text/xml'});
    setTimeout(() => {
        const accountNumber = generateRandomNumber(100000000000, 1000000000000);
        response.write(mockResponse(accountNumber));
        response.end();
    }, 0);
}).listen(port, () => console.log(`Listening on port ${port}...`));
