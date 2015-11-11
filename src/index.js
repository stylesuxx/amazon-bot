import Promise from 'bluebird';
import Horseman from 'node-horseman';

class AmazonBot {
  constructor(tld) {
    this.baseUrl = 'https://amazon.' + tld;

    this.horseman = new Horseman();
    this.userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0';
    this.cookies = [];

    this.urls = {
      login: this.baseUrl + '/ap/signin?openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0&openid.mode=checkid_setup&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.assoc_handle=deflex&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select',
      logout: this.baseUrl + '/gp/flex/sign-out.html',
      item: this.baseUrl + '/gp/product/',
      cart: this.baseUrl + '/gp/cart/view.html'
    };
  }

  /* Promise resolves when user was logged in successfully, otherwise it rejects */
  login(username, password) {
    var url = this.urls.login;

    return new Promise((resolve, reject) => {
      return this.horseman
        .userAgent(this.userAgent)
        .open(url)
        .type('input#ap_email', username)
        .type('input#ap_password', password)
        .click('input#signInSubmit-input')
        .waitForNextPage()
        .then(() => {
          this.horseman
            .count('#nav-your-amazon')
            .then((count) => {
              if(count > 0 ) {
                this.horseman
                  .cookies()
                  .then((cookies) => {
                    this.cookies = cookies;
                    resolve();
                  });
              }
              else {
                reject('Login failed');
              }
            });
        });
    });
  }

  logout() {
    var url = this.urls.logout;

    return this.horseman
      .userAgent(this.userAgent)
      .cookies(this.cookies)
      .open(url)
      .waitForNextPage()
      .close();
  }

  /* Promise resolves when there is one more item in the cart than it was before, otherwise it rejects */
  addItem(id) {
    var url = this.urls.item + id;
    var current = 0;

    return new Promise((resolve, reject) => {
      return this.horseman
        .userAgent(this.userAgent)
        .cookies(this.cookies)
        .open(url)
        .waitForSelector('form#addToCart')
        .text('#nav-cart-count')
        .then(function(text) {
          current = parseInt(text.trim());
        })
        .click('form#addToCart input#add-to-cart-button')
        .waitForNextPage()
        .open(this.baseUrl)
        .waitForNextPage()
        .text('#nav-cart-count')
        .then((text) => {
          var count = parseInt(text.trim());
          if(count > current) {
            resolve();
          }
          else {
            reject('Item not added to cart');
          }
        });
    });
  }

  addItems(ids) {
    return Promise.each(ids, (id) => {
      return this.addItem(id);
    });
  }

  getCartTotal() {
    var url = this.urls.cart;
    var total = {
      price: 0,
      items: 0,
      currency: ''
    };

    return new Promise((resolve, reject) => {
      return this.horseman
        .userAgent(this.userAgent)
        .cookies(this.cookies)
        .open(url)
        .waitForNextPage()
        .count('form#activeCartViewForm .sc-list-item')
        .then(function(items) {
          total.items = items;
        })
        .text('form#activeCartViewForm .sc-subtotal .sc-price')
        .then(function(price) {
          var price = price.trim().split(' ');
          var currency = price[0];
          price = price[1].replace(',', '.');
          price = parseFloat(parseFloat(price).toFixed(2));

          total.currency = currency;
          total.price = price;

          resolve(total);
        });
    });
  }

  /* Promise resolves when cart items could be retreived, otherwise it rejects */
  getCart() {
    var url = this.urls.cart;
    var cart = {
      total: {
        price: 0,
        items: 0,
        currency: ''
      },
      items: []
    };

    return new Promise((resolve, reject) => {
      return this.horseman
        .userAgent(this.userAgent)
        .cookies(this.cookies)
        .open(url)
        .waitForNextPage()
        .count('form#activeCartViewForm .sc-list-item')
        .then(function(items) {
          cart.total.items = items;
        })
        .text('form#activeCartViewForm .sc-subtotal .sc-price')
        .then(function(price) {
          var price = price.trim().split(' ');
          var currency = price[0];
          price = price[1].replace(',', '.');
          price = parseFloat(parseFloat(price).toFixed(2));

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
            reject('Retreiving cart items failed')
          }
          else {
            cart.items = items;
            resolve(cart);
          }
        });
    });
  }

  /* Promise resolves when there are no more items in the cart, otherwise it rejects */
  clearCart() {
    var url = this.urls.cart;

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
          if(count === 0) {
            resolve();
          }
          else {
            reject('Items left in cart');
          }
        });
    });
  }
}

export default AmazonBot;
