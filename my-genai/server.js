const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.post("/chat", async (req, res) => {

  const userMessage = req.body.message;

  try {

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3",
        prompt: userMessage,
        stream: false
      })
    });

    const data = await response.json();

    res.json({
      reply: data.response
    });

  } catch (error) {

    console.log(error);

    res.json({
      reply: "Error running local AI"
    });
  }

});

app.listen(3000, () => {
  console.log("Running on http://localhost:3000");
});