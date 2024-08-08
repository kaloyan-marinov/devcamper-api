1. create a `config/config.env` file that has the following structure:

```bash
NODE_ENV=development
PORT=

MONGO_URI= # Go to the cluster in your `cloud.mongodb.com` account, click on "Connect" and paste the connection string from there into this environment variable.

GEOCODER_PROVIDER=
GEOCODER_API_KEY=

FILE_UPLOAD_PATH=
MAX_FILE_UPLOAD= # In bytes.
```

2. Create a folder at the location stored in the `FILE_UPLOAD_PATH` environment variable

3. Delete all data from the database:

```bash
node seeder.js -d
```

4. Seed hardcoded data into the database:

```bash
node seeder.js -i
```

5. start serving the backend application

```bash
npm run dev
```

6. issue HTTP requests

```bash
http localhost:5000/api/v1/bootcamps
http 'localhost:5000/api/v1/bootcamps?location.state=MA&housing=true'
http 'localhost:5000/api/v1/bootcamps?averageCost[lt]=10000'
http 'localhost:5000/api/v1/bootcamps?careers[in]=Business'
http 'localhost:5000/api/v1/bootcamps?select=name,description'
http 'localhost:5000/api/v1/bootcamps?select=name,housing&sort=name'
http 'localhost:5000/api/v1/bootcamps?select=name,housing&sort=-name'
http 'localhost:5000/api/v1/bootcamps?select=name&limit=2'
http 'localhost:5000/api/v1/bootcamps?select=name&limit=2&page=2'

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

```bash
http localhost:5000/api/v1/courses
http localhost:5000/api/v1/bootcamps/5d713995b721c3bb38c1f5d0/courses
```

```bash
http \
  -f \
  PUT \
  localhost:5000/api/v1/bootcamps/5d725a1b7b292f5f8ceff788/photo

http \
  -f \
  PUT \
  localhost:5000/api/v1/bootcamps/5d725a1b7b292f5f8ceff788/photo \
  file@<path-to-some-NON-image-file-on-your-device>

http \
  -f \
  PUT \
  localhost:5000/api/v1/bootcamps/5d725a1b7b292f5f8ceff788/photo \
  file@<path-to-some-image-file-on-your-device>

# At this point,
# copy the filename returned by the last request to the clipboard;
# open a web browser;
# enter the following in the address bar:
# http://localhost:5000/uploads/<paste-the-copied-filename> ;
# and load that page in the browser.
```
