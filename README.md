# Android Bootstrap Site (Web App)

[![Build Status](https://travis-ci.org/AndroidBootstrap/android-bootstrap-site.svg?branch=master)](https://travis-ci.org/AndroidBootstrap/android-bootstrap-site)

This repository contains the source code for the [Android Bootstrap](http://www.androidbootstrap.com/)
web application that is responsible for automatic app generation for [Android Bootstrap](https://github.com/donnfelker/android-bootstrap/).

Please see the [issues](https://github.com/donnfelker/android-bootstrap-site/issues) section
to report any bugs or feature requests and to see the list of known issues.

## Generating your Bootstrap App
Why generate? Simple ... renaming files, folders, copy and pasting is SUPER error prone and well... it sucks overall. This can easily take a few days with debugging if you run into issues and perform a lot of typo's. Using the generator on [AndroidBootstrap.com](http://www.androidbootstrap.com) you can generate your application with your application name as well as the package (and folder structure) that you want to work with.

As an example, you know that you want your app name and package to the following:

  - *App Name*: Notify
  - *Package Name*: com.notify.app.mobile

After generating the app on [AndroidBootstrap.com](http://www.androidbootstrap.com) the folder structure of the source code for the app will change:

  - From: __com/donnfelker/android/bootstrap__
  - To: __com/notify/app/mobile__

At that point all the source files that were located in ____com/donnfelker/android/bootstrap__ will be moved to the new folder __com/notify/app/mobile__.

All import statments that reference the old resources (__R.com.donnfelker.android.bootstrap.R__) will now be renamed to the correct package. The artifact id's in the *pom.xml* (and various other places) will be replaced. The App Name will be replaced in the strings/etc.

The end result is that you will be given a zip file with the correct structure. Open the zip and then execute *mvn clean package* and your app should be ready for development.

Enjoy!

The application

## License

* [Apache Version 2.0](http://www.apache.org/licenses/LICENSE-2.0.html)


Copyright 2012 Donn Felker

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.


## Building

The build requires [NodeJS](http://www.nodejs.org) v0.8.x and
the [NPM](http://npmjs.org).

Under the hood this app uses

* express
* async.js
* node-native-zip
* wrench
* twitter-bootstrap

## Contributing

Please fork this repository and contribute back using
[pull requests](https://github.com/donnfelker/android-bootstrap-site/pulls).

Any contributions, large or small, major features, bug fixes, additional
language translations, unit/integration tests are welcomed and appreciated
but will be thoroughly reviewed and discussed.

I hope this helps you in building your next android app. Enjoy. :)
