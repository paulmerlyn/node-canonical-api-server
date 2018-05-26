'use strict';

module.exports = {
    getCarrierCreditCheckRequestTemplate: carrier => {
        // return string according to switch of carrier
        switch(carrier) {
            case 'ATT' :
                return `
                    <ATTcreditcheckrequest xmlns:i="http://www.w3.org/2001/XMLSchema-instance">
                    <fullName>{{ firstName }} {{ lastName }}</fullName>
                    <address>
                    <addressLine1>{{ address.street }}</addressLine1>
                    <city>{{ address.city }}</city>
                    <state>{{ address.state }}</state>
                    <postalCode>{{ address.zip }}</postalCode>
                    </address>
                    <driverLicStateNumber>{{ identity.driverLicenseState }}-{{ identity.driverLicenseNumber }}</driverLicStateNumber>
                    <ssn>{{ identity.socialSecurityNumber }}</ssn>
                    </creditcheckrequest>
                `;
                break;
            case 'SPT' :
                return `
                    <SPRINTcreditcheckrequest xmlns:i="http://www.w3.org/2001/XMLSchema-instance">
                    <fullName>{{ firstName }} {{ lastName }}</fullName>
                    <address>
                    <addressLine1>{{ address.street }}</addressLine1>
                    <city>{{ address.city }}</city>
                    <state>{{ address.state }}</state>
                    <postalCode>{{ address.zip }}</postalCode>
                    </address>
                    <driverLicStateNumber>{{ identity.driverLicenseState }}-{{ identity.driverLicenseNumber }}</driverLicStateNumber>
                    <taxID>{{ identity.socialSecurityNumber }}</taxID>
                    </creditcheckrequest>
                `;
                break;
            case 'VZN':
                return `
                    <VERIZONcreditcheckrequest xmlns:i="http://www.w3.org/2001/XMLSchema-instance">
                    <fullName>{{ firstName }} {{ lastName }}</fullName>
                    <address>
                    <addressLine1>{{ address.street }}</addressLine1>
                    <city>{{ address.city }}</city>
                    <state>{{ address.state }}</state>
                    <postalCode>{{ address.zip }}</postalCode>
                    </address>
                    <driverLicStateNumber>{{ identity.driverLicenseState }}-{{ identity.driverLicenseNumber }}</driverLicStateNumber>
                    <socialSecurityNumber>{{ identity.socialSecurityNumber }}</socialSecurityNumber>
                    </creditcheckrequest>
                `;
                break;
        }
    },
    getCanonicalCreditCheckResponseTemplate: () => {
        return `
            {
                "api": "canonical_creditCheck",
                "response": {
                    "customerName": "{{ customerFirstName }} {{ customerLastName }}",
                    "approvalStatus": "{{ approvalStatus }}",
                    "accountNumber": "{{ accountNumber }}"
                }
            }
        `;
    }
}