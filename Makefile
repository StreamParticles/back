PROJECT = "StreamParticles back"

install: ;@echo "Installing ${PROJECT}";
	npm install

build : ;@echo "Building ${PROJECT}";
	docker-compose build;

start : ;@echo "Starting ${PROJECT}";
	docker-compose up server;

start-daemon : ;@echo "Starting daemonized ${PROJECT}";
	docker-compose up multi-instances-server;

dev : ;@echo "Starting  ${PROJECT} in dev mode";
	docker-compose up dev-server;

test: ;@echo "Testing ${PROJECT}";
	docker-compose run --rm dev-server npm test;

coverage: ;@echo "Testing ${PROJECT}";
	docker-compose run --rm dev-server npm run coverage;

stop : ;@echo "Stopping ${PROJECT}";
	docker-compose stop

clean : ;@echo "Cleaning ${PROJECT}";
	make stop
	docker-compose rm -f
	docker image prune -a -f