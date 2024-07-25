# node-spamassassin-client

[![Test and Build](https://github.com/valeriansaliou/node-spamassassin-client/workflows/Test%20and%20Build/badge.svg?branch=master)](https://github.com/valeriansaliou/node-spamassassin-client/actions?query=workflow%3A%22Test+and+Build%22) [![Build and Release](https://github.com/valeriansaliou/node-spamassassin-client/workflows/Build%20and%20Release/badge.svg)](https://github.com/valeriansaliou/node-spamassassin-client/actions?query=workflow%3A%22Build+and+Release%22) [![NPM](https://img.shields.io/npm/v/spamassassin-client.svg)](https://www.npmjs.com/package/spamassassin-client) [![Downloads](https://img.shields.io/npm/dt/spamassassin-client.svg)](https://www.npmjs.com/package/spamassassin-client)

**SpamAssassin client, that lets you check if an email is spam or ham.**

This library aims at being as correct and lightweight as possible, built as an alternative to all other SpamAssassin client libraries which are 10+ years old, unmaintained and buggy.

All functions in this library return Promise objects. TypeScript definitions are also provided.

**🇸🇮 Crafted in Ljubljana, Slovenia.**

## Who uses it?

<table>
<tr>
<td align="center"><a href="https://crisp.chat/"><img src="https://valeriansaliou.github.io/node-spamassassin-client/images/crisp.png" width="64" /></a></td>
</tr>
<tr>
<td align="center">Crisp</td>
</tr>
</table>

_👋 You use spamassassin-client and you want to be listed there? [Contact me](https://valeriansaliou.name/)._

## How to install?

Include `spamassassin-client` in your `package.json` dependencies.

Alternatively, you can run `npm install spamassassin-client --save`.

## How to use?

### Check if an email is spam

#### 1. Create a client

```javascript
var SpamAssassinClient = require("spamassassin-client").SpamAssassinClient;

var spamAssassin = new SpamAssassinClient({
  host : "127.0.0.1"
});
```

#### 2. Check an email

```javascript
spamAssassin.check(message)
  .then(function(result) {
    // (Handle result here)
  })
  .catch(function(error) {
    // (Handle error here)
  });
```

### Tunnel to a remote SpamAssassin

If you need to test this library on your local computer, while using a remote SpamAssassin instance, you can easily open a SSH tunnel to this instance:

```sh
ssh -L 127.0.0.1:783:[remote_ip]:783 root@[server_hostname]
```

_👉 Make sure to replace `[remote_ip]` and `[server_hostname]` with the IP address SpamAssassin is listening on, and your server hostname._

## Available options

Those options can be passed when constructing a new `SpamAssassinClient` instance:

* `host`: the hostname or IP address of the SpamAssassin server (_defaults to `127.0.0.1`_);
* `port`: the port of the SpamAssassin server (_defaults to `783`_);
* `timeout`: the timeout in seconds of the socket connection to the SpamAssassin server (_defaults to `10`_);

## Available methods

Those methods can be called on a `SpamAssassinClient` instance:

 * `spamAssassin.check(message)`: checks an email for spam, returns `Promise<{ code, message, score, spam }>`;
