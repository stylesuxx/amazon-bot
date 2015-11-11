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

    >Login with username and password.

* logout()

    Logout - call this when you are done.

* addItem(id)

    Add a single item.

* addItems(ids)

    Add multiple items at once, just pass an array of item ids.

* getCart()

    Get details about all items in the shopping cart.

* getCartTotal()

    Get a summary of all items in the shopping cart.

* clearCart()

    Remove all items from the shopping cart.

* redeem(code)

    Redeem a gift code. **Not tested with actual gift code**

## Testing
Since this is a scraper and relies on the Amazon page not changing, an extensive test suite is provided and may be invoked by running:

    npm run test

Make sure you have your amazon login set as environment variables *AMAZON_USER* and *AMAZON_PASS*.
