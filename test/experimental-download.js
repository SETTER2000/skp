/**
 *  awsAccessKey & awsSecret - не обязательно прописывать в process.argv[2] || process.argv[3]
 *  если у вас настроена глобальная авторизация на компьютере с помощью файла C:\Users\userName\.aws\credentials
 *
 * @type {string}
 */
// https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/requests-using-stream-objects.html

var source = 'Poale-Ell-Adam.jpg';
var destination = 'D:\\Poale-Ell-Adam.jpg';
var awsAccessKey = process.argv[2];
var awsSecret = process.argv[3];
var bucketName = 'paltos';

console.log('Using AWS access key:', awsAccessKey);
console.log('Using AWS secret:', awsSecret);
console.log('Using bucket:', bucketName);
console.log('Downloading file in S3:', source);
console.log('Downloading file to:', destination);

var adapter = require('../index')({
  bucket: bucketName,
  key: awsAccessKey,
  secret: awsSecret,
});

var readable = adapter.read(source);
var drain = require('fs').createWriteStream(destination);
drain.on('error', (err)=>{
  console.error('local filesystem write error:',err);
});
drain.on('finish', ()=>{
  console.log('Download Success!');
});//_∏_

readable.pipe(drain);

// ================================================
