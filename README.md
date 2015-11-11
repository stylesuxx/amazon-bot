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
#### login(username, password)
>Login with username and password - Resolves when login succeeds.

#### logout()
>Logout - call this when you are done - Resolves when logout succeeds.

#### addItem(id)
>Add a single item - Resolves when item could be added

#### addItems(ids)
>Add multiple items at once, just pass an array of item ids - Resolves when items could be added

#### getCart()
>Get details about all items in the shopping cart - Resolves when cart information is available

#### getCartTotal()
>Get a summary of all items in the shopping cart - Resolves when cart information is available

#### clearCart()
>Remove all items from the shopping cart - Resolves when succeeded in removing items from the cart

#### redeem(code)
>Redeem a gift code - Resolves when succeeded in redeeming a gift code **Not tested with actual gift code**

## Testing
Since this is a scraper and relies on the Amazon page not changing, an extensive test suite is provided and may be invoked by running:

    npm run test

Make sure you have your amazon login set as environment variables *AMAZON_USER* and *AMAZON_PASS*.
