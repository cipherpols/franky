var fs = require("fs");
var x = require('casper').selectXPath;
var utils = require("utils");

var config = {
    accountTitle: "//*[@id='nav-link-accountList']/span[1][normalize-space(text())='Hello, Tuan']",
    productTile: '//input[@id="ftSelectAsin" and @value="B00GIYHAEQ"]',
};

const cssSelectors = {
    login: {
        email: 'input#ap_email',
        password: 'input#ap_password',
        rememberMe: 'input[name="rememberMe"]',
        signInButton: 'input#signInSubmit',
    },
    cartPage: {
        pageHeadline: '.sc-cart-header',
        deleteButton: 'input[value=\"Delete\"]',
        productDeletedContainer: '.sc-list-item-removed-msg'
    },
    /**
     * Address page
     */
    addressList: {
        editFirst: '#ya-myab-address-edit-btn-0',
        editAddressTitle: '#address-ui-widgets-enterAddressFormContainer h2',
        addressForm: {
            country: '#address-ui-widgets-countryCode-dropdown-nativeId',
            fullName: '#address-ui-widgets-enterAddressFullName',
            addressLine1: '#address-ui-widgets-enterAddressLine1',
            addressLine2: '#address-ui-widgets-enterAddressLine2',
            city: '#address-ui-widgets-enterAddressCity',
            state: '#address-ui-widgets-enterAddressStateOrRegion',
            zipCode: '#address-ui-widgets-enterAddressPostalCode',
            phone: '#address-ui-widgets-enterAddressPhoneNumber',
            submitButton: '.a-button-input',
        },
        addressSaved: '.a-alert-heading'
    },
    productDetail: {
        oneClickOrderingButton: '#one-click-button',
        oneClickOrderingSelectAddress: '.a-popover-trigger',
        oneClickBoxEnable: '.oneClickSignInLink'
    }
};

const pages = {
    startPage: 'https://www.amazon.com/ap/signin?ref=icp_country_us&_encoding=UTF8&openid.assoc_handle=usflex&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.mode=checkid_setup&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0&openid.ns.pape=http%3A%2F%2Fspecs.openid.net%2Fextensions%2Fpape%2F1.0&openid.pape.max_auth_age=0&openid.return_to=https%3A%2F%2Fwww.amazon.com%2F%3Fref_%3Dnav_signin',
    address: 'https://www.amazon.com/a/addresses',
    cartPage: 'https://www.amazon.com/gp/cart/view.html/ref=nav_cart'
};

/**
 *
 * @type {string}
 */
const account = "//*[@id='nav-link-accountList']/span[1][normalize-space(text())='Hello, Tuan']";

/**
 * Address
 * @type {string}
 */
const enterAddressFullName = '//input[@name="enterAddressFullName"]';
const enterAddressAddressLine1 = '//input[@name="enterAddressAddressLine1"]';
const enterAddressAddressLine2 = '//input[@name="enterAddressAddressLine2"]';
const enterAddressCity = '//input[@name="enterAddressCity"]';
const fromAddressEditToContinue = '//input[@name="fromAddressEditToContinue"]';

const address2 = '//*[@id="address-book-entry-1"]/div[2]/span/a';

/**
 * Select payment
 * @type {string}
 */
const firstCard = '//*[@id="pm_0"]';
const continueSelectedCard = '//*[@id="continue-top"]';
const placeOrderButton = '(//*[@id="order-summary-box"]//input[@title="Place your order"])[1]';

var casper = require('casper').create({
    verbose: true,
    logLevel: 'debug',
    pageSettings: {
        userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36"
    },
    onError: function (msg, backtrace) {
        this.capture(imageName('error'));
        this.log(msg);
        this.log(backtrace);
        writeResponse(utils.serialize(createErrorResponse('')));
    },
});

/**
 * Grab parameters from command
 * @type {any}
 */
var inputParams = casper.cli.options;

const email = inputParams.amzEmail || '';
const password = inputParams.amzPassword || '';

const productId = inputParams.productId || 'B00GIYHAEQ'; //Test
const requestId = inputParams.requestId || productId;
const addressFullName = inputParams.addressFullName || 'Duong Minh Tuan ZORO';
const addressAddressLine1 = inputParams.addressAddressLine1 || 'XXX B3-11, BeeHome Apartment, 16 Nguyen Duc Thuan Street';
const addressAddressLine2 = inputParams.addressAddressLine2 || 'XXX Ward 13, Tan Binh District';
const addressCity = inputParams.addressCity || '';
const addressStateOrRegion = inputParams.addressStateOrRegion || '';
const addressPostalCode = inputParams.addressPostalCode || '';
const addressCountryCode = inputParams.addressCountryCode || '';
const addressPhoneNumber = inputParams.addressPhoneNumber || '';
const verbose = inputParams.verbose || true;
const logLevel = inputParams.logLevel || 'debug';
const changeAddress = inputParams.changeAddress || 'false';

const productTile = '//input[@id="ftSelectAsin" and @value="' + productId + '"]';


/**
 * enterAddressFullName
 * enterAddressAddressLine1
 * enterAddressAddressLine2
 * enterAddressCity
 * enterAddressStateOrRegion
 * enterAddressPostalCode
 * enterAddressCountryCode
 * enterAddressPhoneNumber
 */
if (email === '' || password === '' || productId === '') {
    const msg = 'Please indicate email; password; productId';
    writeResponse(utils.serialize(createErrorResponse(msg)));
    utils.dump(createErrorResponse(msg));
    exit(1);
}

/**
 * Modify config
 * @type {any}
 */
// casper.options.verbose = verbose;
// casper.options.logLevel = logLevel;
/**
 * Build log based on request id
 */
const logsLocation = "logs/" + requestId;
fs.makeDirectory(logsLocation);
casper.on("log", function (entry) {
    fs.write(logsLocation + '/request.log', entry.message + "\n", "a");
});

/**
 * Ignore useless request
 * @param casper
 * @param requestData
 * @param request
 */
casper.options.onResourceRequested = function (casper, requestData, request) {
    var skip = [
        /google-analytics\.com/gi,
        // /images-na\.ssl-images-amazon\.com/gi,
        /amazon-adsystem\.com/gi,
        /doubleclick\.net/gi,
        /googlesyndication.\.com/gi,
        /2mdn\.net/gi,
        /adsensecustomsearchads\.com/gi,
    ];

    skip.forEach(function (needle) {
        if (needle.test(requestData['url'])) {
            request.abort();
        }
    })
};

casper.clickWhileSelector = function (selector) {
    return this.then(function () {
        if (this.exists(selector)) {
            this.log('found link: ' + this.getElementInfo(selector).tag);
            this.click(selector);
            return this.clickWhileSelector(selector);
        }
        return this;
    });
};

const timeToWait = 15000;

casper.start(pages.startPage);

//Enable quick checkout
//Change address

casper.then(function () {
    /**
     * Calling login
     */
    this.capture(imageName('home'));
    this.sendKeys(cssSelectors.login.email, email);
    this.sendKeys(cssSelectors.login.password, password);
    this.click(cssSelectors.login.rememberMe);
    this.capture(imageName('login'));
    this.click(cssSelectors.login.signInButton);
})
.waitForSelector(x(account), function () {
    this.log('2.1. Login success');
});

/**
 * Need to change address
 */
if (changeAddress === 'true') {
    casper.thenOpen(pages.address, function () {
        this.log('2.2. Opening address page');
    })
    // @todo Fix me
    .wait(timeToWait)
    .then(function () {
        if (this.getTitle() !== 'Your Addresses') {
            this.sendKeys(cssSelectors.login.email, email);
            this.sendKeys(cssSelectors.login.password, password);
            this.log('Sending login information on checkout');
            this.capture(imageName('LoginAddress'));
            this.click(cssSelectors.login.signInButton);
        } else {
            this.capture(imageName('Address'));
            this.click(x(address2));
        }
    })
    .thenClick(cssSelectors.addressList.editFirst, function () {
        this.log('Edit address page');
        this.capture(imageName('AddressPage'));
        this.sendKeys(cssSelectors.addressList.addressForm.country, addressCountryCode);
        this.sendKeys(cssSelectors.addressList.addressForm.fullName, addressFullName);
        this.sendKeys(cssSelectors.addressList.addressForm.city, addressCity);
        this.sendKeys(cssSelectors.addressList.addressForm.state, addressStateOrRegion);
        this.sendKeys(cssSelectors.addressList.addressForm.addressLine1, addressAddressLine1);
        this.sendKeys(cssSelectors.addressList.addressForm.addressLine2, addressAddressLine2);
        this.sendKeys(cssSelectors.addressList.addressForm.zipCode, addressPostalCode);
        this.sendKeys(cssSelectors.addressList.addressForm.phone, addressPhoneNumber);

        this.capture(imageName('FilledAddress'));
        this.click(cssSelectors.addressList.addressForm.submitButton);
    }).waitForSelector(cssSelectors.addressList.addressSaved, function () {
        this.log('Address saved');
        this.capture(imageName('AddressSaved'));
    });
}

/**
 * Go to product detail page
 */
casper.thenOpen('https://www.amazon.com/dp/' + productId, function () {
    this.log('3. Opening detail');
})
.waitForSelector(x(productTile), function () {
    this.log('3.1. There is product');
    this.capture(imageName('Product'));
})

.thenClick(cssSelectors.productDetail.oneClickBoxEnable, function () {
    this.log('3.2. Enable 1-click Ordering');
    this.capture(imageName('Enable1ClickOrdering'));
})
.thenClick(cssSelectors.productDetail.oneClickOrderingButton, function () {
    this.capture(imageName('OneClickOrderingButton'));
})
// @todo Fix me
.wait(timeToWait)
.then(function () {
    if (this.getTitle() === 'Amazon Sign In') {
        this.log('SignIn1ClickCheckout');
        this.capture(imageName('LoginOneClickCheckout'));

        this.sendKeys(cssSelectors.login.email, email);
        this.sendKeys(cssSelectors.login.password, password);
        this.capture(imageName('login'));
        this.click('input[id="signInSubmit"]');
        this.capture(imageName('login2'));
    }
})
.waitForSelector(x(firstCard), function () {
    this.log('There is an added card');
    this.capture(imageName('SelectCreditCard'));
    this.click(x(firstCard));
    this.click(x(continueSelectedCard));
})
//     , function () {
//     this.log(utils.serialize(createErrorResponse("Timed out at CARD_LIST")));
// }
.waitForSelector(x(placeOrderButton), function () {
    this.log('There is a placeOrderButton');
  this.capture(imageName('PlaceOrderButton'));
})
//     , function () {
//     this.log(utils.serialize(createErrorResponse("Timed out at 1CLICK_PLACE_ORDER")));
// }
.then(function () {
    writeResponse(utils.serialize(createSuccessResponse()));
})
;

//Try to run
try {
    casper.run();
} catch (er) {
    require("utils").dump(createErrorResponse(er.toString()));
}


function createErrorResponse(message) {
    return {
        success: false,
        message: message,
        data: null,
    }
}
function createSuccessResponse() {
    return {
        success: true,
        message: null,
        data: [],
    }
}

function microtime() {
    return (new Date).getTime();
}

function imageName(name) {
    return logsLocation + '/' + microtime() + '.' + name + '.png'
}

function writeResponse(content) {
    fs.write(logsLocation + '/response.log', content + "\n", "a");
}
