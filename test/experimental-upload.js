var AWS = require('aws-sdk');
var flaverr = require('flaverr');
const Jimp = require('jimp');
const sharp = require('sharp');
const gm = require('gm')
  , resizeX = 1424
  , resizeY = 800
  , gravity = 'Center'// NorthWest, North, NorthEast, West, Center, East, SouthWest, South, SouthEast
  , Q = 45 // Качество изображения (100 - 0) http://www.graphicsmagick.org/GraphicsMagick.html#details-compress
;

// See
// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3/ManagedUpload.html#httpUploadProgress-event

var source = './11.jpg';
var awsAccessKey = process.argv[2];
var awsSecret = process.argv[3];
var bucketName = 'patzi';
var maxBytes = 20000000;

console.log('Using AWS access key:', awsAccessKey);
console.log('Using AWS secret:', awsSecret);
console.log('Using bucket:', bucketName);
console.log('Uploading file:', source);
console.log('Max bytes:', maxBytes);

var s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  // region: 'us-west-1',
  // accessKeyId: awsAccessKey,
  // secretAccessKey: awsSecret
});
var transformer = sharp()
    .resize(800)
    .on('info', function(info) {
        console.log('Image height is ' + info.height);
    });


var fileStream = require('fs').createReadStream(source).pipe(transformer);
fileStream.on('error', (err)=>{
  console.log('File Error', err);
});

/*
gm(fileStream)
// .flip()
// .magnify()
// .rotate('green', 45)
// .blur(7, 3)
//   .resizeExact(resizeX,resizeY)
  .autoOrient()
  // .noProfile()
  // .bitdepth(16)
  // Например, чтобы увеличить яркость цвета на 10% и уменьшить насыщенность
  // цвета на 10% и оставить без изменений оттенок, используйте: -modulate 110,90
  // .modulate(110, 90)
  .resize(resizeX, resizeY)
  // .gravity(gravity) // Какую область оставить в обрезке
  // .crop(resizeX, resizeY)
  // .edge(3)
  // .stroke("#FFFFFF")
  // .drawCircle(10, 10, 20, 10)
  // .font( fs.readFileSync(__dirname+"/../../../assets/fonts/OpenSans-Light.ttf"), 12)
  // .drawText(50, resizeY - 20, "www.poaleell.com")
  // .compress('JPEG')
  .quality(Q) // качество сжатия изображения
  // глубина цвета
  // .sampling-factor("2x1")
  .write(fileStream, function (err) {
    if (err) console.log('Error loading images in upload-files::: ', err);
  });

*/

// const semiTransparentRedPng = await sharp({
//   create: {
//     width: 48,
//     height: 48,
//     channels: 4,
//     background: { r: 255, g: 0, b: 0, alpha: 0.5 }
//   }
// })
//   .png()
//   .toBuffer();


// const roundedCornerResizer =
//   sharp()
//     .resize(resizeX, resizeY)
//     .composite([{
//       input: fileStream,
//       blend: 'dest-in'
//     }])
//     .png()
//     .toBuffer()
// ;

//
// var adapter = require('../index')({
//     bucket: bucketName,
//     region: 'us-west-1',
//     key: awsAccessKey,
//     secret: awsSecret,
//     Key: require('path').basename(source),
//     Body: fileStream
// });
// var receiving = adapter.receive();





/*Jimp.read(fd)
  .then(resizePhoto => {
    return resizePhoto
    // .resize(Jimp.AUTO, 256) // resize
      .quality(40) // set JPEG quality
      .cover(resizeX, resizeY)
      .normalize()
      // .greyscale() // set greyscale
      .write(fd); // save
  })
  .catch(err => {
    console.error(err);
  });*/
var wasMaxBytesQuotaExceeded;
// console.log('require(\'path\').basename(source)::: ' , require('path').basename(source));


var s3ManagedUpload = s3.upload({
  Bucket: bucketName,
  Key: require('path').basename(source),
  Body: fileStream
}, (err, data) => {
  if (flaverr.taste({name: 'RequestAbortedError'}, err) && wasMaxBytesQuotaExceeded) {
    err = flaverr({code: 'E_EXCEEDS_UPLOAD_LIMIT'}, new Error('Upload too big!'));
    console.log('Quota exceeded', err);
  } else if (err) {
    console.log('Upload error', err);
  } else {
    console.log('Upload success', data['Location']);
  }
});//_∏_

s3ManagedUpload.on('httpUploadProgress', (event)=>{
  if (event.loaded > maxBytes) {
    console.log('UPLOAD ('+event.loaded+') EXCEEDED MAX BYTES!');
    wasMaxBytesQuotaExceeded = true;
    s3ManagedUpload.abort();
  } else {
    console.log(event.loaded + ' of ' + event.total + ' bytes');
  }
});//œ


