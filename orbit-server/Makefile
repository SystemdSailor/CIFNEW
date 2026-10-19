.PHONY: build run clean

build:
	go build -o orbit-server .

run: build
	./orbit-server

clean:
	rm -f orbit-server
	rm -rf orbitdb-data