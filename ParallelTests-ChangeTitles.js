var path = require('path'),
	async = require('async'), //https://www.npmjs.com/package/async install by calling "npm install --save async"
	newman = require('newman'), //https://github.com/postmanlabs/newman install by calling "npm install --save newman"

	allowInsecureSSL = true, //allow insecure SSL certificates (I use this for local testing)
	//newman.run takes two parameters: options and done.
	//options is the collection run options, which include the file describing the collection and other stuff
	//each collection that is being run may have its own options, different than the others
	options = function(newTitle) { //configurable pageTitle global postman variable
		return {
			collection: path.join(__dirname, 'NewmanTests.postman_collection.json'),
			reporters: 'cli',
			insecure: allowInsecureSSL, //allow insecure SSL certificates (I use this for local testing)
			globals: {
				"values":[
					{
						"key": "aspAuthCookie", //The authentication cookie is set here for all calls
						"value": "1498009E9E4CADD3E0DBC401B5E7143CB91EAF319FD7ECD6D065646B40A7E9090D4B9AD092D43CAE2EFD4857653F343AD8E4C56391D07DE0407E99CDFD2DDF6D2831251058E76FC70F1B6320DB025BFB57B9BDCFC19FE36841F47A98314CA33C85C66BA738CD5A5E02D30BFE2E975688E5B616C18A3923C9B9A0038ABEE3AB10",
						"type": "text",
						"enabled": true
					},
					{
						"key": "pageTitle",
						"value": newTitle,
						"type": "text",
						"enabled": true
					}
				]
			}
		}
	},

	//this is the collection runner function
	parallelCollectionRun = function(newTitle, done) {
		return function(done) { //return the function that will be called asynchronously
			newman.run(options(newTitle), done); //done will be the callback function
		}
	},
	//array of the collections to run
	collections = [parallelCollectionRun("title0")], //initially only 1 element
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
			collections.push(parallelCollectionRun("title" + collections.length));
			console.info("Launching test for " + collections.length + " concurrent collections.");
			async.parallel(collections, recursiveCallBack);
		}
	};
//--------------------------------------------------------------------------------------------//
console.log("Start concurrency tests.");
console.info("Launching test for " + collections.length + " concurrent collection.");
async.parallel(collections, recursiveCallBack);
