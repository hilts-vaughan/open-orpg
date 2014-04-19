#
# The gameplay state is where the core gameplay of the game runs.
# This has everything required to run. operate, and update the game world.
#
# There should only ever be one of these states in existance.
#

PacketTypes = require('./../../Infrastructure/PacketTypes.coffee')
Player = require('../Entities/Player.coffee')
Entity = require('../../Infrastructure/Entities/Entity.coffee')
DirectoryHelper = require('../../Infrastructure/DirectoryHelper.coffee')
MovementSystem = require ('./../World/Systems/MovementSystem.coffee')
SpriteManager = require('./../Resources/SpriteManager.coffee')

module.exports =
  class GameplayState

    constructor: (game) ->
      @game = game
      @game.entities = {}

      @systems = []      
      @toRemove = []

    create: ->
      @game.physics.startSystem(Phaser.Physics.ARCADE)
      self = this
      self.map = self.game.add.tilemap("map_1")
      self.map.addTilesetImage "tilesheet"

      $.each self.map.layers, (key, value) ->
        layer = self.map.createLayer(value.name)
        layer.resizeWorld()        
     
      @game.net.registerPacket PacketTypes.SMSG_MOB_CREATE, (packet) =>
        entity = packet.mobile
        oEntity = new Entity(@game, 0, 0)
        oEntity.mergeWith(entity)
        @game.entities[oEntity.id] = oEntity
        @game.add.existing(oEntity)

        for k,v of entity
          oEntity.propertyChanged(k, v)

      @game.net.registerPacket PacketTypes.SMSG_MOB_DESTROY, (packet) =>
        @toRemove.push(packet.id)        

      @game.net.registerPacket PacketTypes.SMSG_ZONE_CHANGED, (packet) =>
        console.log("Got a zone change: ")
        console.log(packet)
        for entity in packet.entities          
          oEntity = new Entity(@game, 0, 0)
          oEntity.mergeWith(entity)
          @game.entities[oEntity.id] = oEntity
          @game.add.existing(oEntity)

          # Fire off the handlers as needed
          for k,v of entity
            console.log(k)
            console.log(v)
            oEntity.propertyChanged(k, v)

          if oEntity.id is packet.heroId
            @game.camera.follow oEntity
            movementSystem = new MovementSystem(@game, oEntity)
            @systems.push(movementSystem)          

      @game.net.registerPacket PacketTypes.SMSG_ENTITY_PROPERTY_CHANGE, (packet) =>
        
        # Sync our entity collection here
        entity = @game.entities[packet.entityId]
        entity.mergeWith(packet.properties)

        for k,v of packet.properties
          entity.propertyChanged(k, v) 


    update: ->
      for remove in @toRemove
        @game.entities[remove].spriteText.destroy()
        @game.entities[remove].destroy()
        delete @game.entities[remove]
      @toRemove = []

      for system in @systems
        system.update()




    preload: ->
      @game.load.tilemap "map_1", "assets/Maps/1.json", null, Phaser.Tilemap.TILED_JSON
      @game.load.image "tilesheet", "assets/Maps/tilesheet_16.png"
      SpriteManager.loadSpriteImages(@game)