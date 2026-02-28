To setup the project, do the following after cloning repository:

cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

psql -U postgres
CREATE DATABASE fasttransportdb; \q

python manage.py migrate --settings=config.settings.dev
python manage.py runserver --settings=config.settings.dev

Now, in a separate terminal:

cd frontend
npm install
npm start