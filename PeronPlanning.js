// ======= LOGIN =======
let username = localStorage.getItem("username");

if (!username) {
  // Crear formulario de login
  const loginDiv = document.createElement("div");
  loginDiv.innerHTML = `
    <h1>Login</h1>
    <input type="text" id="loginUser" placeholder="Usuario">
    <button id="loginBtn">Ingresar</button>
  `;
  loginDiv.style.textAlign = "center";
  loginDiv.style.marginTop = "50px";
  document.body.appendChild(loginDiv);

  document.getElementById("loginBtn").addEventListener("click", () => {
    const input = document.getElementById("loginUser");
    if (input.value.trim() !== "") {
      localStorage.setItem("username", input.value.trim());
      username = input.value.trim();
      location.reload(); // recargar para mostrar Poker Planning
    } else {
      alert("Ingrese un usuario válido");
    }
  });
} else {
  // ======= POKER PLANNING =======

  // Crear y agregar estilos
  const style = document.createElement("style");
  style.textContent = `
  body {
    font-family: Arial, sans-serif;
    background: #f0f0f0;
    display: flex;
    justify-content: center;
    padding: 20px;
  }
  .container {
    background: #fff;
    padding: 20px;
    border-radius: 12px;
    width: 650px;
    box-shadow: 0 3px 10px rgba(0,0,0,0.2);
  }
  h1 { text-align: center; margin-bottom: 20px; }
  .player { margin: 15px 0; text-align: center; }
  .player h3 { margin-bottom: 10px; }
  .cards { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
  .card { width: 60px; height: 80px; perspective: 1000px; cursor: pointer; }
  .card-inner { width: 100%; height: 100%; text-align: center; border-radius: 10px; transition: transform 0.6s; transform-style: preserve-3d; }
  .card.selected .card-inner { transform: rotateY(0deg); }
  .card.flip .card-inner { transform: rotateY(180deg); }
  .card-front, .card-back { position: absolute; width: 60px; height: 80px; backface-visibility: hidden; border-radius: 10px; display: flex; justify-content: center; align-items: center; font-weight: bold; font-size: 1.2em; }
  .card-front { background: #eee; }
  .card-front.selected { background: #4caf50; color: #fff; }
  .card-back { background: #2196f3; color: #fff; transform: rotateY(180deg); }
  #showResults { display: block; margin: 20px auto; padding: 12px 25px; font-size: 1em; cursor: pointer; }
  #result { text-align: center; margin-top: 20px; font-weight: bold; }
  #logoutBtn { display: block; margin: 10px auto; padding: 5px 15px; cursor: pointer; }
  `;
  document.head.appendChild(style);

  // Crear contenedor principal
  const container = document.createElement("div");
  container.className = "container";
  container.innerHTML = `<h1>PeronPlanning - ${username}</h1>
    <div id="playersContainer"></div>
    <button id="showResults">Revelar Resultados</button>
    <button id="logoutBtn">Cerrar sesión</button>
    <div id="result"></div>`;
  document.body.appendChild(container);

  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("username");
    location.reload();
  });

  // Datos
  const values = [1, 2, 3, 5, 8, "?"];
  const players = [""];
  const playersContainer = document.getElementById("playersContainer");
  const resultDiv = document.getElementById("result");
  const votes = {};

  // Crear interfaz por jugador
  players.forEach(player => {
    const div = document.createElement("div");
    div.className = "player";
    const title = document.createElement("h3");
    title.textContent = player;
    div.appendChild(title);

    const cardContainer = document.createElement("div");
    cardContainer.className = "cards";

    values.forEach(value => {
      const card = document.createElement("div");
      card.className = "card";

      const inner = document.createElement("div");
      inner.className = "card-inner";

      const front = document.createElement("div");
      front.className = "card-front";
      front.textContent = value;

      const back = document.createElement("div");
      back.className = "card-back";
      back.textContent = value;

      inner.appendChild(front);
      inner.appendChild(back);
      card.appendChild(inner);

      card.addEventListener("click", () => {
        cardContainer.querySelectorAll(".card").forEach(c => {
          c.querySelector(".card-front").classList.remove("selected");
        });
        front.classList.add("selected");
        votes[player] = value;
      });

      cardContainer.appendChild(card);
    });

    div.appendChild(cardContainer);
    playersContainer.appendChild(div);
  });

  // Revelar resultados
  document.getElementById("showResults").addEventListener("click", () => {
    let total = 0;
    let count = 0;
    const voteList = [];

    players.forEach(player => {
      const v = votes[player];
      voteList.push(`${player}: ${v !== undefined ? v : "No votó"}`);
      if (typeof v === "number") {
        total += v;
        count++;
      }

      const playerDiv = Array.from(playersContainer.querySelectorAll(".player"))
        .find(p => p.querySelector("h3").textContent === player);
      playerDiv.querySelectorAll(".card").forEach(c => {
        const front = c.querySelector(".card-front");
        if (front.textContent == v) {
          c.classList.add("flip");
        }
      });
    });

    const average = count ? (total / count).toFixed(2) : "N/A";
    resultDiv.innerHTML = `<strong>Promedio:</strong> ${average}<br>${voteList.join("<br>")}`;
  });
}
