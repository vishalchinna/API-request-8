const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
const dbPtah = path.join(__dirname, "todoApplication.db");
app.use(express.json());
let db = null;

const intiLizDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPtah,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Started");
    });
  } catch (e) {
    console.log(`Error message : ${e.message}`);
  }
};
intiLizDbAndServer();
const priorityAndStatusCheck = (requestQuery) => {
  return (
    requestQuery.status !== undefined && requestQuery.priority !== undefined
  );
};
const priorityCheck = (requestQuery) => {
  return requestQuery.priority !== undefined;
};
const statusCheck = (requestQuery) => {
  return requestQuery.status !== undefined;
};

app.get("/todos/", async (request, response) => {
  let todoArray = null;
  let getTodoQuery = "";
  const { search_q = "", priority, status } = request.query;
  switch (true) {
    case priorityAndStatusCheck(request.query):
      getTodoQuery = `
          SELECT * FROM todo WHERE 
          todo LIKE '${search_q}'
          AND status = '${status}'
          AND priority = '${priority}'
          `;
      break;
    case priorityCheck(request.query):
      getTodoQuery = `
          SELECT * FROM todo WHERE 
          todo LIKE '${search_q}'
          AND priority = '${priority}'
          `;
      break;
    case statusCheck(request.query):
      getTodoQuery = `
          SELECT * FROM todo WHERE 
          todo LIKE '${search_q}'
          AND status = '${status}'
          `;
      break;

    default:
      getTodoQuery = `
          SELECT * FROM todo WHERE 
          todo LIKE '${search_q}'

          `;
      break;
  }

  todoArray = await db.all(getTodoQuery);
  console.log(todoArray);
  response.send(todoArray);
});

// API 2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getQuery = `
    SELECT * FROM todo
    WHERE id = ${todoId}
    `;
  const queryArray = await db.get(getQuery);
  response.send(queryArray);
});

// API 3
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const addQuery = `
  
  INSERT INTO todo(id,todo,priority,status)
  VALUES (${id} , '${todo}' , '${priority}' , '${status}')
      `;
  await db.run(addQuery);
  console.log("hhhhhhhhhh");
  response.send("Todo Successfully Added");
});
//API 4
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  console.log(request.params);
  let updateColumn = "";
  const requestBody = request.body;
  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = "Status";
      break;
    case requestBody.priority !== undefined:
      updateColumn = "Priority";
      break;
    case requestBody.todo !== undefined:
      updateColumn = "Todo";
  }
  const previous = `
  SELECT * FROM todo WHERE id = ${todoId}
  `;
  const previousTodo = await db.get(previous);
  console.log(previousTodo);
  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
  } = request.body;
  const putQuery = `
  UPDATE todo SET todo = '${todo}',
  priority = '${priority}',
  status = '${status}'
  WHERE id = ${todoId}

  `;
  const final = await db.run(putQuery);
  console.log(`${updateColumn} Updated`);
  response.send(`${updateColumn} Updated`);
});

//API 5
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `
    DELETE FROM todo WHERE
    id = ${todoId}
    `;
  await db.run(deleteQuery);
  console.log("dele");
  response.send("Todo Deleted");
});
module.exports = app;
