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
                "value": "1AE5D6B516D083FF42C249A7C0194E48F66332BB03FAFF4BEE40370937174130F23B3E7DC13A6041ACB3468982C6917C4A5984138D5BCACEAA36566ABC70DBDFB27E033DAFB4ECB8F488DB87F69CEEB55B07B0BBE0A3080874CB42410C82224272F9D8EFE8C92C260F82E4B395B0E24326A1BFC58D5B526F150623C3D66E3305",
                "type": "text",
                "enabled": true
				},
				{
					"key": "pageTitle",
					"value": "esta",
					"type": "text",
					"enabled": true
				},
				{
					"key": "baseURL",
					"value": "https://localhost/OrchardCMS/DevNoLaser",
					"type": "text",
					"enabled": true
				}
			]
		}
	},

	timeoutValue = 5000, // ms of timeout between calls
	//this is the collection runner function
	parallelCollectionRun = function(done) {
		newman.run(options, done); //done will be the callback function
	}, 
	delayedRunner = function(done) {
		setTimeout(function() {
				newman.run(options, done);
			},
			timeoutValue
		)
	}
	//array of the collections to run
	collections = [parallelCollectionRun, delayedRunner],
	//this will be called after all the concurrent calls are finished
	recursiveCallBack = function (err, results) {
		console.info("Done test for " + timeoutValue + " ms delay.");
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
			//collections.push(parallelCollectionRun);
			timeoutValue = timeoutValue / 2;
			console.info("Launching test for " + timeoutValue + " ms delay.");
			async.parallel(collections, recursiveCallBack);
		}
	};
//--------------------------------------------------------------------------------------------//
console.log("Start concurrency tests.");
console.info("Launching test for " + collections.length + " concurrent collection.");
async.parallel(collections, recursiveCallBack);
