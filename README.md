# About

Duolingo Halloween is a spooky halloween Duolingo that will follow you with it's eyes.

We are NOT affiliated, associated, authorized, endorsed by, or in any way officially connected with Duolingo. The official Duolingo website can be found at [duolingo.com](https://www.duolingo.com).

# Usage

Use the following steps to use your Halloween Duolingo

# Local AI (Recommended)

Assuming you have relativly new hardware you should be able to use the on-device version of Halloween Duolingo.

Navigate to the [demo webpage](https://jemcats.software/github_pages/duolingo_halloween/ondevice.html)

# CoreML (Slow Hardware)

If you have slower hardware but also have a MacBook with an M-Series Processer you can use our Legacy Hardware version.

## Install

Install Homebrew
```
$ /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" 
```

Install NPM and Git
```
$ brew install npm git
```

Clone Repo
```
$ git clone https://github.com/JEMcats/duolingo_halloween.git
```

Navigate To The Cloned Repo
```
$ cd duolingo_halloween
```

Install The Required Dependiences
```
$ npm install
```

Open ```openssl-san.cnf``` and fill out all of the values like ```YourCountryCode``` and ```YourName```.

Generate your certificate and key

```
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout selfsigned.key -out selfsigned.crt -config openssl-san.cnf -extensions v3_req
```

You have now setup the Legacy Version. Please move on to usage.

## Usage

Run the command

```
$ node server.js
```

Navigate to:
```
https://'MacBook IP or Hostname':1920/legacy.html
```

# Contributing

To start make a fork of the dev branch.

In your fork make the changes you would like make.

Fill out the infromation for the pull request.

When you are ready open your pull request.