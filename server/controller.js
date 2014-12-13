
var fs      = require('fs');
var path    = require('path');
var util    = require('./util.js');
var config  = require('./config.js');
var parse   = require('./parser');


function sendError(res, message)
{
	return res.status(400).json({error:message}).send();
}


module.exports.homePage = function(req, res) {
	res.render('index');
};

module.exports.selectPage = function(req, res) {
	var user = req.query.user ? req.query.user : "brendanwhitfield";
	var repo = req.query.repo ? req.query.repo : "senna";

	util.getRepo(user, repo, function(err, tmp_path) {
		if(err)
		{
			console.log(err);
			return sendError(res, err);
		}
		else
		{
			util.listC(tmp_path, function(err, files) {
				if(err)
				{
					console.log(err);
					sendError(res, err);
				}
				else
				{
					res.render('select', { user:user, repo:repo, files:files });
				}
			});
		}
	});
};

module.exports.cgraphPage = function(req, res) {
	var user = req.query.user;
	var repo = req.query.repo;

	//get the filenames from the query string
	var filenames = [];
	for(var key in req.query)
	{
		//all other keys should be filenames
		if(['user', 'repo'].indexOf(key) === -1)
			filenames.push(key);
	}


	//load the C files
	util.loadC(user, repo, filenames, function(err, files) {
		if(err)
		{
			console.log(err);
			return sendError(res, "Failed to load the requested files from disk");
		}
		else
		{
			//parse the C files into a call graph
			parse(files, function(err, data) {
				res.render('cgraph', {
					user:      user,
					repo:      repo,
					data:      JSON.stringify(data, function(k, v){return v;}, 4),
					num_files: data.groups.length,
					num_funcs: data.nodes.length,
					num_calls: data.links.length,
				});
			});
		}
	});
};

//bouncing these off the server to avoid some cross domain errors when developing locally
module.exports.getFile = function(req, res) {
	var user     = req.query.user;
	var repo     = req.query.repo;
	var filename = req.query.filename;

	var file_path = path.join(config.tmp_dir, user, repo, filename);

	if(!util.securePath(file_path, config.tmp_dir))
		return sendError(res, 'Please specifiy valid path');

	fs.readFile(file_path, function(err, data) {
		if(err)
		{
			console.log(err);
			res.status(404).send("File not found");
		}
		else
		{
			res.send(data.toString('utf8'));
		}
	});
};
