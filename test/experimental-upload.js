const AWS = require('aws-sdk');
const fs = require('fs');
const mime = require('mime-types');
const path = require('path');
const sharp = require('sharp');
const resizeX = 1424
    , resizeY = 800
;

// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3/ManagedUpload.html#httpUploadProgress-event
const source = './images/Poale-Ell-Adam.jpg';
const awsAccessKey = process.argv[2];
const awsSecret = process.argv[3];
const bucketName =  'paltos';
// const keyName = 'adam-pole.jpg';
// const dir = '/images/';
// const path = `${dir}${keyName}`;
const maxBytes = 20000000;

console.log('Using AWS access key:', awsAccessKey);
console.log('Using AWS secret:', awsSecret);
console.log('Using bucket:', bucketName);
console.log('Uploading file:', source);
console.log('Max bytes:', maxBytes);

var s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    region: 'us-east-1',
    Expires: 60,
    ContentType: mime.lookup(source),
    ACL: 'public-read',
    accessKeyId: awsAccessKey,
    secretAccessKey: awsSecret
});

var fileStream =  fs.readFile(source, function (err, data) {
    // console.log('BUFF:::: ', data);
    if (err) {
        console.log('File Error', err);
    }else{
        sharp(data)
            .resize(resizeX, resizeY, {
                fit: sharp.fit.inside,
                withoutEnlargement: true
            })
            .toFormat('jpeg')
            .toBuffer()
            .then(function(outputBuffer) {
                let uploadPromise = s3.upload({
                    Expires: 60,
                    ContentType: mime.lookup(source),
                    ACL: 'public-read',
                    Bucket: bucketName,
                    Key: path.basename(source),
                    Body: outputBuffer
                }).promise();
                uploadPromise.then(
                    function (data) {
                        console.log("Successfully uploaded data to " + bucketName + "/" +  path.basename(source));
                        console.log("ETag: ", data.ETag);
                        let params = {Bucket: bucketName, Key: path.basename(source)};
                        const s3 = new AWS.S3();
                        // Вернёт URL только что загруженой картинки
                        s3.getSignedUrl('getObject', params, (err, data) => {
                            if (err) {
                                console.log(err);
                            }
                            console.log('URL загруженой картинки: ', data);
                        });
                    }).catch(
                    function (err) {
                        console.error(err, err.stack);
                    });
            });
    }
});

