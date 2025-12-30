import mysql from "mysql";

export async function connectToMysql(): Promise<any> {
  try {
    const connection = mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      port: parseInt(process.env.MYSQL_PORT || ""),
    });

    connection.connect();

    connection.query(
      "SELECT 1 + 1 AS solution",
      function (error, results, fields) {
        if (error) throw error;
        console.log("The solution is: ", results[0].solution);
      }
    );

    connection.end();

    return connection;
  } catch (error) {
    throw error;
  }
}
