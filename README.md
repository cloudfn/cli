# cloudfn-cli

Short for "cloud function", cloudfn is a Function-as-a-Service (FaaS) that takes the
infrastructure burden out of server-side code.

Cloudfn is suitable for projects that needs some* server-based functionality,
but cant afford (or bother) to setup the team, tech and infrastructure required.

With cloudfn, you simply express your functionality in a javascript function,
use this command-line tool to upload it,
and call the resulting URL to get/set your data.


## Installation

```
(sudo) npm install clfn -g
```
You need [Node.js](https://nodejs.org) to do that.  

This adds the `clfn` command to your `$PATH` so it's useable from anywhere.

#### Update

There will be a few... just `npm install` again.


## Hello World

```javascript
(api) => {
  api.send('Hello World');
}
```
```
// or, with "traditional" notation:
function(api) {
  api.send('Hello World');
}
```

`!` All scripts should have this signature, and  
`!` All your code needs to live inside this closure.

The `api`  argument is an object with a (growing) collection of methods you will use to interact with the your users.  
It is documented in the [API Documentation](docs/api.md)

`api.send()` is one such method. If you prefer to speak JSON, just do.

```javascript
(api) => {
  api.send({message:'Hello World'});
}
```


The examples folder (`/usr/bin/node_modules/cloudfn-cli/examples` or [https://github.com/cloudfn/cli/tree/master/examples](https://github.com/cloudfn/cli/tree/master/examples) contain, well, examples of how these "cloud functions" look, and what they can do.


## Usage

The commandline is the primary means of interacting with the **cloudfn service** ([docs](), [website]()).  

The basic interaction follows this pattern:

```
$ clfn <command> <args>
```

## Signup

The first thing you want to do, is to signup.

```
$ clfn user
```

This will prompt for a  
- *username*  
Use anything (url-friendly) you like. It will become part of the URL you will call your scripts through.

- *email*  
Somewhere we can reach you.

- *password*  
Something secret.

The combination of *username*, *email* and *password* will be hashed to form your *identity*, and secure all communication with the service.  

The password is not stored, and is never sent to the server.  
(Which means you need to type it everytime you interact... Let us know in [this issue](https://github.com/cloudfn/cli/issues/1) if that is too tedious.)

Read our [privacy]() and [cli-authentication]() docs for additional details.


## Commands

#### Add

```
$ clfn add <scriptfile>
```

e.g: `$ clfn add examples/hello.js`

Adds a script to the service, and return a URL you can "call" with HTTP(S) GET and POST requests.

The scripturl's look sth like this:

`https://cloudfn.stream/<username>/<scriptname>`

and can be called like any other web api, or as a script:

```javascript
  <script>
    function OnCallback(data){
      console.log("OnCallback:", data.counter);
    }
  </script>
  <script src="https://cloudfn.stream/examples/auth-origin-counter?callback=OnCallback"></script>
```

#### Test

```
$ clfn test <scriptfile>
```

e.g: `$ clfn test examples/hello.js`

Compiles the script, to verify that it is ok.  
(Note that some runtime features are not mock'ed in the CLI, so test with a `add`'ed script to fully assert functionality.)

#### List

```
$ clfn ls
```

Will show wich script you have uploaded to your "account".

#### Remove

```
$ clfn rm <scriptname>
```

Remove (there's no undo) the script from your "account".  
(Use a scriptname from `$ clfn ls`.)


## Utility Commands

For convenience, the cli includes some commands to make working with the cloudfn service easier.

#### Call

```
$ clfn call <scripturl> <args>
```

Issues a HTTP GET request to the <scripturl>.  
e.g: `$ clfn call js/counter `

You can provide key=value pairs as `args` if you want.   
e.g. `$ clfn call examples/echo msg=hello`  
These will be available in `api.args.params` in your scripts.
Check []()

Feel free to use [httpie](), [postman]() or [curl]() for commandline testing instead.


#### Token

```
$ clfn token
```

Generates a unique fairly random token suitable for use with the [auth]() feature.
