var path = require('path'),
	async = require('async'), //https://www.npmjs.com/package/async install by calling "npm install --save async"
	newman = require('newman'), //https://github.com/postmanlabs/newman install by calling "npm install --save newman"

	allowInsecureSSL = true, //allow insecure SSL certificates (I use this for local testing)
	//newman.run takes two parameters: options and done.
	//options is the collection run options, which include the file describing the collection and other stuff
	//each collection that is being run may have its own options, different than the others
	options = {
		collection: path.join(__dirname, 'NewmanTests.postman_collection.json'),
		reporters: 'cli',
		insecure: allowInsecureSSL, //allow insecure SSL certificates (I use this for local testing)
		globals: {
			"values":[
				{
				"key": "aspAuthCookie", //The authentication cookie is set here for all calls
                "value": "81FD75E54380206B27BDCA8C1BFDF1F509386D3EE16AA5403546471E078A3275201D7E23826741FEBDCD18A62C1B4DA1F01BFC4437FB27D320BA9F9A1C60F7854D7C449E2B22E655C0BFF5EE373C8F7F90338CEE1F7DD265D164640AAA03253AE43990C7116A25E7A6E2B879528DC491CBC6D5E6982E0F9D37A9CAF39BA25651",
                "type": "text",
                "enabled": true
				}
			]
		}
	},

	//this is the collection runner function
	parallelCollectionRun = function(done) {
		newman.run(options, done); //done will be the callback function
	},
	//array of the collections to run
	collections = [parallelCollectionRun], //initially only 1 element
	//this will be called after all the concurrent calls are finished
	recursiveCallBack = function (err, results) {
		console.info("Done test for " + collections.length + " concurrent collections.");
		err && console.error(err);
		var fail = false;
		if (results) {
			results.forEach(function (result) {
				var failures = result.run.failures;
				if (failures.length) {
					fail = true;
				}
				console.info(failures.length ? `${result.collection.name} failed.` :
							`${result.collection.name} ran successfully.`);
			});
		} 
		//keep increasing the number of concurrent calls until something fails
		if (fail || err) {
			console.error("Error when attempting " + collections.length + " calls.");
			err && console.error(err);
		} else {
			collections.push(parallelCollectionRun);
			console.info("Launching test for " + collections.length + " concurrent collections.");
			async.parallel(collections, recursiveCallBack);
		}
	};
//--------------------------------------------------------------------------------------------//
console.log("Start concurrency tests.");
console.info("Launching test for " + collections.length + " concurrent collection.");
async.parallel(collections, recursiveCallBack);
