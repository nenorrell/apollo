NODE=14
IMAGE=apollo/api
TEST_IMAGE=apollo/test
UNIT_TEST := "tests/**/*.test.ts"
INTEGRATION_TEST := "tests/**/*.int-test.ts"

launch: down install network up

down:
	docker-compose down

up:
	docker-compose up

build:
	docker build --no-cache -t $(IMAGE):latest .

network:
	./bin/network.sh

install:
	docker run -i --rm --name install-apollo-api -v `pwd`:/usr/src/app -w /usr/src/app node:${NODE} npm install ${PCKG}

db-migrate:
	node node_modules/db-migrate/bin/db-migrate create ${NAME}

test: install unit_test

build_test:
	docker build -t apollo/test:latest -f Dockerfile.test .

unit_test:
	docker run -i --rm -p "9199:9200" -v `pwd`:/usr/src/app -w /usr/src/app node:${NODE} \
	node_modules/.bin/nyc \
	node_modules/.bin/mocha \
	--require ./tests/testHelper.js \
	--require @babel/polyfill \
	$(UNIT_TEST) -R spec --color --verbose

integration-test:
	docker run -i --rm -p "9198:1337" -v `pwd`:/usr/src/app -w /usr/src/app node:${NODE} \
	node_modules/.bin/nyc \
	node_modules/.bin/mocha \
	--require ts-node/register \
	--require ./tests/testHelper.js \
	--require @babel/polyfill \
	./build/build.js $(INTEGRATION_TEST) -R spec --color --verbose --exit

integration-test-run:	
	docker run --network=apollo-api_test -i --rm -v `pwd`:/usr/src/app -w /usr/src/app node:${NODE} node_modules/.bin/nyc node_modules/.bin/_mocha ./app.ts $(INTEGRATION_TEST) -R spec --color