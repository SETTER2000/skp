// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3/ManagedUpload.html#httpUploadProgress-event
const fs = require('fs');
const mime = require('mime-types');
const path = require('path');
const sharp = require('sharp');
const resizeX = 1424
    , resizeY = 800
    , source = './images/Poale-Ell-Adam.jpg'
    , awsAccessKey = process.argv[2]
    , awsSecret = process.argv[3]
    , bucketName = 'paltos'
    , region = 'us-east-1'
    , maxBytes = 20000000
;


console.log('Using AWS access key:', awsAccessKey);
console.log('Using AWS secret:', awsSecret);
console.log('Using bucket:', bucketName);
console.log('Uploading file:', source);
console.log('Max bytes:', maxBytes);

const adapter = require('../index')({
    region: region,
    accessKeyId: awsAccessKey,
    secretAccessKey: awsSecret
});

const fileStream = fs.readFile(source, function (err, data) {
    // console.log('BUFF:::: ', data);
    if (err) {
        console.log('File Error', err);
    } else {
        sharp(data)
            .resize(resizeX, resizeY, {
                fit: sharp.fit.inside,
                withoutEnlargement: true
            })
            .toFormat('jpeg')
            .toBuffer()
            .then(function (outputBuffer) {
                let uploadPromise = adapter.send({
                    Expires: 60,
                    ContentType: mime.lookup(source),
                    ACL: 'public-read',
                    Bucket: bucketName,
                    Key: path.basename(source),
                    Body: outputBuffer
                }, (err, data)=>{
                    if (err) {
                        console.error('s3 send error:', err);
                    } else {
                        console.log('s3 send success!', data);
                    }
                });
            }).catch(
            function (err) {
                console.error(err, err.stack);
            });
    }
});

