// collisions between player and snow
function circRectsOverlap(x0, y0, w0, h0, cx, cy, r) {
  let testX = cx;
  let testY = cy;
  if (testX < x0) testX = x0;
  if (testX > (x0 + w0)) testX = (x0 + w0);
  if (testY < y0) testY = y0;
  if (testY > (y0+h0)) testY = (y0 + h0);
  return (((cx - testX) * (cx - testX) + (cy - testY) * (cy - testY)) <  r * r);
}

// random int number between mon and max values
function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// refilling objects arrays
function refillObjects(count, type, objects) {
  let result = [];
  let canvasData = canvas.getBoundingClientRect();
  
  // creating new objects
  for(let i = 0; i < count; i++) {
    let kind = getKind(type);
    result.push({
      x: getRandomIntInclusive((canvasData.x + 15), (canvasData.x + canvasData.width - 15)),
      color: snow.color,
      y: 12,
      radius: objects.minRadius + objects.maxRadius * Math.random(),
      speedX: 0.4,
      speedY: (type === monsters.type) ? 1.5 : 3,
      kind: kind,
      type: type,
      image: getImage(type, kind) 
    });
  }
  
  return result;
}

// getting images of different game objects
function getImage(type, kind) {
  if(type === snow.type) {
    if(kind === game.kinds.good) {
      return "";
    }
    return snow.icicleImage;
  }
  else {
    let index = getRandomIntInclusive(0, 2);

    if(index === 0) {
      return monsters.images.redMonster;
    }
    else if(index === 1) {
      return monsters.images.blueMonster;
    }
    else {
      return monsters.images.purpleMonster;
    }
  }
}

// getting kind of objects
function getKind(type) {
  // monsters are always bad :)
  if(type === monsters.type) {
    return game.kinds.bad;
  }

  // getting random kind of snow
  let index = getRandomIntInclusive(1, 100);

  if(index <= snow.goodKindChance) {
    return game.kinds.good;
  }
  else {
    return game.kinds.bad;
  }
}

// loosing object
function looseObject(count) {
  let removedObject = game.remainsObjects.splice(0, count);
  game.loosedObjects = game.loosedObjects.concat(removedObject);
}

// drawing all game objects (except snowballs)
function drawAllObjects(objects) {
  objects.forEach(function(object) {
    if(object.image !== "") {
      drawPicture(object);
    }
    else {
      drawFilledCircle(object);
    }
  });
}

// drawing all snowballs
function drawAllSnowballs(snowballs) {
  snowballs.forEach(snowball => {
    drawFilledCircle(snowball);
  })
}

// moving all game objects (except snowballs)
function moveAllObjects(objects) {
  objects.forEach(function(object, index) {
    object.x += object.speedX;
    object.y += object.speedY;
    if(object.type === monsters.type) {
      testCollisionWithWalls(object, index, objects); 
    }
    testCollisionWithPlayer(object, index, objects);
  });
}

// moving all snowballs
function moveAllSnowballs() {
  game.snowballs.forEach(function(snowball, index) {  
    if(snowball.defaultX < snowball.mouseX) {
      snowball.x += snowball.speedX;
      snowball.y -= snowball.speedY;
    }
    else {
      snowball.x -= snowball.speedX;
      snowball.y -= snowball.speedY;
    }
   
    // collisions testing
    testCollisionWithWalls(snowball, index, game.snowballs);
    testCollisionMonsterWithSnowball(snowball, index);
  })
}

// collision with snowball and mnster testing
function testCollisionMonsterWithSnowball(snowball, snowballIndex) {
  // if now is phase with a monsters
  if(game.phase === 3) {
    game.loosedObjects.forEach(function(monster, monsterIndex) {
      if((monster.y + monster.radius > snowball.y - snowball.radius && monster.y - monster.radius < snowball.y - snowball.radius) && ((monster.x + monster.radius > snowball.x - snowball.radius && monster.x - monster.radius < snowball.x - snowball.radius) || (monster.x - monster.radius < snowball.x + snowball.radius && monster.x + monster.radius > snowball.x + snowball.radius))) {
        game.snowballs.splice(snowballIndex, 1);
        game.loosedObjects.splice(monsterIndex, 1);
      }
    });
  }
}

// collision with player testing
function testCollisionWithPlayer(object, index, objectsCollection) {
  if(circRectsOverlap(player.x, player.y, player.width, player.height, object.x, object.y, object.radius)) {
    if(object.kind === game.kinds.bad) {
      player.health--;
      changePlayerStats(player.health, game.bars.lifeBar)

      if(player.health === 0) {
        looseGame();
      }
    }
    else {
      player.collectedSnowCount++;
      changeCollectedSnowCount();
    }
    
    objectsCollection.splice(index, 1);
  }
}

// collision with walls
function testCollisionWithWalls(object, index, objects) {
  // collisions with vertical walls testing
  if((object.x + object.radius) > w) {
    objects.splice(index, 1);
  } 
  else if((object.x -object.radius) < 0 && object.type === snowball.type) {
    objects.splice(index, 1);
  }
 
  // collisions with vertical walls testing
  if((object.y + object.radius) > h) {
    // chnaging some counters if object is a monster
    if(object.type === monsters.type) {
      player.gifts--;
      changePlayerStats(player.gifts, game.bars.giftBar)
  
      if(player.gifts === 0) {
        looseGame();
      }
    }

    objects.splice(index, 1);
  } 
  else if((object.y -object.radius) < 0 && object.type === snowball.type) {
    objects.splice(index, 1);
  }  
}

// drawing player
function drawPlayer() {
  // GOOD practice: save the context, use 2D trasnformations
  ctx.save();

  let playerImage = new Image();
  playerImage.src = player.image;

  ctx.drawImage(playerImage, player.x, player.y);
  
  // GOOD practice: restore the context
  ctx.restore();
}

// drawing circle
function drawFilledCircle(c) {
  // GOOD practice: save the context, use 2D trasnformations
  ctx.save();
  
  // translate the coordinate system, draw relative to it
  ctx.translate(c.x, c.y);
  
  ctx.fillStyle = c.color;

  // (0, 0) is the top left corner
  ctx.beginPath();
  ctx.arc(0, 0, c.radius, 0, 2*Math.PI);
  ctx.fill();
 
  // GOOD practice: restore the context
  ctx.restore();
}

// drawing picture
function drawPicture(object) {
  ctx.save();

  let objectImage = new Image();
  objectImage.src = object.image;

  ctx.drawImage(objectImage, object.x, object.y);

  ctx.restore();
}

// pause the game
function changePhaseExecutingStatus() {
  game.loopStatus = !game.loopStatus;

  if(game.loopStatus) {
      game.status = game.statuses.playing;
      game.phaseTimer.resume();
      game.animationFrame = requestAnimationFrame(mainLoop);    // also resume a mainLoop
  }
  else {
      game.status = game.statuses.paused;
      game.phaseTimer.pause();
  }
}

// loose and refill objects
function looseAndRefill(objects) {
  looseObject(getRandomIntInclusive(objects.minLoosingCount, objects.maxLoosingCount));
  game.remainsObjects = refillObjects(objects.requiredCount - game.remainsObjects.length, objects.type, objects);
}

// starting new phase
function startPhase() {
  if(game.phase !== 2 || game.status === game.statuses.loosed) {
    changeTextVisibility();
  }
  
  game.status = game.statuses.playing;
  game.phase++;
}

// ending phase
function endPhase() {
  game.status = game.statuses.prepearing;

  if(game.phase === 3) {
    game.level++;
    changeGameBar(game.bars.levelBar);
    putText("Level " + game.level);
    game.phase = 1;
    changeTextVisibility();

    // change level of difficult
    monsters.minLoosingCount += 1;
    monsters.maxLoosingCount += 1;
  }
  
  if(game.phase === 2) {
    snow.goodKindChance -= 3;
  }

  changeGameBar(game.bars.phaseBar);
}

// changing game bars counters (levels and phases)
function changeGameBar(id) {
  document.getElementById(id).innerHTML = (id === game.bars.levelBar) ? "Level " + game.level : "Phase " + game.phase; 
}

// changing middle-screen text visibility
function changeTextVisibility() {
  if(document.getElementById(game.bars.middleScreenText).style.visibility === "hidden") {
      document.getElementById(game.bars.middleScreenText).style.visibility = "visible";
  }
  else {
      document.getElementById(game.bars.middleScreenText).style.visibility = "hidden";
  }
}

// putting text into the middle-screen box
function putText(text) {
  document.getElementById(game.bars.middleScreenText).innerHTML = text;
}

// updating collected snow displaying
function changeCollectedSnowCount() {
  document.getElementById(game.bars.snowflakesCount).innerHTML = player.collectedSnowCount;
}

// changing different player stats
function changePlayerStats(count, id) {
  let newHTML = "";
  let img = "";

  if(id === game.bars.lifeBar) {
    // changing hearts count
    img = game.heartImage;
  }
  else {
    // changing gifts count
    img = game.giftImage;
  }

  for(let i = 0; i < count; i++) {
    newHTML += "<img src=" + img + ">";
  }

  document.getElementById(id).innerHTML = newHTML;
}

// game loosing
function looseGame() {
  // displaying text
  putText("You loose!");
  changeTextVisibility();

  // clearing and rebooting all game parameters
  game.phaseTimer.clear();
  clearInterval(game.objectsLoosingTimer);
  cancelAnimationFrame(game.animationFrame);

  // rebooting all players options
  player.health = 3;
  player.gifts = 3;
  player.collectedSnowCount = 0;

  // clearing and updating all game's parameters
  game.status = game.statuses.loosed;
  game.remainsObjects = [];
  game.loosedObjects = [];
  game.snowballs = [];
  game.level = 1;
  game.phase = 1;
  
  // setting game default options for the level's difficult
  snow.goodKindChance = defaultGameOptions.snowGoodKindChance;
  monsters.minLoosingCount = defaultGameOptions.monstersMinLoosingCount;
  monsters.maxLoosingCount = defaultGameOptions.monstersMaxLoosingCount;

  // seting timeout for the next phase executing
  setTimeout(function() {
    // updating bars and counters
    changePlayerStats(player.health, game.bars.lifeBar);
    changePlayerStats(player.gifts, game.bars.giftBar);
    changeGameBar(game.bars.levelBar);
    changeGameBar(game.bars.phaseBar);
    changeCollectedSnowCount();

    // executing new phase
    changeTextVisibility();
    executeFirstPhase();
  }, game.phasePrepearingTime);
}

// create new snowball
function createSnowball(mouseX, mouseY) {
  // parameters for counting a speed for a snowball
  let distanceX = getDistance(player.x, mouseX);
  let distanceY = getDistance(player.y, mouseY);
  let speeds = getSpeedParameters(distanceX, distanceY);

  // new snowball object
  return {
    mouseX: mouseX,
    mouseY: mouseY,
    type: snowball.type,

    defaultX: player.x,
    defaultY: player.y,

    x: player.x,
    y: player.y,
    color: snowball.color,
    radius: snowball.radius,

    speedX: speeds[0],
    speedY: speeds[1],

    distanceX: distanceX,
    distanceY: distanceY
  }
}

// gets distances between mouse point and palyer
function getDistance(firstPoint, secondPoint) {
  if(secondPoint > firstPoint) {
    return secondPoint - firstPoint;
  }
  return firstPoint - secondPoint;
}

// gets speeds which depends of distances
function getSpeedParameters(distanceX, distanceY) {
  let result = [];

  if(distanceX > distanceY) {
    let iterationsCount = distanceX / snowball.normalSpeed;
    
    result.push(snowball.normalSpeed);
    result.push(distanceY / iterationsCount);
  }
  else {
    let iterationsCount = distanceY / snowball.normalSpeed;
    
    result.push(distanceX / iterationsCount);
    result.push(snowball.normalSpeed);
  }

  return result;
}