Introduction:
This inventory management system is designed to help efficiently track and manage items. The frontend is developed using React.js for an interactive and responsive user experience, styled with Tailwind CSS for a clean and modern look. The backend is powered by Python with Flask, handling data processing and communication. A MySQL database is used to store and organize inventory data, ensuring reliable and structured information management. This project demonstrates how these technologies work together to create a functional and user-friendly system.

Implementation:
To implement the project, we first used the db script to create the database and tables. Then we added some dummy data into the table. To start the backend server, we ran the following commands:

$ cd project_backend 
$ python3 -m venv final
$ source final/bin/activate
$ pip install flask
$ pip install mysql-connector-python
$ python3 backend.py

To start the frontend server, we ran the following commands:
$ npm i
$ npm run dev
