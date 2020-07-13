# Yet-another-fetch polyfill that adds AbortController support.

The `fetch()` function is a Promise-based mechanism for programmatically making
web requests in the browser. This project provides a polyfill that implements a subset
of the standard [Fetch specification][], enough to make `fetch` a viable
replacement for most uses of XMLHttpRequest in traditional web applications.

The default CommonJS import path does not assign or polyfill `window.fetch`. Use `import 'yetch/polyfill'` (see [Usage](#usage)).

## Table of Contents

* [Read this first](#read-this-first)
* [Installation](#installation)
* [Usage](#usage)
  * [HTML](#html)
  * [JSON](#json)
  * [Response metadata](#response-metadata)
  * [Post form](#post-form)
  * [Post JSON](#post-json)
  * [File upload](#file-upload)
  * [Caveats](#caveats)
    * [Handling HTTP error statuses](#handling-http-error-statuses)
    * [Sending cookies](#sending-cookies)
    * [Receiving cookies](#receiving-cookies)
    * [Obtaining the Response URL](#obtaining-the-response-url)
    * [Aborting requests](#aborting-requests)
* [Browser Support](#browser-support)

## Read this first

* If you believe you found a bug with how `fetch` behaves in Chrome or Firefox,
  please **don't open an issue in this repository**. This project is a
  _polyfill_, and since Chrome and Firefox both implement the `window.fetch`
  function natively, no code from this project actually takes any effect in
  these browsers. See [Browser support](#browser-support) for detailed
  information.

* If you have trouble **making a request to another domain** (a different
  subdomain or port number also constitutes another domain), please familiarize
  yourself with all the intricacies and limitations of [CORS][] requests.
  Because CORS requires participation of the server by implementing specific
  HTTP response headers, it is often nontrivial to set up or debug. CORS is
  exclusively handled by the browser's internal mechanisms which this polyfill
  cannot influence.

* If you have trouble **maintaining the user's session** or [CSRF][] protection
  through `fetch` requests, please ensure that you've read and understood the
  [Sending cookies](#sending-cookies) section. `fetch` doesn't send cookies
  unless you ask it to.

* This project **doesn't work under Node.js environments**. It's meant for web
  browsers only. You should ensure that your application doesn't try to package
  and run this on the server.

* If you have an idea for a new feature of `fetch`, **submit your feature
  requests** to the [specification's repository](https://github.com/whatwg/fetch/issues).
  We only add features and APIs that are part of the [Fetch specification][].

## Installation

> You will need to have **Promise** polyfilled first (if necessary), before you load yetch. We recommend [taylorhakes/promise-polyfill](https://github.com/taylorhakes/promise-polyfill).

```
npm install yetch --save
# or
yarn add yetch
```

## Usage

> yetch also polyfills AbortController, AbortSignal, and a few other related classes, but it does *not* polyfill Promise

If you'd like yetch to polyfill the global `window.fetch`, you should import the `yetch/polyfill` file; it doesn't export anything, it just polyfills the environment if needed.

```javascript
// ES6+
import 'yetch/polyfill';
// CJS
require('yetch/polyfill');
```

Otherwise, if you'd like to just use yetch _without_ actually polyfilling the global variables, you can import it directly:

```javascript
import { fetch, AbortController } from 'yetch';

const controller = new AbortController();

fetch('/avatars', { signal: controller.signal })
  .catch(function(ex) {
    if (ex.name === 'AbortError') {
      console.log('request aborted')
    }
  });

// some time later...
controller.abort();
```

For a more comprehensive API reference that this polyfill supports, refer to
https://Netflix.github.io/yetch/.

### HTML

```javascript
fetch('/users.html')
  .then(function(response) {
    return response.text()
  }).then(function(body) {
    document.body.innerHTML = body
  })
```

### JSON

```javascript
fetch('/users.json')
  .then(function(response) {
    return response.json()
  }).then(function(json) {
    console.log('parsed json', json)
  }).catch(function(ex) {
    console.log('parsing failed', ex)
  })
```

### Response metadata

```javascript
fetch('/users.json').then(function(response) {
  console.log(response.headers.get('Content-Type'))
  console.log(response.headers.get('Date'))
  console.log(response.status)
  console.log(response.statusText)
})
```

### Post form

```javascript
var form = document.querySelector('form')

fetch('/users', {
  method: 'POST',
  body: new FormData(form)
})
```

### Post JSON

```javascript
fetch('/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Hubot',
    login: 'hubot',
  })
})
```

### File upload

```javascript
var input = document.querySelector('input[type="file"]')

var data = new FormData()
data.append('file', input.files[0])
data.append('user', 'hubot')

fetch('/avatars', {
  method: 'POST',
  body: data
})
```

### Caveats

The actual `fetch` specification differs from `jQuery.ajax()` in mainly two ways that
bear keeping in mind:

* The Promise returned from `fetch()` **won't reject on HTTP error status**
  even if the response is an HTTP 404 or 500. Instead, it will resolve normally,
  and it will only reject on network failure or if anything prevented the
  request from completing.

* By default, `fetch` **won't send or receive any cookies** from the server,
  resulting in unauthenticated requests if the site relies on maintaining a user
  session. See [Sending cookies](#sending-cookies) for how to opt into cookie
  handling.

#### Handling HTTP error statuses

To have `fetch` Promise reject on HTTP error statuses, i.e. on any non-2xx
status, define a custom response handler:

```javascript
function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response
  } else {
    var error = new Error(response.statusText)
    error.response = response
    throw error
  }
}

function parseJSON(response) {
  return response.json()
}

fetch('/users')
  .then(checkStatus)
  .then(parseJSON)
  .then(function(data) {
    console.log('request succeeded with JSON response', data)
  }).catch(function(error) {
    console.log('request failed', error)
  })
```

#### Sending cookies

To automatically send cookies for the current domain, the `credentials` option
must be provided:

```javascript
fetch('/users', {
  credentials: 'same-origin'
})
```

The "same-origin" value makes `fetch` behave similarly to XMLHttpRequest with
regards to cookies. Otherwise, cookies won't get sent, resulting in these
requests not preserving the authentication session.

For [CORS][] requests, use the "include" value to allow sending credentials to
other domains:

```javascript
fetch('https://example.com:1234/users', {
  credentials: 'include'
})
```

#### Receiving cookies

As with XMLHttpRequest, the `Set-Cookie` response header returned from the
server is a [forbidden header name][] and therefore can't be programmatically
read with `response.headers.get()`. Instead, it's the browser's responsibility
to handle new cookies being set (if applicable to the current URL). Unless they
are HTTP-only, new cookies will be available through `document.cookie`.

Bear in mind that the default behavior of `fetch` is to ignore the `Set-Cookie`
header completely. To opt into accepting cookies from the server, you must use
the `credentials` option.

#### Obtaining the Response URL

Due to limitations of XMLHttpRequest, the `response.url` value might not be
reliable after HTTP redirects on older browsers.

The solution is to configure the server to set the response HTTP header
`X-Request-URL` to the current URL after any redirect that might have happened.
It should be safe to set it unconditionally.

``` ruby
# Ruby on Rails controller example
response.headers['X-Request-URL'] = request.url
```

This server workaround is necessary if you need reliable `response.url` in
Firefox < 32, Chrome < 37, Safari, or IE.

#### Aborting requests

This polyfill supports
[the abortable fetch API](https://developers.google.com/web/updates/2017/09/abortable-fetch).
However, aborting a fetch requires use of two additional DOM APIs:
[AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
and
[AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal).
Typically, browsers that do not support fetch will also not support
AbortController or AbortSignal. Consequently, you will need to include an
additional polyfill for these APIs to abort fetches.

Once you have an AbortController and AbortSignal polyfill in place, you can
abort a fetch like so:

```js
const controller = new AbortController()

fetch('/avatars', {
  signal: controller.signal
}).catch(function(ex) {
  if (ex.name === 'AbortError') {
    console.log('request aborted')
  }
})

// some time later...
controller.abort();
```

## Browser Support

- Chrome
- Firefox
- Safari 6.1+
- Internet Explorer 10+

Note: modern browsers such as Chrome, Firefox, Microsoft Edge, and Safari contain native
implementations of `window.fetch` and the latest versions even support `AbortController`. However, as a relatively new feature some of your users may have a version of these browsers that has support for `window.fetch` but does not have support for `AbortController`. In those cases the polyfilled version of `fetch` will be used _instead_ of the native one. If you believe you've encountered an error with how `window.fetch` is implemented in any of these browsers, you should file an issue with that browser vendor instead of this project.


  [fetch specification]: https://fetch.spec.whatwg.org
  [open code of conduct]: http://todogroup.org/opencodeofconduct/#fetch/opensource@github.com
  [cors]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS
    "Cross-origin resource sharing"
  [csrf]: https://www.owasp.org/index.php/Cross-Site_Request_Forgery_(CSRF)_Prevention_Cheat_Sheet
    "Cross-site request forgery"
  [forbidden header name]: https://developer.mozilla.org/en-US/docs/Glossary/Forbidden_header_name

## Credit

This project started as a fork of GitHub's [whatwg-fetch](https://github.com/github/fetch), adding support for automatically polyfilling `window.fetch` so that it supports [aborting requests with an AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort). In additional yetch is a CJS module by default and does not replace `window.fetch` with a polyfill unless you `import 'yetch/polyfill'`.

As a fork, a majority of the work was done by GitHub and the community in [whatwg-fetch](https://github.com/github/fetch).

:shipit:
