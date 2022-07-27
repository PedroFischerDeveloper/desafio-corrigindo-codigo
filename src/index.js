const express = require("express");

const { v4: uuid, validate } = require('uuid');

const app = express();

app.use(express.json());
app.use('/repositories/:id', checkUUID);

const repositories = [];

app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;

  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0,
  };

  repositories.push(repository);
  return response.status(201).json(repository)
});

app.put("/repositories/:id", checkIfRepositoryExists, (request, response) => {
  const { id } = request.params;
  const {title, url, techs} = request.body;
 
  const repositoryIndex = repositories.findIndex(repo => repo.id === id);

  if (repositoryIndex < 0) {
    return response.status(404).json({ error: "Repository not found." });
  }

  const { likes } = repositories[repositoryIndex];

  const repository = {
    id,
    title,
    url,
    techs,
    likes,
  }

  repositories[repositoryIndex] = repository;

  return response.json(repository);
});

app.delete("/repositories/:id", checkIfRepositoryExists,(request, response) => {
  const { id } = request.params;
  
  const repositoryIndex = repositories.findIndex(repository => repository.id === id);

  if (repositoryIndex < 0) {
    return response.status(404).json({ error: 'Repositorie not found.' });
  }

  repositories.splice(repositoryIndex, 1);

  return response.status(204).send();
});



app.post("/repositories/:id/like", checkIfRepositoryExists, (request, response) => {
  const { id } = request.params;

  repositoryIndex = repositories.findIndex(repository => repository.id === id);

  if (repositoryIndex < 0) {
    return response.status(404).json({ error: "Repository not found" });
  }

  const repository = repositories[repositoryIndex];

  repository.likes += 1;

  repositories[repositoryIndex] = repository;

  return response.json(repository);
});

function checkUUID(request, response, next) {
  const { id } = request.params;

  if (!validate(id)) {
    return response.status(400).json({ error: 'Invalid repository id.' });
  }

  return next();
}

function checkIfRepositoryExists(request, response, next) {
  const {id} = request.params; 

  const repository = repositories.find(repository => repository.id === id);

  if(!repository) {
    return response.status(404).json({error: 'Repository not found!'});
  }
  
  request.repository = repository

  return next()
}

module.exports = app;
