rm -r tmp 2> /dev/null
mkdir tmp 2> /dev/null
./node_modules/.bin/tsc
mkdir dist/ 2> /dev/null
rm -r dist/* 2> /dev/null
cp -r tmp/* dist/
rm -r tmp 2> /dev/null