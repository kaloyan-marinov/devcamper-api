create a `config/config.env` file that has the following structure:

```bash
NODE_ENV=development
PORT=

MONGO_URI= # Go to the cluster in your `cloud.mongodb.com` account, click on "Connect" and paste the connection string from there into this environment variable.
```

```bash
npm run dev
```

```bash
http localhost:5000/api/v1/bootcamps
http localhost:5000/api/v1/bootcamps/17
http POST localhost:5000/api/v1/bootcamps
http PUT localhost:5000/api/v1/bootcamps/17
http DELETE localhost:5000/api/v1/bootcamps/17
```
