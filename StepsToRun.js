/* 
sudo rm -f /tmp/mongodb-27017.sock


maildev 

ps aux | grep mongod


sudo kill -9 <PID>



✅ Step 3: Start the replica set nodes
Now start all 3 nodes manually (not with --fork yet), each in a separate terminal/tab.

Terminal 1:
mongod --replSet rs --port 27017 --dbpath /data/rs0 --bind_ip localhost


Terminal 2:
mongod --replSet rs --port 27018 --dbpath /data/rs1 --bind_ip localhost


Terminal 3:
mongod --replSet rs --port 27019 --dbpath /data/rs2 --bind_ip localhost


Let each one fully start — wait for this log:

Waiting for connections on port 2701X

✅ Step 4: Initialize the replica set
In a new terminal, connect to the first instance:


mongosh --port 27017
Then initiate:


rs.initiate({
  _id: "rs",
  members: [
    { _id: 0, host: "localhost:27017" },
    { _id: 1, host: "localhost:27018" },
    { _id: 2, host: "localhost:27019" }
  ]
})
Check status:


rs.status()
You should now see one node as PRIMARY, and two as SECONDARY.

maildev


login

{
    "username" : "abc123@gmail.com",
    "password" : "123456@abc"
}
*/