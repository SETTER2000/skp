var AWS = require('aws-sdk');

// Based on:
// https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/requests-using-stream-objects.html

var source = './11.jpg';
var destination = 'D:\\1.mp4';
var awsAccessKey = process.argv[2];
var awsSecret = process.argv[3];
var bucketName = 'patzi';

console.log('Using AWS access key:', awsAccessKey);
console.log('Using AWS secret:', awsSecret);
console.log('Using bucket:', bucketName);
console.log('Downloading file in S3:', source);
console.log('Downloading file to:', destination);

// var s3 = new AWS.S3({
//   apiVersion: '2006-03-01',
//   region: 'us-west-2',
//   accessKeyId: awsAccessKey,
//   secretAccessKey: awsSecret
// });


// var readable = s3.getObject({
//   Bucket: bucketName,
//   Key: source,
// })
// .createReadStream();
// readable.on('error', (err)=>{
//   console.error('s3 download stream error:',err);
// });

// var drain = require('fs').createWriteStream(destination);
// drain.on('error', (err)=>{
//   console.error('local filesystem write error:',err);
// });
// drain.on('finish', ()=>{
//   console.log('Download Success!');
// });//_∏_

// readable.pipe(drain);


// // wtf:
// //
// // s3.getObject({
// //   Bucket: bucketName,
// //   Key: require('path').basename(filePath),
// // }, function (err, data) {
// //   if (err) {
// //     console.log('Error', err);
// //   } if (data) {
// //     console.log('Download Success', data);
// //   }
// // });
var fileStream = require('fs').createReadStream(source);
fileStream.on('error', (err) => {
  console.log('File Error', err);
});


// Or, using adapter:
// ================================================
var adapter = require('../index')({
  bucket: bucketName,
  region: 'us-west-1',
  key: awsAccessKey,
  secret: awsSecret,
  Key: require('path').basename(source),
  Body: fileStream
});
var s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  region: 'us-west-1',
  accessKeyId: awsAccessKey,
  secretAccessKey: awsSecret
});
var receiving = adapter.receive();

s3.upload(receiving, (err, filesUploaded) => {
  if (err) {
    console.log('ERRR::: ', err);
  }

  console.log('filesUploaded::: ', filesUploaded);
});
// ================================================
