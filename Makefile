
build:

	docker-compose build

push: build

	docker push 'manager.asora.co/garo/templates:1.0.1'
	docker push 'manager.asora.co/garo/server:1.0.1'
