var test = require('tape');

var AmazonBot = require('../');

var testData = {
  login: {
    valid: {
      user: process.env.AMAZON_USER,
      pass: process.env.AMAZON_PASS
    },
    invalid: {
      user: 'invalid',
      pass: 'invalid'
    }
  }
}

test('Login with invalid credentials', function(t) {
  t.plan(2);

  var bot = new AmazonBot('de', true);
  bot
    .login(testData.login.invalid.user, testData.login.invalid.pass)
    .then(function() {}, function(err) { t.equals(err, 'Login failed', 'Login failed'); })
    .then(function() { return bot.logout(); })
    .then(function() { t.ok(true, 'Logout'); });
});

test('Login with valid credentials', function(t) {
  t.plan(2);

  var bot = new AmazonBot('de', true);
  bot
    .login(testData.login.valid.user, testData.login.valid.pass)
    .then(function() { t.ok(true, 'Login successfull'); })
    .then(function() { return bot.logout(); })
    .then(function() { t.ok(true, 'Logout'); });
});

test('Clear cart', function(t) {
  t.plan(3);

  var bot = new AmazonBot('de');
  bot
    .login(testData.login.valid.user, testData.login.valid.pass)
    .then(function() { t.ok(true, 'Login'); })
    .then(function() { return bot.clearCart(); })
    .then(function() { t.ok(true, 'Cart empty'); })
    .then(function() { return bot.logout(); })
    .then(function() { t.ok(true, 'Logout'); });
});

test('Add a single item', function(t) {
  t.plan(7);

  var bot = new AmazonBot('de');
  bot
    .login(testData.login.valid.user, testData.login.valid.pass)
    .then(function() { t.ok(true, 'Login'); })
    .then(function() { return bot.clearCart(); })
    .then(function() { t.ok(true, 'Cart empty'); })
    .then(function() { return bot.addItem('B00NTIALWC'); })
    .then(function() { t.ok(true, 'Added item'); })
    .then(function() { return bot.getCartTotal(); })
    .then(function(total) {
      t.equal(total.items, 1, 'Cart count');
      t.equal(total.currency, 'EUR', 'Cart currency');
      t.equal(total.price, 16.99, 'Cart price');
    })
    .then(function() { return bot.logout(); })
    .then(function() { t.ok(true, 'Logout'); });
});

test('Add multiple items', function(t) {
  t.plan(7);

  var bot = new AmazonBot('de');
  bot
    .login(testData.login.valid.user, testData.login.valid.pass)
    .then(function() { t.ok(true, 'Login'); })
    .then(function() { return bot.clearCart(); })
    .then(function() { t.ok(true, 'Cart empty'); })
    .then(function() { return bot.addItems(['B008MFXJCQ', 'B00DRYZC1S']); })
    .then(function() { t.ok(true, 'Added items'); })
    .then(function() { return bot.getCartTotal(); })
    .then(function(total) {
      t.equal(total.items, 2, 'Cart count');
      t.equal(total.currency, 'EUR', 'Cart currency');
      t.equal(total.price, 20.96, 'Cart price');
    })
    .then(function() { return bot.logout(); })
    .then(function() { t.ok(true, 'Logout'); });
});
