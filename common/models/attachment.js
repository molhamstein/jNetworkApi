'use strict';
const isImage = require('is-image');
var ffmpeg = require('fluent-ffmpeg');
var thumb = require('node-thumbnail').thumb;
const path = require('path');
const ffprobePath = require('@ffprobe-installer/ffprobe').path;
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
var thumbler = require('video-thumb');
var base_url = "http://185.84.236.39:3000/";
var fs = require('fs');
module.exports = function(Attachment) {
	 // practical example
	/*Attachment.dataSources.storage.connector.getFilename = function (origFilename, req, res) {
        var origFilename = origFilename.name;
        var parts = origFilename.split('.'),
        extension = parts[parts.length-1];
        var newFilename = (new Date()).getTime()+'_'+parts[parts.length-2]+'.'+extension;
        return newFilename;
  }*/
  Attachment.afterRemote('upload', function(ctx, unused, next) {
		console.log('vvv: good');
		var files = ctx.result.result.files.file;
		console.log('vvv: FILE(S) UPLOADED: %j', files);
		// TODO - process all items in `files` array
		var item = files[0];
		console.log(item.name);
		var name = item.name;
		next();
    }); // works
    
    Attachment.beforeRemote('upload', function(ctx, unused, next) {
        var folderName = ctx.req.params.container;
       
        let src = path.join(__dirname, '../../uploads');
        var dir = src + "/" + folderName;
        if (!fs.existsSync(dir)){
            console.log(dir);
            fs.mkdirSync(dir);
        }
        next();
	}); // works
	
	Attachment.afterRemote('upload', function (context, result, next) {
        let files = [];
		ffmpeg.setFfprobePath(ffprobePath);
		ffmpeg.setFfmpegPath(ffmpegPath);
        // folder name come from url request
        var folderName = context.req.params.container;
       
        let src = path.join(__dirname, '../../uploads');
        //var dir = src + "/" + folderName;
       console.log(src);
        if (process.env.NODE_ENV != undefined) {
            ffmpeg.setFfmpegPath(path.join(config.thumbUrl + config.programFFmpegName[0]));
            ffmpeg.setFfprobePath(path.join(config.thumbUrl + config.programFFmpegName[1]));
        }

        result.result.files.file.forEach((file) => {
            // cheack type of file from folder name request
			console.log(src + "/" + folderName + "/" + file.name)
			if(isImage(src + "/" + folderName + "/" + file.name))
			{
				thumb({
                    source: src + "/" + folderName + "/" + file.name,// could be a filename: dest/path/image.jpg
                    destination: src + '/thumb_link/',
                    concurrency: 4
                }, function (files, err, stdout, stderr) {
                });
                var parts = file.name.split('.');
                var extension = parts[parts.length - 1];
                files.push({ 'file': base_url+"api/attachments/"+folderName+"/download/" + file.name, 'thumbnail': base_url+"api/attachments/thumb_link/download/" + file.name.substring(0, file.name.lastIndexOf('.')) + "_thumb." + extension });

			}
            else {
                ffmpeg(src + "/" + folderName + "/" + file.name)
                    .screenshot({
                        count: 1,
                        filename: file.name.substring(0, file.name.lastIndexOf('.')) + "_thumb.PNG",
                        folder: src + '/thumb_link/',
                        size: '320x240'
                    });
				console.log(src + "/" + folderName + "/" + file.name);
				/*thumbler.extract(src + "/" + folderName + "/" + file.name, src + '/thumb_link/'+file.name.substring(0, file.name.lastIndexOf('.')) + "_thumb.PNG", '00:00:22', '320x240', function(){
	
						console.log('snapshot saved to snapshot.png (200x125) with a frame at 00:00:22');

					});*/
                files.push({ 'file': base_url+"api/attachments/"+folderName+"/download/" + file.name, 'thumbnail': base_url+"api/attachments/thumb_link/download/" + file.name.substring(0, file.name.lastIndexOf('.')) + "_thumb.PNG" });

            }
           
        });
        context.res.json(files);
	});
};
