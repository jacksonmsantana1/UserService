MicroService responsible for all the requests related with the User Object

OBS => 
	- (/user/projects) Not tested when the request doesnt contain the auth object and the auth.isAutheticated value 
	- (/user/projects) Not tested when the user retrieved from the the database doesnt contain the projects property
	- MongoDB ->  "mongod --config /usr/local/etc/mongod.conf"
