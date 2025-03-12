Team performance evaluation system - tracks completed tasks, analyzes team performance and recommends improvements

To start project:

1. Change the data in the .env-tmp and .env.docker-tmp files to yours
    1.1 Change the files names to .env and .env.docker respectively

2. In the terminal, use docker-compose down (if you already have containers running in Docker) and then docker-compose up --build (if the containers are not running)

3. Open localhost:8000/admin and log in with the root user and root password
   3.1 In the Sites table change example.com domain and display name to http://127.0.0.1:8000 and save changes
   3.2 Add social application to the Social applications table with next fields:
    Provider: Google
    Name: Google
    Client id: use your client_id from your client_secret.json
    Secret key: use your client_secret from your client_secret.json
   3.3 Move http://127.0.0.1:8000 from available sites to chosen sites and save changes