const { connect } = require('../models/Repository')
const treinadoresModel = require('../models/TreinadoresSchema')
const { pokemonsModel } = require('../models/PokemonsSchema')

connect()

const getAll = (request, response) => {
  treinadoresModel.find((error, treinadores) => {
    if (error) {
      return response.status(500).send(error)
    }

    return response.status(200).send(treinadores)
  })
}

const getById = (request, response) => {
  const id = request.params.id

  return treinadoresModel.findById(id, (error, treinador) => {
    if (error) {
      return response.status(500).send(error)
    }

    if (treinador) {
      return response.status(200).send(treinador)
    }

    return response.status(404).send('Treinador não encontrado.')
  })
}

const add = (request, response) => {
  const novoTreinador = new treinadoresModel(request.body)

  novoTreinador.save((error) => {
    if (error) {
      return response.status(500).send(error)
    }

    return response.status(201).send(novoTreinador)
  })
}

const remove = (request, response) => {
  const id = request.params.id

  treinadoresModel.findByIdAndDelete(id, (error, treinador) => {
    if (error) {
      return response.status(500).send(error)
    }

    if (treinador) {
      return response.status(200).send(id)
    }

    return response.status(404).send('Treinador não encontrado.')
  })
}

const update = (request, response) => {
  const id = request.params.id
  const treinadorUpdate = request.body
  const options = { new: true }

  treinadoresModel.findByIdAndUpdate(
    id,
    treinadorUpdate,
    options,
    (error, treinador) => {
      if (error) {
        return response.status(500).sned(error)
      }

      if (treinador) {
        return response.status(200).send(treinador)
      }

      return response.status(404).send('Treinador não encontrado.')
    }
  )
}

const addPokemon = async (request, response) => {
  const treinadorId = request.params.treinadorId
  const pokemon = request.body
  const options = { new: true }
  const novoPokemon = new pokemonsModel(pokemon)
  const treinador = await treinadoresModel.findById(treinadorId)

  treinador.pokemons.push(novoPokemon)
  treinador.save((error) => {
    if (error) {
      return response.status(500).send(error)
    }

    return response.status(201).send(treinador)
  })
}

const calcularNivel = (inicio, fim, nivelAtual) => {
  const novoNivel = (Math.abs(new Date(inicio) - new Date(fim)) / 3600000) / 4

  return novoNivel + nivelAtual;
}

const treinarPokemon = async (request, response) => {
  const treinadorId = request.params.treinadorId
  const pokemonId = request.params.pokemonId
  const inicio = request.body.inicio
  const fim = request.body.fim
  const treinador = await treinadoresModel.findById(treinadorId)
  const pokemon = treinador.pokemons.find((pokemon) => pokemonId == pokemon._id)
  const novoNivel = calcularnNivel(inicio, fim, pokemon.nivel)

  pokemon.nivel = novoNivel
  treinador.save((error) => {
    if (error) {
      return response.status(500).send(error)
    }

    return response.status(200).send(treinador)
  })
}

const buscarPokemon = async (request,response) => {
  const treinadorId = request.params.treinadorId
  const pokemonId = request.params.pokemonId

  const treinador = await treinadoresModel.findById(treinadorId)
  const pokemon = treinador.pokemons.find((pokemon) => pokemonId == pokemon._id)  //Obs: pokemon._id é um ObjectId (tipo do MongoDB)

  if (!pokemon) {
    return response.status(500).send("error")
  }

  return response.status(200).send(pokemon)
  }

  const getAllPokemons = async (request, response) => {
    const treinadorId = request.params.treinadorId
    const treinador = await treinadoresModel.findById(treinadorId)
  
    if (treinador) {
      return response.status(200).send(treinador.pokemons)
  }
      return response.status(404).send("treinador não encontrado")
  }


  const updatePokemon = (request, response) => {
    const treinadorId = request.params.treinadorId
    const PokemonId = request.params.pokemonId

    treinadoresModel.findByOneAndUpdate( 
      {_id: treinadorId, 'pokemons.$._id': pokemonId}, //filtros que identificam o id que vamos atualizar
      { $set: { //desta maneira se passa os campos que pretende atualizar. SET é usado em arrays, quando não se sabe ao certo a posição
        'pokemons.$.nome': pokemon.nome,
        'pokemons.$.foto': pokemon.foto
      }},
      {new: true},
      (error, treinador) => {
        if (error) {
          return response.status(200).send(error)
        }
          return response.status(200).send(treinador)
      })
  }


module.exports = {
  getAll,
  getById,
  add,
  remove,
  update,
  addPokemon, 
  treinarPokemon,
  buscarPokemon,
  getAllPokemons,
  updatePokemon
}
