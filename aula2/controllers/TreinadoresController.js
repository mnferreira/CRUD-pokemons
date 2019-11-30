const { connect } = require('../models/Repository')
const treinadoresModel = require('../models/TreinadoresSchema')
const { pokemonsModel } = require('../models/PokemonsSchema')
const bcrypt = require('bcryptjs')

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
  const senhaCriptografada = bcrypt.hashSync(request.body.senha) //hashSync indica que a função é síncrona
  request.body.senha = senhaCriptografada //o body irá conter a senha criptografada ao invés da senha que o usuário coloca
  const novoTreinador = new treinadoresModel(request.body)

  novoTreinador.save((error) => {
    if (error) {
      return response.status(500).send(error)
    }

    return response.status(201).send(novoTreinador)
  })
}

//Para não alterar o objeto original:
// const add = (request, response) => {
//   const senhaCriptografada = bcrypt.hashSync(request.body.senha) //hashSync indica que a função é síncrona
//   const novoObj = New Object (request.body)
//   novoObj.senha = senhaCriptografada //o body irá conter a senha criptografada ao invés da senha que o usuário coloca
//   const novoTreinador = new treinadoresModel(request.body)

//   novoTreinador.save((error) => {
//     if (error) {
//       return response.status(500).send(error)
//     }

//     return response.status(201).send(novoTreinador)
//   })
// }

const login = async (request, response) => {
  const email = request.body.email
  const senha = request.body.senha
  const treinador = await treinadoresModel.findOne({email})
  if (!treinador){
    return response.status(404).send('email inválido')
  }

  const senhaValida = bcrypt.compareSync(senha, treinador.senha) // compareSync = compara uma senha hasheriada e outra não

  if (senhaValida) {
    return response.status(200).send('usuário logado')
  }
  return response.status(401).send('senha inválidos')
}

// 401 - unauthorized - usuário não autenticado
// 403 - forbidden - usuário não permitido a acessar a página, porém autenticado

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
    {_id: id},
    { $set: { 
      'treinadoresModel.$.nome': treinadores.nome,
      'treinadoresModel.$.foto': treinadores.foto,
      'treinadoresModel.$.pokemons': treinadores.pokemons
    }},
    (error, treinador) => {
      if (error) {
        return response.status(500).send(error)
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
  const pokemon = treinador.pokemons.find((pokemon) => {
    return pokemonId == pokemon._id
  
  })  //Obs: pokemon._id é um ObjectId (tipo do MongoDB)

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
    const pokemonId = request.params.pokemonId

    treinadoresModel.findByOneAndUpdate( 
      {_id: treinadorId, 'pokemons.$._id': pokemonId}, //filtros (query) que identificam o id que vamos atualizar
      //pokemon,  - dessa maneira atualiza todas as propriedades
      { $set: { //desta maneira se passa os campos que pretende atualizar. SET (set operator) é usado em arrays, quando não se sabe ao certo o índice dentro do array que se pretende atualizar
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
  updatePokemon,
  login
}
