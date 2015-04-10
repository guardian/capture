# capture phantomjs screenshot
## cli
The CLI tool can either save files to disk, or upload to an S3 bucket (currently hardcoded to ```slot-shots```).

### saving to disk
usage: ```node cli.js [filename]```

### uploading to S3
usage: ```node cli.js [filename] --s3```
You'll need to be using credentials with access to gu-aws-frontend. If you need to specify a profile other than default, run the app with an AWS_PROFILE variable.
```AWS_PROFILE=frontend node cli.js urls.txt --s3```

```filename``` should point to a file with a list of urls to capture.

## web app
You can run a local server to quickly view the screenshots:
```node server.js```

Browse to http://localhost:3000, enter the URLs and submit.
