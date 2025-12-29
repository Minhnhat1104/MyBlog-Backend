import mysql from "mysql";

export async function connectToMysql(): Promise<any> {
  try {
    const connection = mysql.createConnection({
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      port: parseInt(process.env.DATABASE_PORT || ""),
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
