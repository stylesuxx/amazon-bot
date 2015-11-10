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

## Available methods
* login(username, password)
* logout()
* addItem(id)
* addItems(ids)
* getCartTotal()
* clearCart()

## Testing
Since this is a scraper and relies on the Amazon page not changing, an extensive test suite is provided and may be invoked by running:

    npm run test

Make sure you have your amazon login set as environment variables *AMAZON_USER* and *AMAZON_PASS*.
