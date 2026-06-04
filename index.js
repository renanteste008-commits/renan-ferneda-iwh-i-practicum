// Arquivo index.js

// Carrega as variáveis de ambiente do arquivo .env
// Ex: PRIVATE_APP_TOKEN e OBJECT_TYPE_ID
require("dotenv").config();

// Importação das dependências principais
const express = require("express"); // Framework para criar o servidor web
const axios = require("axios");     // Cliente HTTP para chamadas à API do HubSpot
const path = require("path");       // Utilitário para lidar com caminhos de pastas

// Inicializa o app Express
const app = express();

// Permite ler dados enviados via formulário (POST)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ------------------------------------------------------------
// CONFIGURAÇÃO DO TEMPLATE ENGINE (PUG)
// ------------------------------------------------------------

// Define o Pug como engine de views
app.set("view engine", "pug");

// Define onde ficam os arquivos .pug
app.set("views", path.join(__dirname, "views"));

// ------------------------------------------------------------
// CONFIGURAÇÕES DO HUBSPOT
// ------------------------------------------------------------

// Token do Private App do HubSpot
const HUBSPOT_TOKEN = process.env.PRIVATE_APP_TOKEN;

// Custom Object ID
const CUSTOM_OBJECT = process.env.OBJECT_TYPE_ID;

// Logs apenas para debug (confirmar se carregou corretamente)
console.log("TOKEN:", HUBSPOT_TOKEN ? "OK" : "NÃO CARREGOU");
console.log("OBJECT:", CUSTOM_OBJECT);

// ------------------------------------------------------------
// 9. GET /update-cobj
// Renderiza o formulário para criar um novo registro
// ------------------------------------------------------------
app.get("/update-cobj", (req, res) => {
  res.render("updates", {
    title: "Update Custom Object Form | Integrating With HubSpot I Practicum",
  });
});

// ------------------------------------------------------------
// 10. POST /update-cobj
// Recebe os dados do formulário e cria um novo registro
// no Custom Object do HubSpot
// ------------------------------------------------------------
app.post("/update-cobj", async (req, res) => {
  // Dados vindos do formulário (***SUBSTITUIR PELAS PROPRIEDADES QUE VOCÊ CRIOU***)
  const nome = Array.isArray(req.body.nome) ? req.body.nome[0] : req.body.nome;
  const marca = Array.isArray(req.body.marca) ? req.body.marca[0] : req.body.marca;
  const ano = Array.isArray(req.body.ano) ? req.body.ano[0] : req.body.ano;

  try {
    // Chamada à API do HubSpot para criar um registro
    await axios.post(
      `https://api.hubapi.com/crm/v3/objects/${CUSTOM_OBJECT}`,
      {
        properties: {
          // Estes nomes DEVEM ser os INTERNAL NAMES
          // das propriedades do Custom Object (***SUBSTITUIR PELO OS QUE VOCÊ CRIOU***)
          nome: nome,
          marca: marca,
          ano: ano,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${HUBSPOT_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Após criar o registro, volta para a homepage
    return res.redirect("/");
  } catch (error) {
    console.error(error.response?.data || error);
    return res.status(500).send("Erro ao criar registro.");
  }
});

// ------------------------------------------------------------
// 11. GET /
// Homepage → lista todos os registros do Custom Object
// ------------------------------------------------------------
app.get("/", async (req, res) => {
  try {
    // Busca registros do Custom Object (***SUBSTITUIR NO FINAL DA URL PELO OS QUE VOCÊ CRIOU***)
    const response = await axios.get(
      `https://api.hubapi.com/crm/v3/objects/${CUSTOM_OBJECT}?properties=nome,marca,ano`,
      {
        headers: {
          Authorization: `Bearer ${HUBSPOT_TOKEN}`,
        },
      }
    );

    // Array de registros retornados pelo HubSpot
    const items = response.data.results;

    // Renderiza a homepage e envia os dados para o template
    return res.render("homepage", {
      title: "Homepage",
      items: items,
    });
  } catch (error) {
    console.error(error.response?.data || error);
    return res.status(500).send("Erro ao buscar registros.");
  }
});

// ------------------------------------------------------------
// INICIALIZA O SERVIDOR
// ------------------------------------------------------------
app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});