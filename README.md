This script was written to allow simulating concurrent requests to tenant of [Orchard CMS](https://github.com/OrchardCMS/Orchard). Note that since JavaScript is single threaded, what this script really does is fire off calls in rapid succession, without waiting for one to end before firing off the next.

## To run this script
This script is supposed to be run using Node.js. Setup instructions are available [online](https://nodejs.org/en/#download).

The script uses two modules:

 * [async.js](https://www.npmjs.com/package/async)
 * [newman](https://github.com/postmanlabs/newman)

The easiest way to get the script running is to install both packages locally by running from command line:
```
$ npm install --save newman
$ npm install --save async
```

After setup is complete, you can run 
```
$ node ParallelTests.js
```
The execution will stop as soon as one of the calls from the projection fails. At each iteration, the script will increase the number of concurrent collections it will run.

## Customizing the script
Before running the script, you should customize it for your needs.

For authenticated calls, the first thing you should do is to input a valid authentication cookie string in the corresponding variable in the code. When setting up the calls for your collection, make sure to add the following header:
```
cookie:.ASPXAUTH={{aspAuthCookie}};
```
The aspAuthCookie variable is set by the script to the hardcoded value you input.

You should verify that the collection name in the code corresponds to the name of your exported collection. The json collection file should be in the same folder that ParallelTests.js is in. The example collection uses a {{baseUrl}} parameter to point to a specific tenant.
The repository contains an example collection that we used locally on an ad-hoc instance.

## Example scripts
ParallelTests.js contains the basic script.

ParallelTests-ChangeTitles.js changes a Postman global variable so it is different for every collection in a given recursion step.

ParallelTests-CreateUsers.js shows how to change Postman global variables so they are different for every collection being run in a test run.

ParallelTests-Delayed.js contains a script that we used to test the minimum delay between two calls to see concurrency-related errors.

## License
This software is licensed under Apache-2.0. Copyright Laser S.r.l.. See the [LICENSE](LICENSE) file for more information.