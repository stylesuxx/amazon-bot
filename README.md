# Amazon Bot

> A bot to programatically purchase physical items on Amazon. Returns promises.

## Disclaimer
Use with caution - do not call checkout unless you are sure you want to really buy the stuff currently in your cart.

This library heavily relies on the Amazon page not changing. It is very likely that something breaks over time. Therefore an extensive test suite is provided.

## Installation
    npm install amazon-bot --save

## Usage
``` JavaScript
Usage comes here
```

## constructor
#### AmazonBot(tld, timeout = 5000)
>*tld* is the Amazon top level domain you want to use, *timeout* defaults to 5000 which is also the pahntomjs default

## Methods
#### login(username, password)
>Login with Amazon *username* and *password* - Resolves when login succeeds.

#### logout()
>Logout - Resolves when logout succeeds.

#### close()
>Closes phantom JS, call this when you are done taking actions

#### addItem(id)
>Add a single item by its product *id* - Resolves when item could be added

#### addItems(ids)
>Add multiple items at once. *ids* is an array of product id's - Resolves when items could be added

#### removeItem(id)
>Removes an item from the cart by its product *id* - Resolves when item could be removed

#### removeItems(ids)
>Removes multiple items from the cart at once. *ids* is an array of product id's - Resolves when items could be removed

#### getCart()
>Get details about all items in the shopping cart - Resolves when cart information is available

#### getCartTotal()
>Get a summary of all items in the shopping cart - Resolves when cart information is available

#### clearCart()
>Remove all items from the shopping cart - Resolves when succeeded in removing items from the cart

#### redeem(code)
>Redeem a gift *code* - Resolves when succeeded in redeeming a gift code **Not tested with an actual gift code - if you do, please let me know in the issues**

#### getBalance()
>Get the current balance - Resolves when succeeded in obtaining balance

#### getTotal()
>Get the current cart total including shipping - Resolves when payment information is available and succeeded in obtaining total

#### getAddresses()
>Get all available addresses - Resolves when address information is available

## Functionality
There is a lot functionality on the Amazon page that the bot does not support. Feel free to submit issues - or even better PR's, for functionality you want to see.

## Testing
Since this is a scraper and relies on the Amazon page not changing, an extensive test suite is provided and may be invoked by running:

    npm run test

Make sure you have your amazon login set as environment variables *AMAZON_USER* and *AMAZON_PASS*.

## Todo
- [ ] remove single item from cart
- [ ] remove multiple items from cart
- [ ] checkout with id for address
