import mysql.connector

try:
    mydb = mysql.connector.connect(
        host="localhost",
        user="root",
        password="Shaa@20",
        database="music_system"
    )

    if mydb.is_connected():
        print("Database Connected Successfully")

except mysql.connector.Error as err:
    print("Connection Error:", err)
