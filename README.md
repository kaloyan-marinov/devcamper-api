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
http \
  POST \
  localhost:5000/api/v1/bootcamps \
  name="Devworks Bootcamp" \
  description="Devworks is a full stack JavaScript Bootcamp located in the heart of Boston that focuses on the technologies you need to get a high paying job as a web developer" \
  website="https://devworks.com" \
  phone="(111) 111-1111" \
  email="enroll@devworks.com" \
  address="233 Bay State Rd Boston MA 02215" \
  careers:='["Web Development", "UI/UX", "Business"]' \
  housing:=true \
  jobAssistance:=true \
  jobGuarantee:=false \
  acceptGi:=true
http PUT localhost:5000/api/v1/bootcamps/17
http DELETE localhost:5000/api/v1/bootcamps/17
```
