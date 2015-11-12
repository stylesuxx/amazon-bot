import Promise from 'bluebird';
import Horseman from 'node-horseman';

class AmazonBot {
  constructor(tld, timeout = 5000) {
    this.baseUrl = 'https://amazon.' + tld;

    var options = {
      loadImages: false,
      timeout: timeout,
      phantomPath: './node_modules/.bin/phantomjs'
    };
    this.horseman = new Horseman(options);
    this.userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0';
    this.cookies = [];

    this.urls = {
      login: this.baseUrl + '/ap/signin?openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0&openid.mode=checkid_setup&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.assoc_handle=deflex&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select',
      logout: this.baseUrl + '/gp/flex/sign-out.html',
      item: this.baseUrl + '/gp/product/',
      cart: this.baseUrl + '/gp/cart/view.html',
      redeem: this.baseUrl + '/gc/redeem/',
      addresses: this.baseUrl + '/gp/css/account/address/view.html'
    };
  }

  login(username, password) {
    const url = this.urls.login;

    return new Promise((resolve, reject) => {
      let loggedIn = false;

      return this.horseman
        .userAgent(this.userAgent)
        .open(url)
        .type('input#ap_email', username)
        .type('input#ap_password', password)
        .click('input#signInSubmit-input')
        .waitForSelector('#nav-your-amazon')
        .count('#nav-your-amazon')
        .then((count) => { if(count > 0) loggedIn = true; })
        .cookies()
        .then((cookies) => {
          this.cookies = cookies;
          (loggedIn) ? resolve() : reject('Login failed');
        });
    });
  }

  logout() {
    const url = this.urls.logout;

    return this.horseman
      .userAgent(this.userAgent)
      .cookies(this.cookies)
      .open(url);
  }

  close() {
    return this.horseman
      .close();
  }

  addItem(id) {
    const url = this.urls.item + id;

    return new Promise((resolve, reject) => {
      let itemAmount = 0;

      return this.horseman
        .userAgent(this.userAgent)
        .cookies(this.cookies)
        .open(url)
        .waitForSelector('form#addToCart')
        .text('#nav-cart-count')
        .then(function(text) { itemAmount = parseInt(text.trim()); })
        .click('form#addToCart input#add-to-cart-button')
        .waitForNextPage()
        .open(this.baseUrl)
        .waitForNextPage()
        .text('#nav-cart-count')
        .then((text) => {
          let count = parseInt(text.trim());
          (count > itemAmount) ? resolve() : reject('Item not added to cart');
        });
    });
  }

  addItems(ids) {
    return Promise.each(ids, (id) => { return this.addItem(id); });
  }

  getCartTotal() {
    const url = this.urls.cart;

    return new Promise((resolve, reject) => {
      let total = { price: 0, items: 0, currency: '' };

      return this.horseman
        .userAgent(this.userAgent)
        .cookies(this.cookies)
        .open(url)
        .waitForSelector('form#activeCartViewForm .sc-subtotal .sc-price')
        .count('form#activeCartViewForm .sc-list-item')
        .then(function(items) { total.items = items; })
        .text('form#activeCartViewForm .sc-subtotal .sc-price')
        .then(function(price) {
          var price = price.trim().split(' ');

          if(price.length !== 2) reject('Price could not be parsed');

          var currency = price[0];
          price = price[1].replace(',', '.');
          price = parseFloat(parseFloat(price).toFixed(2));

          if(isNaN(price)) reject('Price is not a number');

          total.currency = currency;
          total.price = price;

          resolve(total);
        });
    });
  }

  getCart() {
    const url = this.urls.cart;

    return new Promise((resolve, reject) => {
      let cart = { total: { price: 0, items: 0, currency: '' }, items: [] };

      return this.horseman
        .userAgent(this.userAgent)
        .cookies(this.cookies)
        .open(url)
        .waitForSelector('form#activeCartViewForm .sc-subtotal .sc-price')
        .count('form#activeCartViewForm .sc-list-item')
        .then(function(items) {
          cart.total.items = items;
        })
        .text('form#activeCartViewForm .sc-subtotal .sc-price')
        .then(function(price) {
          var price = price.trim().split(' ');

          if(price.length !== 2) reject('Price could not be parsed');

          var currency = price[0];
          price = price[1].replace(',', '.');
          price = parseFloat(parseFloat(price).toFixed(2));

          if(isNaN(price)) reject('Price is not a number');

          cart.total.currency = currency;
          cart.total.price = price;
        })
        .open(url)
        .evaluate(function(selector, baseUrl) {
          var items = new Array();

          jQuery(selector).each(function() {
            var price = jQuery('.sc-product-price', this).text().trim().replace(',', '.').split(' ');
            var currency = price[0];
            price = parseFloat(parseFloat(price[1]).toFixed(2));

            var current = {
              id: jQuery(this).attr('data-asin'),
              title: jQuery('.a-list-item a.sc-product-link .sc-product-title', this).text().trim(),
              link: baseUrl + '/gp/product/' + jQuery(this).attr('data-asin'),
              amount: parseInt(jQuery('.a-dropdown-prompt', this).text().trim()),
              currency: currency,
              price: price
            }

            items.push(current);
          });

          return items;
        }, 'form#activeCartViewForm .sc-list-item', this.baseUrl)
        .then(function(items) {
          if(!items) {
            reject('Retreiving cart items failed');
          }
          else if(cart.total.items !== items.length) {
            reject('Item count does not match items in cart');
          }
          else {
            cart.items = items;
            resolve(cart);
          }
        });
    });
  }

  clearCart() {
    const url = this.urls.cart;

    return new Promise((resolve, reject) => {
      return this.horseman
        .userAgent(this.userAgent)
        .cookies(this.cookies)
        .open(url)
        .waitForNextPage()
        .count('form#activeCartViewForm .sc-list-item .sc-action-delete input')
        .then((itemCount) => {
          var items = Array.apply(null, Array(itemCount).map(function() {}));

          return Promise.each(items, () => {
            return this.horseman
              .click('form#activeCartViewForm .sc-list-item .sc-action-delete input')
              .waitForNextPage();
          });
        })
        .count('form#activeCartViewForm .sc-list-item .sc-action-delete input')
        .then((count) => {
          (count === 0) ? resolve() : reject('Items left in cart');
        });
    });
  }

  redeem(code) {
    const url = this.urls.redeem;

    return new Promise((resolve, reject) => {
      return this.horseman
        .userAgent(this.userAgent)
        .open(url)
        .waitForSelector('input#gc-redemption-input')
        .type('input#gc-redemption-input', code)
        .click('input.a-button-input')
        .waitForNextPage()
        .count('input#gc-redemption-input.a-form-error')
        .then((count) => {
          (count === 0 ) ? resolve() : reject('Invalid gift code');
        });
    });
  }

  getBalance() {
    const url = this.urls.redeem;

    return new Promise((resolve, reject) => {
      return this.horseman
        .userAgent(this.userAgent)
        .open(url)
        .waitForSelector('#gc-current-balance')
        .text('#gc-current-balance')
        .then((balance) => {
          var price = balance.replace(',', '.').trim().split(' ');

          if(price.length !== 2) reject('Price could not be parsed');

          price = parseFloat(parseFloat(price[0]).toFixed(2));

          resolve(price);
        });
    });
  }

  getTotal() {
    const url = this.urls.cart;

    return new Promise((resolve, reject) => {
      return this.horseman
        .userAgent(this.userAgent)
        .open(url)
        .waitForSelector('input[name="proceedToCheckout"]')
        .click('input[name="proceedToCheckout"]')
        //.waitForNextPage().waitForNextPage()
        .waitForSelector('#address-book-entry-0')
        .click('#address-book-entry-0 a')
        .waitForNextPage('.a-button-primary input[type="submit"]')
        .click('.a-button-primary input[type="submit"]')
        .waitForNextPage()
        .count('.aok-hidden input#continue-top-disabled')
        .then((count) => {
          if(count === 0) {
            reject('Payment information or address missing');
          }
          else {
            this.horseman
              .click('input#continue-top')
              .waitForSelector('#subtotals-marketplace-table .grand-total-price')
              .evaluate(function() {
                var price = jQuery('#subtotals-marketplace-table .grand-total-price').text().trim().replace(',', '.').split(' ');
                var currency = price[0];
                price = parseFloat(parseFloat(price[1]).toFixed(2));

                var items = jQuery('#subtotals-marketplace-table tbody tr:nth-child(1) td:nth-child(2)').text().trim().replace(',', '.').split(' ');
                items = parseFloat(parseFloat(items[1]).toFixed(2));

                var shipping = jQuery('#subtotals-marketplace-table tbody tr:nth-child(2) td:nth-child(2)').text().trim().replace(',', '.').split(' ');
                shipping = parseFloat(parseFloat(shipping[1]).toFixed(2));

                var total = {
                  items: items,
                  shipping: shipping,
                  total: price,
                  currency: currency
                };

                return total;
              })
              .then(function(total) {
                (total) ? resolve(total) : reject('Retreiving total failed');
              });
          }
        });
    });
  }

  getAddresses() {
    const url = this.urls.addresses;

    return new Promise((resolve, reject) => {
      return this.horseman
        .userAgent(this.userAgent)
        .open(url)
        .waitForSelector('#additional-addresses-and-1-click-settings')
        .evaluate(function() {
          var addresses = [];

          jQuery('#address-index-0, #additional-addresses-and-1-click-settings .displayAddressUL').each(function() {
            addresses.push({
              name: jQuery('li.displayAddressFullName', this).text().trim(),
              address1: jQuery('li.displayAddressAddressLine1', this).text().trim(),
              address2: jQuery('li.displayAddressAddressLine2', this).text().trim(),
              city: jQuery('li.displayAddressCityStateOrRegionPostalCode', this).text().trim(),
              country: jQuery('li.displayAddressCountryName', this).text().trim()
            });
          });

          return addresses;
        })
        .then(function(addresses) {
          (addresses) ? resolve(addresses) : reject('Could not obtain addresses');
        });
    });
  }
}

export default AmazonBot;
