var path = require('path'),
	async = require('async'), //https://www.npmjs.com/package/async install by calling "npm install --save async"
	newman = require('newman'), //https://github.com/postmanlabs/newman install by calling "npm install --save newman"

	allowInsecureSSL = true, //allow insecure SSL certificates (I use this for local testing)
	//newman.run takes two parameters: options and done.
	//options is the collection run options, which include the file describing the collection and other stuff
	//each collection that is being run may have its own options, different than the others
	options = function(username, email, password) { //username and email are functions
		return {
			collection: path.join(__dirname, 'CreateUsers Concurrency Tests.postman_collection.json'),
			reporters: 'cli',
			insecure: allowInsecureSSL, //allow insecure SSL certificates (I use this for local testing)
			globals: {
				"values":[
					{
						"key": "aspAuthCookie", //The authentication cookie is set here for all calls
						"value": "0FB6667C77453B8553E3F235D8304AA46E1BC9BE6422BEF5BD6D93D29BF0739DA9DA79AD50639BB428072258B519A9B15D8B27C9D7BDFFC140C9527A924C89A7F1FAD3A65F8CC7449B7A0558C8C49AE1FBE848935FB6DD62C89BD3A4EA0F79F70C96701E3FFE3F7A6129ABC8B66815E0AF679B9A919B7FC27AEBFE7E6818E2FD",
						"type": "text",
						"enabled": true
					},
					{
						"key": "userName",
						"value": username(),
						"type": "text",
						"enabled": true
					},
					{
						"key": "emailAddress",
						"value": email(),
						"type": "text",
						"enabled": true
					},
					{
						"key": "password",
						"value": password,
						"type": "text",
						"enabled": true
					}
				]
			}
		}
	},

	//this is the collection runner function
	parallelCollectionRun = function(username, email, password, done) {
		return function(done) { //return the function that will be called asynchronously
			newman.run(options(username, email, password), done); //done will be the callback function
		}
	},
	//the generateName and generateEmail functions are the simplest seed-based functions I could
	//think of to make sure their outputs are different at every collection call.
	callCount = 22, //just set this so the first users created do not conflict with existing ones
	generateName = function() {
		callCount = callCount + 1;
		return "uname" + callCount;
	},
	generateEmail = function() {
		callCount = callCount + 1;
		return "mail" + callCount + "@email.com";
	},
	password = "password",
	//array of the collections to run
	collections = [parallelCollectionRun(generateName, generateEmail, password)], //initially only 1 element
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
			collections.push(parallelCollectionRun(generateName, generateEmail, password));
			console.info("Launching test for " + collections.length + " concurrent collections.");
			async.parallel(collections, recursiveCallBack);
		}
	};
//--------------------------------------------------------------------------------------------//
console.log("Start concurrency tests.");
console.info("Launching test for " + collections.length + " concurrent collection.");
async.parallel(collections, recursiveCallBack);
