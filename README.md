# cloudfn-cli

Short for "cloud function", cloudfn is a Function-as-a-Service (FaaS) that takes the
infrastructure burden out of server-side code.

Cloudfn is suitable for projects that needs some* server-based functionality,
but cant afford (or bother) to setup the team, tech and infrastructure required.

With cloudfn, you simply express your functionality in a javascript function,
use this command-line tool to upload it,
and call the resulting URL to get/set your data.


## Installation

	(sudo) npm install cloudfn-cli -g

This adds the `cfn` command to your `$PATH`  
(actually an alias to /usr/bin/node_modules/cloudfn-cli/bin)  
so it useable from anywhere.

The examples folder (`/usr/bin/node_modules/cloudfn-cli/examples` or [https://github.com/cloudfn/cli/tree/master/examples](https://github.com/cloudfn/cli/tree/master/examples) contain, well, examples of how these "cloud functions" look, and what they can do (work-in-progres).

#### Updates

There will be a few...: Just install again.

## Usage

The commandline is the primary means of interacting with the **cloudfn service** ([docs](), [website]()).  

The basic interaction follows this pattern:

	$ cfn <command> <args>


## Signup

The first thing you want to do, is to signup.

	$ cfn user

This will prompt for a  
- *username*  
Use anything (url-friendly) you like. It will become part of the URL you will call your scripts through.

- *email*  
Somewhere we can reach you.

- *password*  
Something secret.

The combination of *username*, *email* and *password* will be hashed to form your *identity*, and secure all communication with the service.  

The password is not stored, and is never sent to the server.  
(Which means you need to type it everytime you interact... Let is know in [this issue]() if that is too tedious.)

Read our [privacy]() and [authentication]() docs for additional details.


## Commands

#### Add

	$ cfn add <scriptfile>

e.g: `$ cfn add examples/hello.js`

 Adds a script to the service, and return a URL you can "call" with HTTP(S) GET and POST requests.


#### Test

	$ cfn test <scriptfile>

e.g: `$ cfn test examples/hello.js`

Compiles the script, to verify that it is ok.  
(Note that some runtime features are not mock'ed in the CLI, so test with a `add`'ed script to fully assert functionality.)

#### List

	$ cfn ls

Will show wich script you have uploaded to your "account".

#### Remove

	$ cfn rm <scriptname>

Remove (there's no undo) the script from your "account".  
(Use a scriptname from `$ cfn ls`.)


## Utility Commands

For convenience, the cli includes some commands to make working with the cloudfn service easier.

#### Call

	$ cfn call <scripturl> <args>

Issues a HTTP GET request to the <scripturl>.  
e.g: `$ cfn call js/counter `

You can provide key=value pairs as `args` if you want.   
e.g. `$ cfn call examples/echo name=jorgen`  
These will be available in `api.args.params` in your scripts.

Feel free to use [httpie](), [postman]() or [curl]() instead.


#### Token

	$ cfn token

Generates a unique fairly random token suitable for use with the [auth]() feature.
