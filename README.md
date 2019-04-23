# sanitise-expense-data

This scripts purpose is to bulk update the category and subcategory property of existing expenses (as exported from the iExpenseIt mobile app).
It does this according to 'mappings' in a mapping.csv file.

Add a file `san.csv` to `server/src/data` of existing expenses. Then create a `map.csv` file there too, matching the format shown in `map-sample.csv`.

`docker-compose up` to build, and `docker-compose run server yarn run start` to sanitise.