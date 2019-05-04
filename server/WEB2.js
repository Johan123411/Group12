var uuid = require("uuid/v1");
var express = require("express");
var app = express();
var bodyParser = require("body-parser");

const aws = require("aws-sdk");




const uuidv4 = require('uuid/v4');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

var logRequestPathBodyArray = new Array();
var pathsAccessedArray = new Array();
var reqCnt = 0;

async function getConnection()
{
var MongoClient = require("mongodb").MongoClient;
var conn = await MongoClient.connect("mongodb://localhost:27017/", {useNewUrlParser : true});
var db = await conn.db("PROJECT");
var coll = await db.collection("Movies");

return await coll;
}

app.use(async function(req, res, next){
	
	
	var logRequestPathBody = new Object();
	
	if(await req.method)
	{
		logRequestPathBody["method"] = await req.method;
	}
	
	if(await req.path)
	{
		logRequestPathBody["path"] = await req.path;
	}
	
	if(await req.body)
	{
		logRequestPathBody["body"] = await req.body;
	}
	
	await logRequestPathBodyArray.push(await logRequestPathBody);

	console.log(logRequestPathBodyArray);
	
	next();
});


app.use(async function(req, res, next){
	
	var pathsAccessedObject = new Object();
	
	let cnt = 0;
	
	for(let i=0; i<pathsAccessedArray.length; i++)
	{
		
		if(pathsAccessedArray[i].path == await req.path)
		{
			if(pathsAccessedArray[i].method == await req.method)
			{
				pathsAccessedArray[i].cnt = pathsAccessedArray[i].cnt + 1;
				await cnt++;
				
				console.log("The path : " , await pathsAccessedArray[i].method, " ", await pathsAccessedArray[i].path , " has been accessed ", await pathsAccessedArray[i]["cnt"], " times." );
				break;
			}
		}

	}
	
	if(await cnt == 0)
	{
		pathsAccessedObject["path"] = await req.path;
		
		pathsAccessedObject["method"] = await req.method;
			
		pathsAccessedObject["cnt"] = 1;
			
		await pathsAccessedArray.push(await pathsAccessedObject);
		
		console.log("The path : " , await req.method, " ", await req.path , " has been accessed ", await pathsAccessedObject["cnt"], " times." );
	}
	
	next();
	
});

app.get("/api/tasks", async function(req, res){
	
	let resultArr = new Array();
	let cnt = 0;

		if(await req.query["skip"])
		{
			if(typeof await req.query.skip === "number")
			{
				resultArr = await getTasks("skip", parseInt(req.query.skip));
				
			}
			else
			{
				await res.status(400).send("Invalid input.");
			}
			await cnt++;
		}
		else
		{
			if(req.query["take"])
			{
				if(typeof await req.query.take === "number")
				{
					if(await parseInt(req.query.take) <= 100)
					{
						resultArr = await getTasks("take", parseInt(req.query.take));
					}
					else
					{
						await res.status(416).json("The take limit should be less than or equal to 100.");
					}
				}
				else
				{	
					await res.status(400).json("Invalid input.");
				}
				await cnt++;
			}
			else
			{
				resultArr = await getTasks("none", 0);
				await cnt++;
			}
			
		}
		
		if(await cnt == 0)
		{	
			await res.status(400).json("Invalid input.");
		}
		else
		{
			await res.status(200).json(await resultArr);
		}

});

app.get("/api/tasks/:id", async function(req, res){
	
	let dbAPIs = await getConnection();
	
	let userId = await req.params.id;
	
	let resObj = await dbAPIs.findOne({id : userId});
	
	if(await resObj)
	{
		await res.status(200).json(await resObj);
	}
	else
	{
		res.status(204).send("No data found.");
	}
	
});


app.post("/api/tasks/", async function(req, res){
	
	let dbAPIs = await getConnection();
	
	let cnt1 = 0;
	
	let postObj = new Object();
	
	if(await req.body["title"] && typeof await req.body["title"] == "string")
	{
		postObj["title"] = await req.body.title;
	}
	else
	{
		await cnt1++;
		await res.status(400).json("Invalid task object format.");
	}
	
	if(await req.body["description"] && typeof await req.body["description"] == "string")
	{
		postObj["description"] = await req.body.description;
	}
	else
	{
		await cnt1++;
		await res.status(400).json("Invalid task object format.");
	}
	
	if(await req.body["hoursEstimated"])
	{
		postObj["hoursEstimated"] = await req.body.hoursEstimated;
	}
	else
	{
		await cnt1++;
		await res.status(400).json("Invalid task object format.");
	}
	
	if(await typeof req.body["completed"] == "boolean")
	{
		postObj["completed"] = await req.body.completed;
	}
	else
	{
		await cnt1++;
		await res.status(400).json("Invalid task object format.");
	}
	
	if(await req.body["comments"] && Array.isArray(req.body["comments"]))
	{
		let cntObj = 0;
		for(let i=0; i<await req.body.comments.length; i++)
		{
			if(await typeof req.body.comments[i] == "object")
			{
				await cntObj++;
			}
		}
		if(await cntObj !== await req.body.comments.length)
		{
			res.status(400).json("Invalid task object format.");
			cnt1++;
		}
		else
		{
			postObj["comments"] = await req.body.comments;

			for(let i=0; i<await req.body.comments.length; i++)
			{
				let id = await uuid();
				postObj["comments"][i]["id"] = await id;
			}
			
		}
		
	}
	else
	{
		await cnt1++;
		await res.status(400).json("Invalid task object format.");
	}
	
	postObj["id"] = await uuid();
	
	
	
	if(await cnt1 == 0)
	{
	
		let resObj = await dbAPIs.insertOne(await postObj);
	
		let insertedObj = await dbAPIs.findOne({_id : await resObj.insertedId});
	
		if(await insertedObj && await insertedObj !== null)
		{
			await res.status(200).json(await insertedObj);
		}
		else
		{
			res.status(500).send("Error in creating data.");
		}
	}
});


app.put("/api/tasks/:id", async function(req, res){
	
	if(await req.params.id)
	{
		let dbAPIs = await getConnection();
		
		let taskId = await req.params.id;
		
		let retriveObj = await dbAPIs.findOne({id : taskId});
	
		
		if(await retriveObj && await retriveObj !== null)
		{
			if(await req.body["title"] && typeof await req.body["title"] == "string" && 
				await req.body["description"] && typeof await req.body["description"] == "string" && 
				await req.body["hoursEstimated"] && typeof await req.body["hoursEstimated"] === "number" && 
				typeof await req.body["completed"] == "boolean" )
			{
				
				let updatedObj = await dbAPIs.updateOne({"id" : taskId}, {$set : {"title" : await req.body["title"], "description" : await req.body["description"], "hoursEstimated" : await req.body["hoursEstimated"], "completed" : await req.body["completed"]}});
				
				if(await updatedObj)
				{
					res.status(200).json(await dbAPIs.findOne({id : taskId}));
				}
				else
				{
					res.status(500).json("Error while updating the task.");
				}
			
			}
			else
			{
				res.status(400).json("Error: Data not in the proper format.");
			}
		}
		else
		{
			res.status(204).json("No task found with this task id.");
		}
	}
	else
	{
		res.status(400).json("Task id not provided.");
	}
	
});


app.patch("/api/tasks/:id", async function(req, res){
	
	if(await req.params.id)
	{
		let dbAPIs = await getConnection();
		
		let taskId = await req.params.id;
		
		let retriveObj = await dbAPIs.findOne({id : taskId});
		
		let updatedObj = "";
		
		if(await retriveObj && await retriveObj !== null)
		{
			if((await req.body["title"] && typeof await req.body["title"] == "string") || 
			(await req.body["description"] && typeof await req.body["description"] == "string") || 
			(await req.body["hoursEstimated"] && typeof await req.body["hoursEstimated"] === "number") || 
			(typeof await req.body["completed"] == "boolean"))
			{
				if(await req.body["title"])
				{
					updatedObj = await dbAPIs.updateOne({id : taskId}, {$set : {"title" : await req.body.title}});
				}
				
				if(await req.body["description"])
				{
					updatedObj = await dbAPIs.updateOne({id : taskId}, {$set : {"description" : await req.body.description}});
				}
				
				if(await req.body["hoursEstimated"])
				{
					updatedObj = await dbAPIs.updateOne({id : taskId}, {$set : {"hoursEstimated" : await req.body.hoursEstimated}});
				}
				
				if(typeof await req.body["completed"] == "boolean")
				{
					updatedObj = await dbAPIs.updateOne({id : taskId}, {$set : {"completed" : await req.body.completed}});
				}
				
				if(await updatedObj)
				{
					res.status(200).json(await dbAPIs.findOne({id : taskId}));
				}
				else
				{
					res.status(500).json("Error while updating the task.");
				}
			
			}
			else
			{
				res.status(400).json("Error: Data not in the proper format.");
			}
		}
		else
		{
			res.status(404).json("No task found with this task id.");
		}
	}
	else
	{
		res.status(400).json("Task id not provided.");
	}
});


app.post("/api/tasks/:id/comments", async function(req, res){
	
	if(await req.params.id)
	{
		let dbAPIs = await getConnection();
		
		let taskId = await req.params.id;
		
		let retriveObj = await dbAPIs.findOne({id : taskId});
		
		if(await retriveObj && await retriveObj !== null)
		{
			if(await req.body.name && typeof await req.body.name === "string" && await req.body.comment && typeof await req.body.comment === "string")
			{
				
				let commentObj = await req.body;
				
				commentObj["id"] = await uuid();
				
				let updatedObj = await dbAPIs.updateOne({id : taskId}, {$push : {"comments" : await commentObj}});
				
				if(await updatedObj)
				{
					res.json(await dbAPIs.findOne({id : taskId}));
				}
				else
				{
					res.status(500).send("Error while updating the task.");
				}
			
			}
			else
			{
				res.status(400).send("Error: Data not in the proper format.");
			}
		}
		else
		{
			res.status(204).json("No task found with this task id.");
		}
	}
	else
	{
		res.status(400).json("Task id not provided.");
	}
	
});


app.delete("/api/tasks/:taskId/:commentId", async function(req, res){
	
	if(await req.params.taskId && await req.params.commentId)
	{
		let dbAPIs = await getConnection();
		
		let taskId = await req.params.taskId;
		
		let retriveObj = await dbAPIs.findOne( {$and : [{id : await taskId}, {comments : {$elemMatch : {id : await req.params.commentId}}}]});
		
		if(await retriveObj && await retriveObj !== null)
		{
			let deletedObj = await dbAPIs.updateOne({id : await taskId}, {$pull : {"comments" : {id : await req.params.commentId}}});
			
			if(await deletedObj && await deletedObj !== null)
			{
				res.status(200).json("Successfully deleted.");
			}
			else
			{
				res.status(500).json("Error in deletion.");
			}
		}
		else
		{
			res.status(204).json("No task found with this task id.");
		}
	}
	else
	{
		res.status(400).send("Task id not provided.");
	}
});

app.get("/video", async function(req, res){
	let videoObj = new Object();
	
	let dbAPIs = await getConnection();
	
	videoObj["vid"] =await "https://media.w3.org/2010/05/video/movie_5.mp4";
	videoObj["vid1"] =await "https://media.w3.org/2010/05/sintel/trailer_hd.mp4";
	videoObj["vid2"] =await "file:///C:/Users/16465/Desktop/SampleVideo_1280x720_1mb.mp4";
	
	getS3();
	
	
	await res.json(await videoObj);
});



app.get("/video/list", async  function (req,res)
{
	const mongoCollections = require("./mongoCollections");
	const todoItems = mongoCollections.todoItems;


	const taskCollection = await todoItems();

	const tasks = await taskCollection.find({}).toArray();   //makes an array of all tasks and prints the array of all tasks

	responseList = []

	for(let i =0 ; i < tasks.length; i++)
	{
		responseList.push(tasks[i].Movie_Name)
	}

	console.log(responseList)

	await res.json(responseList)
});



async function getS3()
{
	try
	{
		aws.config.setPromisesDependency();
		aws.config.update({
			accessKeyId: "AKIAJGHXZUKMOAJGY66A",
			secretAccessKey: "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",
			region: 'us-east-1'
		});
		
		
		
		const s3 = new aws.S3();
		const response = await s3.listObjectsV2({
			Bucket: 'cs554netflix'
		}).promise();
		
		params = {Bucket:'cs554netflix', Key: 'SampleVideo_1280x720_1mb.mp4', Expires: 20000000};

		
		const response1 = await s3.getUrl('getObject', params, function (err, url) {
			console.log('Signed URL: ' + url);
			});;
		
		console.log(await response);
	}
	catch(e)
	{
		console.log(e);
	}
}


async function getTasks(action, limit)
{
	let takeArr = new Array();
	let generalArr = new Array();
	
	let dbAPIs = await getConnection();
	
	if(action == "skip")
	{
		let resultArr = await dbAPIs.find({}).skip(limit).toArray();
	
		return await resultArr;
	}
	
	if(action == "take")
	{
		let resultArr1 = await dbAPIs.find().toArray();
		
		for(let i=0; i<limit; i++)
		{
			if(await resultArr1[i])
			{
				await takeArr.push(await resultArr1[i]);
			}
		}
		
		return await takeArr;
	}
	
	if(action == "none")
	{
		let resultArr = await dbAPIs.find({}).toArray();
		
		for(let i=0; i < resultArr.length && i<20; i++)
		{
				await generalArr.push(await resultArr[i]);
		}
		
		return await generalArr;
	}
}

app.listen(3001, function(){
	console.log("The link is active on localhost:3001");
});
