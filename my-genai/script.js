async function sendMessage() {

  const input = document.getElementById("user-input");
  const chatBox = document.getElementById("chat-box");

  const message = input.value;

  if (!message) return;

  chatBox.innerHTML += `<p><b>You:</b> ${message}</p>`;

  input.value = "";

  const response = await fetch("http://localhost:3000/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: message
    })
  });

  const data = await response.json();

  chatBox.innerHTML += `<p><b>AI:</b> ${data.reply}</p>`;
}