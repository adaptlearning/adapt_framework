echo '  Downloading code'
curl -sL https://github.com/adaptlearning/adapt_framework/archive/master.zip > master.zip
unzip master.zip -d . &> /dev/null && rm master.zip
cd adapt_framework-master
echo '  Installing dependencies'
npm install &> /dev/null
perl -pi -e 's/\*/2\.0\.0/g' adapt.json
echo '  Downloading core bundle v2.0.0'
adapt install &> /dev/null
echo '  Building framework'
grunt build &> /dev/null
